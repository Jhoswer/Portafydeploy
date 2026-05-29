<?php

namespace App\Services;

use App\Models\Usuario;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class BackupService
{
    private const BACKUP_DIR = 'backups/database';

    public function listBackups(Usuario $actor): array
    {
        $this->assertCanManageBackups($actor);

        $disk = Storage::disk('local');
        $disk->makeDirectory(self::BACKUP_DIR);

        return collect($disk->files(self::BACKUP_DIR))
            ->filter(fn (string $path) => $this->isBackupFile($path))
            ->map(fn (string $path) => $this->backupMetadata($path))
            ->sortByDesc(fn (array $backup) => $backup['modified_at'] ?? 0)
            ->values()
            ->all();
    }

    public function generateBackup(Usuario $actor): array
    {
        $this->assertCanManageBackups($actor);
        @set_time_limit(0);
        @ini_set('max_execution_time', '0');

        $disk = Storage::disk('local');
        $disk->makeDirectory(self::BACKUP_DIR);

        $driver = DB::connection()->getDriverName();
        $timestamp = now()->format('Ymd_His');

        if ($driver === 'sqlite') {
            return $this->generateSqliteBackup($disk, $timestamp);
        }

        if ($driver === 'pgsql') {
            return $this->generatePostgresBackup($disk, $timestamp);
        }

        if (! in_array($driver, ['mysql', 'mariadb'], true)) {
            throw new RuntimeException('El respaldo automatico solo esta soportado para MySQL, MariaDB, PostgreSQL o SQLite.');
        }

        return $this->generateSqlDumpBackup($disk, $timestamp);
    }

    public function restoreBackup(Usuario $actor, string $filename): array
    {
        $this->assertCanManageBackups($actor);
        @set_time_limit(0);
        @ini_set('max_execution_time', '0');

        $path = $this->resolveBackupPath($filename);
        $disk = Storage::disk('local');

        if (! $disk->exists($path)) {
            throw new RuntimeException('El archivo de backup no existe.');
        }

        $driver = DB::connection()->getDriverName();
        $backupExtension = pathinfo($path, PATHINFO_EXTENSION);

        if ($driver === 'sqlite' && $backupExtension !== 'sqlite') {
            throw new RuntimeException('El backup seleccionado no corresponde a una base de datos SQLite.');
        }

        if (in_array($driver, ['mysql', 'mariadb', 'pgsql'], true) && $backupExtension !== 'sql') {
            throw new RuntimeException('El backup seleccionado no corresponde al motor de base de datos actual.');
        }

        try {
            $startedAt = microtime(true);
            Log::info('backup.restore.phase', [
                'phase' => 'start',
                'filename' => $filename,
                'driver' => $driver,
            ]);

            $debugBefore = config('app.debug') ? $this->buildRestoreDebugSnapshot($driver) : null;

            $safetyStartedAt = microtime(true);
            $safetyBackup = $this->generateRestoreSafetyBackup($actor);
            Log::info('backup.restore.phase', [
                'phase' => 'safety_backup_created',
                'filename' => $filename,
                'driver' => $driver,
                'elapsed_ms' => (int) round((microtime(true) - $safetyStartedAt) * 1000),
                'safety_backup' => $safetyBackup['filename'] ?? null,
            ]);

            $restoreStartedAt = microtime(true);
            if ($driver === 'sqlite') {
                $this->restoreSqliteBackup($disk->path($path));
            } elseif ($driver === 'pgsql') {
                $this->restorePostgresDump($disk->path($path));
            } elseif (in_array($driver, ['mysql', 'mariadb'], true)) {
                $this->restoreSqlDump($disk->path($path), $driver);
            } else {
                throw new RuntimeException('Driver de base de datos no soportado para restauracion.');
            }
            Log::info('backup.restore.phase', [
                'phase' => 'backup_applied',
                'filename' => $filename,
                'driver' => $driver,
                'elapsed_ms' => (int) round((microtime(true) - $restoreStartedAt) * 1000),
            ]);

            $cleanupStartedAt = microtime(true);
            $this->postRestoreCleanup();
            Log::info('backup.restore.phase', [
                'phase' => 'cleanup_finished',
                'filename' => $filename,
                'driver' => $driver,
                'elapsed_ms' => (int) round((microtime(true) - $cleanupStartedAt) * 1000),
            ]);

            $debugAfter = config('app.debug') ? $this->buildRestoreDebugSnapshot($driver) : null;

            $result = [
                'restored_backup' => $this->backupMetadata($path),
                'safety_backup' => $safetyBackup,
            ];

            if ($debugBefore !== null || $debugAfter !== null) {
                $result['debug'] = [
                    'driver' => $driver,
                    'database' => DB::connection()->getDatabaseName(),
                    'before' => $debugBefore,
                    'after' => $debugAfter,
                ];
            }

            Log::info('backup.restore.phase', [
                'phase' => 'success',
                'filename' => $filename,
                'driver' => $driver,
                'elapsed_ms' => (int) round((microtime(true) - $startedAt) * 1000),
            ]);

            return $result;
        } catch (Throwable $e) {
            Log::error('backup.restore.phase', [
                'phase' => 'failed',
                'filename' => $filename,
                'driver' => $driver,
                'message' => $e->getMessage(),
                'exception' => $e::class,
            ]);

            throw $e;
        } finally {
            try {
                DB::disconnect();
                DB::purge();
            } catch (Throwable) {
                // La siguiente request reabrira la conexion si hace falta.
            }
        }
    }

    private function postRestoreCleanup(): void
    {
        try {
            Cache::flush();
        } catch (Throwable) {
            // Si el cache store no responde, no bloqueamos la restauracion.
        }

        try {
            DB::disconnect();
            DB::purge();
            DB::reconnect();
        } catch (Throwable) {
            // La siguiente request abrira una nueva conexion si es necesario.
        }
    }

    private function buildRestoreDebugSnapshot(string $driver): array
    {
        if ($driver !== 'pgsql') {
            return [
                'table_count' => count($this->listDatabaseTables($driver)),
            ];
        }

        $tables = [
            'USER',
            'PROFILE',
            'PUBLICATION',
            'PROJECT',
            'OFFER',
            'ATTENDED',
            'REPORT',
            'LOG',
        ];

        $existingTables = collect($this->listDatabaseTables('pgsql'))
            ->map(fn (string $table) => strtoupper($table))
            ->all();

        $counts = [];

        foreach ($tables as $table) {
            if (! in_array($table, $existingTables, true)) {
                continue;
            }

            try {
                $counts[$table] = DB::table($table)->count();
            } catch (Throwable) {
                $counts[$table] = null;
            }
        }

        return [
            'table_count' => count($existingTables),
            'counts' => $counts,
        ];
    }

    public function deleteBackup(Usuario $actor, string $filename): void
    {
        $this->assertCanDeleteBackups($actor);

        $path = $this->resolveBackupPath($filename);
        $disk = Storage::disk('local');

        if (! $disk->exists($path)) {
            throw new RuntimeException('El archivo de backup no existe.');
        }

        $disk->delete($path);
    }

    public function downloadBackupPath(Usuario $actor, string $filename): string
    {
        $this->assertCanManageBackups($actor);

        $path = $this->resolveBackupPath($filename);

        if (! Storage::disk('local')->exists($path)) {
            throw new RuntimeException('El archivo de backup no existe.');
        }
        return Storage::disk('local')->path($path);
    }

    public function canDeleteBackups(Usuario $actor): bool
    {
        return $this->isSuperAdmin($actor);
    }

    private function generateSqliteBackup($disk, string $timestamp, string $prefix = 'backup-db'): array
    {
        $connection = DB::connection();
        $sourcePath = (string) $connection->getDatabaseName();

        if ($sourcePath === '' || ! is_file($sourcePath)) {
            throw new RuntimeException('No se encontro el archivo de la base de datos SQLite.');
        }

        $suffix = bin2hex(random_bytes(3));
        $filename = $this->buildBackupFilename($prefix, $timestamp, $suffix, 'sqlite');
        $relativePath = self::BACKUP_DIR . '/' . $filename;
        $absolutePath = $disk->path($relativePath);

        if (! @copy($sourcePath, $absolutePath)) {
            throw new RuntimeException('No se pudo copiar la base de datos SQLite.');
        }

        return $this->backupMetadata($relativePath);
    }

    private function generateSqlDumpBackup($disk, string $timestamp, string $prefix = 'backup-db'): array
    {
        $suffix = bin2hex(random_bytes(3));
        $filename = $this->buildBackupFilename($prefix, $timestamp, $suffix, 'sql');
        $relativePath = self::BACKUP_DIR . '/' . $filename;
        $absolutePath = $disk->path($relativePath);
        $handle = @fopen($absolutePath, 'wb');

        if ($handle === false) {
            throw new RuntimeException('No se pudo crear el archivo de backup.');
        }

        try {
            $this->writeSqlDump($handle);
        } catch (Throwable $e) {
            fclose($handle);
            @unlink($absolutePath);
            throw $e;
        }

        fclose($handle);

        return $this->backupMetadata($relativePath);
    }

    private function generatePostgresBackup($disk, string $timestamp, string $prefix = 'backup-db'): array
    {
        $suffix = bin2hex(random_bytes(3));
        $filename = $this->buildBackupFilename($prefix, $timestamp, $suffix, 'sql');
        $relativePath = self::BACKUP_DIR . '/' . $filename;
        $absolutePath = $disk->path($relativePath);
        $handle = @fopen($absolutePath, 'wb');

        if ($handle === false) {
            throw new RuntimeException('No se pudo crear el archivo de backup.');
        }

        try {
            $this->writePostgresDump($handle);
        } catch (Throwable $e) {
            fclose($handle);
            @unlink($absolutePath);
            throw $e;
        }

        fclose($handle);

        return $this->backupMetadata($relativePath);
    }

    private function generateRestoreSafetyBackup(Usuario $actor): array
    {
        $this->assertCanManageBackups($actor);

        $disk = Storage::disk('local');
        $disk->makeDirectory(self::BACKUP_DIR);

        $driver = DB::connection()->getDriverName();
        $timestamp = now()->format('Ymd_His');
        $prefix = 'backup_before_restore_db';

        if ($driver === 'sqlite') {
            return $this->generateSqliteBackup($disk, $timestamp, $prefix);
        }

        if ($driver === 'pgsql') {
            return $this->generatePostgresBackup($disk, $timestamp, $prefix);
        }

        if (! in_array($driver, ['mysql', 'mariadb'], true)) {
            throw new RuntimeException('El respaldo automatico solo esta soportado para MySQL, MariaDB, PostgreSQL o SQLite.');
        }

        return $this->generateSqlDumpBackup($disk, $timestamp, $prefix);
    }

    private function restoreSqliteBackup(string $backupPath): void
    {
        $connection = DB::connection();
        $sourcePath = (string) $connection->getDatabaseName();

        if ($sourcePath === '') {
            throw new RuntimeException('No se encontro la ruta de la base de datos SQLite.');
        }

        DB::disconnect();

        try {
            $sourceDirectory = dirname($sourcePath);
            if (! is_dir($sourceDirectory)) {
                throw new RuntimeException('No se encontro el directorio de la base de datos SQLite.');
            }

            if (! @copy($backupPath, $sourcePath)) {
                throw new RuntimeException('No se pudo restaurar la base de datos SQLite.');
            }
        } finally {
            clearstatcache(true, $sourcePath);
            DB::purge();
            DB::reconnect();
        }
    }

    private function restoreSqlDump(string $backupPath, string $driver): void
    {
        $sql = @file_get_contents($backupPath);

        if ($sql === false || trim($sql) === '') {
            throw new RuntimeException('No se pudo leer el archivo de backup.');
        }

        $restoreEngine = in_array($driver, ['mysql', 'mariadb'], true);

        try {
            foreach ($this->splitSqlStatements($sql) as $statement) {
                $normalized = trim($statement);

                if ($normalized === '') {
                    continue;
                }

                DB::unprepared($normalized);
            }
        } catch (Throwable $e) {
            if ($driver === 'pgsql') {
                try {
                    DB::statement('ROLLBACK');
                } catch (Throwable) {
                    // Si el rollback falla, conservamos el error original.
                }
            }

            throw $e;
        } finally {
            if ($restoreEngine) {
                DB::statement('SET FOREIGN_KEY_CHECKS=1');
            }
        }
    }

    private function restorePostgresDump(string $backupPath): void
    {
        $sql = @file_get_contents($backupPath);

        if ($sql === false || trim($sql) === '') {
            throw new RuntimeException('No se pudo leer el archivo de backup.');
        }

        $statements = $this->splitSqlStatements($sql);
        $backupTables = $this->extractPostgresBackupTables($sql);
        $backupSequences = $this->extractPostgresBackupSequences($sql);
        $backupIncludesFunctions = preg_match('/^-- Function\|/m', $sql) === 1;
        $backupIncludesTriggers = preg_match('/^-- Trigger\|/m', $sql) === 1;
        $backupFunctions = $this->extractPostgresBackupFunctions($sql);
        $backupTriggers = $this->extractPostgresBackupTriggers($sql);
        $currentTables = $this->listDatabaseTables('pgsql');
        $currentSequences = $this->listDatabaseSequences();
        $dropTableStatements = [];
        $sequenceStatements = [];
        $otherStatements = [];

        foreach ($statements as $statement) {
            $normalized = trim($statement);

            if ($normalized === '') {
                continue;
            }

            $upper = strtoupper($normalized);
            if ($upper === 'BEGIN' || $upper === 'BEGIN TRANSACTION' || $upper === 'COMMIT') {
                continue;
            }

            if (preg_match('/^DROP\s+TABLE\s+IF\s+EXISTS\s+/i', $normalized) === 1) {
                $dropTableStatements[] = $normalized;
                continue;
            }

            if (preg_match('/^CREATE\s+SEQUENCE\s+IF\s+NOT\s+EXISTS\s+/i', $normalized) === 1) {
                $sequenceStatements[] = $normalized;
                continue;
            }

            $otherStatements[] = $normalized;
        }

        DB::beginTransaction();

        try {
            DB::statement('SET search_path TO public');

            foreach ($dropTableStatements as $statement) {
                DB::unprepared($statement);
            }

            foreach (array_diff($currentTables, $backupTables) as $table) {
                DB::statement('DROP TABLE IF EXISTS ' . $this->postgresQualifiedIdentifier('public.' . $table) . ' CASCADE');
            }

            foreach (array_diff($currentSequences, $backupSequences) as $sequence) {
                DB::statement('DROP SEQUENCE IF EXISTS ' . $this->postgresQualifiedIdentifier('public.' . $sequence) . ' CASCADE');
            }

            if ($backupIncludesTriggers) {
                foreach ($this->listDatabaseTriggers() as $trigger) {
                    $triggerKey = $this->postgresTriggerKey(
                        (string) ($trigger['schema'] ?? 'public'),
                        (string) ($trigger['trigger_name'] ?? ''),
                        (string) ($trigger['table_name'] ?? '')
                    );

                    if (in_array($triggerKey, $backupTriggers, true)) {
                        continue;
                    }

                    $triggerName = (string) ($trigger['trigger_name'] ?? '');
                    $tableName = (string) ($trigger['table_name'] ?? '');

                    if ($triggerName === '' || $tableName === '') {
                        continue;
                    }

                    DB::statement(
                        'DROP TRIGGER IF EXISTS ' . $this->postgresQuoteIdentifier($triggerName) .
                        ' ON ' . $this->postgresQualifiedIdentifier('public.' . $tableName) . ' CASCADE'
                    );
                }
            }

            if ($backupIncludesFunctions) {
                foreach ($this->listDatabaseFunctions() as $function) {
                    $functionKey = $this->postgresFunctionKey(
                        (string) ($function['schema'] ?? 'public'),
                        (string) ($function['function_name'] ?? ''),
                        (string) ($function['identity_arguments'] ?? '')
                    );

                    if (in_array($functionKey, $backupFunctions, true)) {
                        continue;
                    }

                    $functionName = (string) ($function['function_name'] ?? '');
                    $identityArguments = (string) ($function['identity_arguments'] ?? '');

                    if ($functionName === '') {
                        continue;
                    }

                    DB::statement(
                        'DROP FUNCTION IF EXISTS ' .
                        $this->postgresFunctionQualifiedName('public', $functionName, $identityArguments) .
                        ' CASCADE'
                    );
                }
            }

            foreach ($sequenceStatements as $statement) {
                DB::unprepared($statement);
            }

            foreach ($otherStatements as $statement) {
                DB::unprepared($statement);
            }

            $this->reseedPostgresSequences();

            DB::commit();
        } catch (Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function extractPostgresBackupTables(string $sql): array
    {
        preg_match_all('/^-- Table "public"\."([^"]+)"/m', $sql, $matches);

        return collect($matches[1] ?? [])
            ->map(fn ($table) => (string) $table)
            ->filter()
            ->values()
            ->all();
    }

    private function extractPostgresBackupSequences(string $sql): array
    {
        preg_match_all('/^CREATE SEQUENCE IF NOT EXISTS "public"\."([^"]+)"/m', $sql, $matches);

        return collect($matches[1] ?? [])
            ->map(fn ($sequence) => (string) $sequence)
            ->filter()
            ->values()
            ->all();
    }

    private function extractPostgresBackupFunctions(string $sql): array
    {
        preg_match_all('/^-- Function\|([^\|]+)\|([^\|]+)\|(.*)$/m', $sql, $matches, PREG_SET_ORDER);

        return collect($matches)
            ->map(fn (array $match) => $this->postgresFunctionKey(
                (string) ($match[1] ?? 'public'),
                (string) ($match[2] ?? ''),
                (string) ($match[3] ?? '')
            ))
            ->filter()
            ->values()
            ->all();
    }

    private function extractPostgresBackupTriggers(string $sql): array
    {
        preg_match_all('/^-- Trigger\|([^\|]+)\|([^\|]+)\|([^\|]+)$/m', $sql, $matches, PREG_SET_ORDER);

        return collect($matches)
            ->map(fn (array $match) => $this->postgresTriggerKey(
                (string) ($match[1] ?? 'public'),
                (string) ($match[2] ?? ''),
                (string) ($match[3] ?? '')
            ))
            ->filter()
            ->values()
            ->all();
    }

    private function listDatabaseSequences(): array
    {
        $schema = $this->postgresSchema();

        return collect(DB::select(
            'select sequence_name
             from information_schema.sequences
             where sequence_schema = ?
             order by sequence_name',
            [$schema]
        ))
            ->map(fn ($row) => (string) ($row->sequence_name ?? ''))
            ->filter()
            ->values()
            ->all();
    }

    private function listDatabaseFunctions(): array
    {
        $schema = $this->postgresSchema();

        return collect(DB::select(
            'select n.nspname as schema_name,
                    p.proname as function_name,
                    pg_get_function_identity_arguments(p.oid) as identity_arguments,
                    pg_get_functiondef(p.oid) as definition
             from pg_proc p
             join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = ? and p.prokind = \'f\'
             order by p.proname, pg_get_function_identity_arguments(p.oid)',
            [$schema]
        ))
            ->map(fn ($row) => [
                'schema' => (string) ($row->schema_name ?? 'public'),
                'function_name' => (string) ($row->function_name ?? ''),
                'identity_arguments' => (string) ($row->identity_arguments ?? ''),
                'definition' => (string) ($row->definition ?? ''),
            ])
            ->filter(fn (array $function) => $function['function_name'] !== '' && $function['definition'] !== '')
            ->values()
            ->all();
    }

    private function listDatabaseTriggers(): array
    {
        $schema = $this->postgresSchema();

        return collect(DB::select(
            'select n.nspname as schema_name,
                    c.relname as table_name,
                    t.tgname as trigger_name,
                    pg_get_triggerdef(t.oid, true) as definition
             from pg_trigger t
             join pg_class c on c.oid = t.tgrelid
             join pg_namespace n on n.oid = c.relnamespace
             where n.nspname = ? and not t.tgisinternal
             order by c.relname, t.tgname',
            [$schema]
        ))
            ->map(fn ($row) => [
                'schema' => (string) ($row->schema_name ?? 'public'),
                'table_name' => (string) ($row->table_name ?? ''),
                'trigger_name' => (string) ($row->trigger_name ?? ''),
                'definition' => (string) ($row->definition ?? ''),
            ])
            ->filter(fn (array $trigger) => $trigger['trigger_name'] !== '' && $trigger['table_name'] !== '' && $trigger['definition'] !== '')
            ->values()
            ->all();
    }

    private function reseedPostgresSequences(): void
    {
        $schema = $this->postgresSchema();
        $tables = $this->listDatabaseTables('pgsql');

        foreach ($tables as $table) {
            foreach ($this->postgresSerialColumns($schema, $table) as $columnInfo) {
                $sequenceName = $columnInfo['sequence_name'] ?? null;
                $columnName = $columnInfo['column_name'] ?? null;

                if (! is_string($sequenceName) || $sequenceName === '' || ! is_string($columnName) || $columnName === '') {
                    continue;
                }

                $qualifiedTable = $this->postgresQualifiedIdentifier($schema . '.' . $table);
                $quotedColumn = $this->postgresQuoteIdentifier($columnName);

                DB::statement(
                    'SELECT setval(?, COALESCE((SELECT MAX(' . $quotedColumn . ") FROM {$qualifiedTable}), 1), EXISTS(SELECT 1 FROM {$qualifiedTable}))",
                    [$sequenceName]
                );
            }
        }
    }

    private function splitSqlStatements(string $sql): array
    {
        $statements = [];
        $buffer = '';
        $length = strlen($sql);
        $inSingle = false;
        $inDouble = false;
        $inBacktick = false;
        $inLineComment = false;
        $inBlockComment = false;
        $atLineStart = true;

        for ($i = 0; $i < $length; $i++) {
            $char = $sql[$i];
            $next = $i + 1 < $length ? $sql[$i + 1] : null;

            if ($inLineComment) {
                if ($char === "\n") {
                    $inLineComment = false;
                }

                continue;
            }

            if ($inBlockComment) {
                if ($char === '*' && $next === '/') {
                    $inBlockComment = false;
                    $i++;
                }

                continue;
            }

            if (! $inSingle && ! $inDouble && ! $inBacktick) {
                if ($char === '-' && $next === '-' && $atLineStart) {
                    $inLineComment = true;
                    $i++;
                    continue;
                }

                if ($char === '#') {
                    $inLineComment = true;
                    continue;
                }

                if ($char === '/' && $next === '*') {
                    $inBlockComment = true;
                    $i++;
                    continue;
                }
            }

            $buffer .= $char;

            if ($char === "\n") {
                $atLineStart = true;
                continue;
            }

            if ($char === ';' && ! $inSingle && ! $inDouble && ! $inBacktick) {
                $statement = trim(substr($buffer, 0, -1));
                if ($statement !== '') {
                    $statements[] = $statement;
                }
                $buffer = '';
                $atLineStart = true;
                continue;
            }

            if ($char === "'" && ! $inDouble && ! $inBacktick) {
                if ($inSingle && $next === "'") {
                    $buffer .= $next;
                    $i++;
                    continue;
                }

                $inSingle = ! $inSingle;
                continue;
            }

            if ($char === '"' && ! $inSingle && ! $inBacktick) {
                $inDouble = ! $inDouble;
                continue;
            }

            if ($char === '`' && ! $inSingle && ! $inDouble) {
                $inBacktick = ! $inBacktick;
                continue;
            }

            if (! ctype_space($char)) {
                $atLineStart = false;
            }
        }

        $tail = trim($buffer);
        if ($tail !== '') {
            $statements[] = $tail;
        }

        return $statements;
    }

    private function buildBackupFilename(string $prefix, string $timestamp, string $suffix, string $extension): string
    {
        return "{$prefix}-{$timestamp}-{$suffix}.{$extension}";
    }

    private function writeSqlDump($handle): void
    {
        $connection = DB::connection();
        $pdo = $connection->getPdo();
        $driver = $connection->getDriverName();
        $tables = $this->listDatabaseTables($driver);

        fwrite($handle, "-- Backup generado el " . now()->toDateTimeString() . PHP_EOL);
        fwrite($handle, "SET FOREIGN_KEY_CHECKS=0;" . PHP_EOL . PHP_EOL);

        foreach ($tables as $table) {
            $this->writeTableDump($handle, $table, $driver, $pdo);
        }

        fwrite($handle, PHP_EOL . "SET FOREIGN_KEY_CHECKS=1;" . PHP_EOL);
    }

    private function writePostgresDump($handle): void
    {
        $connection = DB::connection();
        $pdo = $connection->getPdo();
        $schema = $this->postgresSchema();
        $tables = $this->listDatabaseTables('pgsql');
        $functions = $this->listDatabaseFunctions();
        $triggers = $this->listDatabaseTriggers();

        fwrite($handle, "-- Backup generado el " . now()->toDateTimeString() . PHP_EOL);
        fwrite($handle, "BEGIN;" . PHP_EOL . PHP_EOL);

        $sequenceMap = [];

        foreach ($tables as $table) {
            foreach ($this->postgresSerialColumns($schema, $table) as $columnInfo) {
                $sequenceName = $columnInfo['sequence_name'] ?? null;
                if (is_string($sequenceName) && $sequenceName !== '') {
                    $sequenceMap[$sequenceName] = true;
                }
            }
        }

        foreach (array_keys($sequenceMap) as $sequenceName) {
            fwrite($handle, "CREATE SEQUENCE IF NOT EXISTS " . $this->postgresQualifiedIdentifier($sequenceName) . ";" . PHP_EOL);
        }

        if ($sequenceMap !== []) {
            fwrite($handle, PHP_EOL);
        }

        foreach ($tables as $table) {
            $this->writePostgresTableDump($handle, $schema, $table, $pdo);
        }

        foreach ($tables as $table) {
            $this->writePostgresForeignKeys($handle, $schema, $table);
        }

        foreach ($tables as $table) {
            $this->writePostgresSequencesSetval($handle, $schema, $table);
        }

        if ($functions !== []) {
            fwrite($handle, PHP_EOL . "-- Functions" . PHP_EOL);
            foreach ($functions as $function) {
                $this->writePostgresFunctionDump($handle, $function);
            }
        }

        if ($triggers !== []) {
            fwrite($handle, PHP_EOL . "-- Triggers" . PHP_EOL);
            foreach ($triggers as $trigger) {
                $this->writePostgresTriggerDump($handle, $trigger);
            }
        }

        fwrite($handle, PHP_EOL . "COMMIT;" . PHP_EOL);
    }

    private function writePostgresTableDump($handle, string $schema, string $table, $pdo): void
    {
        $qualifiedTable = $this->postgresQualifiedIdentifier($schema . '.' . $table);
        $columns = $this->postgresColumnDefinitions($schema, $table);
        $columnMeta = $this->postgresTableColumnMetadata($schema, $table);
        $primaryKey = $this->postgresPrimaryKeyConstraint($schema, $table);
        $constraints = array_filter([
            $primaryKey,
        ]);

        fwrite($handle, PHP_EOL . "-- Table {$qualifiedTable}" . PHP_EOL);
        fwrite($handle, "DROP TABLE IF EXISTS {$qualifiedTable} CASCADE;" . PHP_EOL);

        $statementParts = array_merge($columns, $constraints);
        fwrite($handle, "CREATE TABLE {$qualifiedTable} (" . PHP_EOL . '  ' . implode("," . PHP_EOL . '  ', $statementParts) . PHP_EOL . ");" . PHP_EOL);

        $serialColumns = $this->postgresSerialColumns($schema, $table);
        foreach ($serialColumns as $columnInfo) {
            $sequenceName = $columnInfo['sequence_name'] ?? null;
            $columnName = $columnInfo['column_name'] ?? null;

            if (! is_string($sequenceName) || $sequenceName === '' || ! is_string($columnName) || $columnName === '') {
                continue;
            }

            fwrite(
                $handle,
                "ALTER SEQUENCE " . $this->postgresQualifiedIdentifier($sequenceName) .
                " OWNED BY {$qualifiedTable}." . $this->postgresQuoteIdentifier($columnName) . ";" . PHP_EOL
            );
        }

        $rows = DB::table($table)->cursor();
        $columnNames = array_map(
            fn (array $column) => (string) ($column['column_name'] ?? ''),
            $columnMeta
        );
        if ($columnNames === []) {
            return;
        }

        $overrideIdentityColumns = collect($columnMeta)
            ->contains(fn (array $column) => strtoupper((string) ($column['identity_mode'] ?? '')) === 'ALWAYS');

        $batch = [];
        $batchSize = 200;

        foreach ($rows as $row) {
            $batch[] = $this->buildPostgresInsertRow($row, $columnMeta, $pdo);

            if (count($batch) >= $batchSize) {
                $this->flushPostgresInsertBatch($handle, $qualifiedTable, $columnNames, $batch, $overrideIdentityColumns);
                $batch = [];
            }
        }

        if ($batch !== []) {
            $this->flushPostgresInsertBatch($handle, $qualifiedTable, $columnNames, $batch, $overrideIdentityColumns);
        }
    }

    private function flushPostgresInsertBatch($handle, string $qualifiedTable, array $columns, array $batch, bool $overrideIdentityColumns): void
    {
        $wrappedColumns = implode(', ', array_map(fn (string $column) => $this->postgresQuoteIdentifier($column), $columns));
        $overrideClause = $overrideIdentityColumns ? ' OVERRIDING SYSTEM VALUE' : '';

        fwrite(
            $handle,
            "INSERT INTO {$qualifiedTable} ({$wrappedColumns}){$overrideClause} VALUES" . PHP_EOL .
            implode("," . PHP_EOL, $batch) .
            ";" . PHP_EOL
        );
    }

    private function writePostgresForeignKeys($handle, string $schema, string $table): void
    {
        foreach ($this->postgresForeignKeyDefinitions($schema, $table) as $definition) {
            fwrite($handle, $definition . PHP_EOL);
        }
    }

    private function writePostgresSequencesSetval($handle, string $schema, string $table): void
    {
        foreach ($this->postgresSerialColumns($schema, $table) as $columnInfo) {
            $sequenceName = $columnInfo['sequence_name'] ?? null;
            $columnName = $columnInfo['column_name'] ?? null;

            if (! is_string($sequenceName) || $sequenceName === '' || ! is_string($columnName) || $columnName === '') {
                continue;
            }

            $qualifiedTable = $this->postgresQualifiedIdentifier($schema . '.' . $table);
            $quotedColumn = $this->postgresQuoteIdentifier($columnName);

            fwrite(
                $handle,
                "SELECT setval(" . $this->postgresLiteral($sequenceName) . ", COALESCE((SELECT MAX({$quotedColumn}) FROM {$qualifiedTable}), 1), true);" . PHP_EOL
            );
        }
    }

    private function writePostgresFunctionDump($handle, array $function): void
    {
        $schema = (string) ($function['schema'] ?? 'public');
        $functionName = (string) ($function['function_name'] ?? '');
        $identityArguments = (string) ($function['identity_arguments'] ?? '');
        $definition = trim((string) ($function['definition'] ?? ''));

        if ($functionName === '' || $definition === '') {
            return;
        }

        $qualifiedName = $this->postgresFunctionQualifiedName($schema, $functionName, $identityArguments);
        $definition = rtrim($definition, ";\r\n\t ");

        fwrite(
            $handle,
            "-- Function|{$schema}|{$functionName}|{$identityArguments}" . PHP_EOL .
            "DROP FUNCTION IF EXISTS {$qualifiedName} CASCADE;" . PHP_EOL .
            $definition . ";" . PHP_EOL . PHP_EOL
        );
    }

    private function writePostgresTriggerDump($handle, array $trigger): void
    {
        $schema = (string) ($trigger['schema'] ?? 'public');
        $tableName = (string) ($trigger['table_name'] ?? '');
        $triggerName = (string) ($trigger['trigger_name'] ?? '');
        $definition = trim((string) ($trigger['definition'] ?? ''));

        if ($schema === '' || $tableName === '' || $triggerName === '' || $definition === '') {
            return;
        }

        $qualifiedTable = $this->postgresQualifiedIdentifier($schema . '.' . $tableName);
        $qualifiedTrigger = $this->postgresQuoteIdentifier($triggerName);
        $definition = rtrim($definition, ";\r\n\t ");

        fwrite(
            $handle,
            "-- Trigger|{$schema}|{$triggerName}|{$tableName}" . PHP_EOL .
            "DROP TRIGGER IF EXISTS {$qualifiedTrigger} ON {$qualifiedTable} CASCADE;" . PHP_EOL .
            $definition . ";" . PHP_EOL . PHP_EOL
        );
    }

    private function postgresSchema(): string
    {
        $schema = DB::selectOne('select current_schema() as schema_name');
        $schemaName = (string) ($schema->schema_name ?? 'public');

        return $schemaName !== '' ? $schemaName : 'public';
    }

    private function postgresTableColumnMetadata(string $schema, string $table): array
    {
        return collect(DB::select(
            'select column_name,
                    data_type,
                    udt_name,
                    is_identity,
                    identity_generation
             from information_schema.columns
             where table_schema = ? and table_name = ?
             order by ordinal_position',
            [$schema, $table]
        ))
            ->map(fn ($row) => [
                'column_name' => (string) ($row->column_name ?? ''),
                'data_type' => (string) ($row->data_type ?? ''),
                'udt_name' => (string) ($row->udt_name ?? ''),
                'is_identity' => (string) ($row->is_identity ?? ''),
                'identity_mode' => (string) ($row->identity_generation ?? ''),
            ])
            ->filter(fn (array $column) => $column['column_name'] !== '')
            ->values()
            ->all();
    }

    private function postgresColumnDefinitions(string $schema, string $table): array
    {
        $rows = DB::select(
            'select a.attname as column_name,
                    format_type(a.atttypid, a.atttypmod) as formatted_type,
                    a.attnotnull as not_null,
                    pg_get_expr(ad.adbin, ad.adrelid) as column_default,
                    a.attidentity as identity_mode
             from pg_attribute a
             join pg_class c on c.oid = a.attrelid
             join pg_namespace n on n.oid = c.relnamespace
             left join pg_attrdef ad on ad.adrelid = a.attrelid and ad.adnum = a.attnum
             where n.nspname = ? and c.relname = ? and a.attnum > 0 and not a.attisdropped
             order by a.attnum',
            [$schema, $table]
        );

        $definitions = [];

        foreach ($rows as $row) {
            $columnName = (string) ($row->column_name ?? '');
            $formattedType = (string) ($row->formatted_type ?? 'text');
            $notNull = (bool) ($row->not_null ?? false);
            $default = trim((string) ($row->column_default ?? ''));
            $identityMode = (string) ($row->identity_mode ?? '');

            if ($columnName === '') {
                continue;
            }

            $definition = $this->postgresQuoteIdentifier($columnName) . ' ' . $formattedType;

            if ($identityMode === 'a' || $identityMode === 'd') {
                $identityKeyword = $identityMode === 'a' ? 'ALWAYS' : 'BY DEFAULT';
                $definition .= " GENERATED {$identityKeyword} AS IDENTITY";
            } elseif ($default !== '') {
                $definition .= ' DEFAULT ' . $default;
            }

            if ($notNull) {
                $definition .= ' NOT NULL';
            }

            $definitions[] = $definition;
        }

        return $definitions;
    }

    private function postgresPrimaryKeyConstraint(string $schema, string $table): ?string
    {
        $row = DB::selectOne(
            'select pg_get_constraintdef(con.oid, true) as definition
             from pg_constraint con
             join pg_class c on c.oid = con.conrelid
             join pg_namespace n on n.oid = c.relnamespace
             where n.nspname = ? and c.relname = ? and con.contype = \'p\'
             order by con.oid
             limit 1',
            [$schema, $table]
        );

        $definition = (string) ($row->definition ?? '');

        return $definition !== '' ? $definition : null;
    }

    private function postgresForeignKeyDefinitions(string $schema, string $table): array
    {
        $rows = DB::select(
            'select con.conname as constraint_name,
                    pg_get_constraintdef(con.oid, true) as definition
             from pg_constraint con
             join pg_class c on c.oid = con.conrelid
             join pg_namespace n on n.oid = c.relnamespace
             where n.nspname = ? and c.relname = ? and con.contype = \'f\'
             order by con.conname',
            [$schema, $table]
        );

        $qualifiedTable = $this->postgresQualifiedIdentifier($schema . '.' . $table);

        return collect($rows)
            ->map(function ($row) use ($qualifiedTable) {
                $constraintName = (string) ($row->constraint_name ?? '');
                $definition = (string) ($row->definition ?? '');

                if ($constraintName === '' || $definition === '') {
                    return null;
                }

                return "ALTER TABLE {$qualifiedTable} ADD CONSTRAINT " .
                    $this->postgresQuoteIdentifier($constraintName) . ' ' . $definition . ';';
            })
            ->filter()
            ->values()
            ->all();
    }

    private function postgresSerialColumns(string $schema, string $table): array
    {
        $rows = DB::select(
            'select c.column_name,
                    c.column_default,
                    c.is_identity,
                    pg_get_serial_sequence(quote_ident(c.table_schema) || \'.\' || quote_ident(c.table_name), c.column_name) as sequence_name
             from information_schema.columns c
             where c.table_schema = ? and c.table_name = ? and (c.column_default like \'nextval%\' or c.is_identity = \'YES\')
             order by c.ordinal_position',
            [$schema, $table]
        );

        return collect($rows)
            ->map(fn ($row) => [
                'column_name' => (string) ($row->column_name ?? ''),
                'sequence_name' => (string) ($row->sequence_name ?? ''),
            ])
            ->filter(fn (array $row) => $row['column_name'] !== '' && $row['sequence_name'] !== '')
            ->values()
            ->all();
    }

    private function postgresQualifiedIdentifier(string $qualifiedName): string
    {
        if (str_contains($qualifiedName, '.')) {
            [$schema, $name] = explode('.', $qualifiedName, 2);
            return $this->postgresQuoteIdentifier($schema) . '.' . $this->postgresQuoteIdentifier($name);
        }

        return $this->postgresQuoteIdentifier($qualifiedName);
    }

    private function postgresQuoteIdentifier(string $value): string
    {
        $normalized = trim($value);
        $normalized = trim($normalized, '"');

        return '"' . str_replace('"', '""', $normalized) . '"';
    }

    private function postgresLiteral(string $value): string
    {
        return "'" . str_replace("'", "''", $value) . "'";
    }

    private function postgresFunctionQualifiedName(string $schema, string $functionName, string $identityArguments): string
    {
        return $this->postgresQualifiedIdentifier($schema . '.' . $functionName) . '(' . $identityArguments . ')';
    }

    private function postgresFunctionKey(string $schema, string $functionName, string $identityArguments): string
    {
        return $schema . '|' . $functionName . '|' . $identityArguments;
    }

    private function postgresTriggerKey(string $schema, string $triggerName, string $tableName): string
    {
        return $schema . '|' . $triggerName . '|' . $tableName;
    }

    private function writeTableDump($handle, string $table, string $driver, $pdo): void
    {
        $wrappedTable = $this->wrapIdentifier($table, $driver);
        $createStatement = $this->fetchCreateStatement($table, $driver);

        fwrite($handle, PHP_EOL . "-- Table {$wrappedTable}" . PHP_EOL);
        fwrite($handle, "DROP TABLE IF EXISTS {$wrappedTable};" . PHP_EOL);
        fwrite($handle, $createStatement . ";" . PHP_EOL . PHP_EOL);

        $columns = DB::connection()->getSchemaBuilder()->getColumnListing($table);
        if ($columns === []) {
            return;
        }

        $rows = DB::table($table)->cursor();
        $batch = [];
        $batchSize = 200;

        foreach ($rows as $row) {
            $batch[] = $this->buildInsertRow($row, $columns, $pdo);

            if (count($batch) >= $batchSize) {
                $this->flushInsertBatch($handle, $table, $columns, $batch, $driver);
                $batch = [];
            }
        }

        if ($batch !== []) {
            $this->flushInsertBatch($handle, $table, $columns, $batch, $driver);
        }
    }

    private function flushInsertBatch($handle, string $table, array $columns, array $batch, string $driver): void
    {
        $wrappedTable = $this->wrapIdentifier($table, $driver);
        $wrappedColumns = implode(', ', array_map(fn (string $column) => $this->wrapIdentifier($column, $driver), $columns));

        fwrite(
            $handle,
            "INSERT INTO {$wrappedTable} ({$wrappedColumns}) VALUES" . PHP_EOL .
            implode("," . PHP_EOL, $batch) .
            ";" . PHP_EOL
        );
    }

    private function buildPostgresInsertRow(object $row, array $columnMeta, $pdo): string
    {
        $values = [];

        foreach ($columnMeta as $column) {
            $columnName = (string) ($column['column_name'] ?? '');
            $dataType = (string) ($column['data_type'] ?? '');
            $udtName = (string) ($column['udt_name'] ?? '');
            $value = $columnName !== '' ? ($row->{$columnName} ?? null) : null;
            $values[] = $this->postgresSqlValue($value, $dataType, $udtName, $pdo);
        }

        return '(' . implode(', ', $values) . ')';
    }

    private function postgresSqlValue(mixed $value, string $dataType, string $udtName, $pdo): string
    {
        if ($value === null) {
            return 'NULL';
        }

        $normalizedType = strtolower(trim($dataType));
        $normalizedUdt = strtolower(trim($udtName));

        if ($normalizedType === 'boolean' || $normalizedUdt === 'bool') {
            return filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ? 'true' : 'false';
        }

        if (
            in_array($normalizedType, ['smallint', 'integer', 'bigint', 'numeric', 'decimal', 'real', 'double precision'], true)
            || in_array($normalizedUdt, ['int2', 'int4', 'int8', 'numeric', 'float4', 'float8', 'money'], true)
        ) {
            return is_numeric($value) ? (string) $value : $pdo->quote((string) $value);
        }

        if (
            str_contains($normalizedType, 'timestamp')
            || $normalizedType === 'date'
            || $normalizedType === 'time without time zone'
            || $normalizedType === 'time with time zone'
            || $normalizedType === 'interval'
        ) {
            return $pdo->quote((string) $value);
        }

        if (in_array($normalizedType, ['json', 'jsonb', 'uuid', 'character varying', 'character', 'text'], true)) {
            return $pdo->quote((string) $value);
        }

        if (is_bool($value)) {
            return $value ? 'true' : 'false';
        }

        if (is_int($value) || is_float($value)) {
            return (string) $value;
        }

        return $pdo->quote((string) $value);
    }

    private function listDatabaseTables(string $driver): array
    {
        if ($driver === 'sqlite') {
            return collect(DB::select("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"))
                ->map(fn ($row) => (string) ($row->name ?? ''))
                ->filter()
                ->values()
                ->all();
        }

        if ($driver === 'pgsql') {
            $schema = $this->postgresSchema();

            return collect(DB::select(
                'select table_name
                 from information_schema.tables
                 where table_schema = ? and table_type = \'BASE TABLE\'
                 order by table_name',
                [$schema]
            ))
                ->map(fn ($row) => (string) ($row->table_name ?? ''))
                ->filter()
                ->values()
                ->all();
        }

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            return collect(DB::select('SHOW FULL TABLES WHERE Table_type = ?', ['BASE TABLE']))
                ->map(function ($row) {
                    $values = array_values((array) $row);
                    return (string) ($values[0] ?? '');
                })
                ->filter()
                ->values()
                ->all();
        }

        throw new RuntimeException('Driver de base de datos no soportado para backups.');
    }

    private function fetchCreateStatement(string $table, string $driver): string
    {
        if ($driver === 'sqlite') {
            $row = DB::selectOne(
                "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?",
                [$table]
            );

            $statement = (string) ($row->sql ?? '');
            if ($statement === '') {
                throw new RuntimeException("No se pudo obtener la definicion de la tabla {$table}.");
            }

            return $statement;
        }

        $row = DB::selectOne('SHOW CREATE TABLE ' . $this->wrapIdentifier($table, $driver));

        if (! $row) {
            throw new RuntimeException("No se pudo obtener la definicion de la tabla {$table}.");
        }

        $values = array_values((array) $row);
        $statement = (string) ($values[1] ?? '');

        if ($statement === '') {
            throw new RuntimeException("No se pudo obtener la definicion de la tabla {$table}.");
        }

        return $statement;
    }

    private function backupMetadata(string $relativePath): array
    {
        $disk = Storage::disk('local');
        $filename = basename($relativePath);
        $createdAt = Carbon::createFromTimestamp((int) $disk->lastModified($relativePath));
        $size = (int) $disk->size($relativePath);

        return [
            'filename' => $filename,
            'path' => $relativePath,
            'download_url' => url('/api/admin/backups/' . rawurlencode($filename) . '/download'),
            'created_at' => $createdAt->toIso8601String(),
            'created_at_human' => $createdAt->format('d/m/Y H:i'),
            'modified_at' => $createdAt->timestamp,
            'size_bytes' => $size,
            'size_label' => $this->formatBytes($size),
        ];
    }

    private function formatBytes(int $size): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $value = max($size, 0);
        $unit = 0;

        while ($value >= 1024 && $unit < count($units) - 1) {
            $value /= 1024;
            $unit++;
        }

        return $unit === 0
            ? $value . ' ' . $units[$unit]
            : number_format($value, 2) . ' ' . $units[$unit];
    }

    private function resolveBackupPath(string $filename): string
    {
        $cleanFilename = basename(trim($filename));

        if ($cleanFilename === '') {
            throw new RuntimeException('Nombre de backup invalido.');
        }

        if (! preg_match('/^[A-Za-z0-9._-]+\.(sql|sqlite)$/', $cleanFilename)) {
            throw new RuntimeException('Nombre de backup invalido.');
        }

        return self::BACKUP_DIR . '/' . $cleanFilename;
    }

    private function wrapIdentifier(string $name, string $driver): string
    {
        $quote = $driver === 'sqlite' ? '"' : '`';
        $escaped = str_replace($quote, $quote . $quote, $name);

        return $quote . $escaped . $quote;
    }

    private function isBackupFile(string $path): bool
    {
        return preg_match('/\.(sql|sqlite)$/i', basename($path)) === 1;
    }

    private function assertCanManageBackups(Usuario $actor): void
    {
        if (! $this->isSuperAdmin($actor)) {
            throw new RuntimeException('No tienes permisos para administrar backups.');
        }
    }

    private function assertCanDeleteBackups(Usuario $actor): void
    {
        if (! $this->canDeleteBackups($actor)) {
            throw new RuntimeException('Solo el super administrador puede eliminar backups.');
        }
    }

    private function isSuperAdmin(Usuario $actor): bool
    {
        return strtolower((string) $actor->rol) === 'super administrador';
    }
}
