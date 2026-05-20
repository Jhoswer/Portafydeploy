<?php

namespace App\Services;

use App\Models\Usuario;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
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

    private function generateSqliteBackup($disk, string $timestamp): array
    {
        $connection = DB::connection();
        $sourcePath = (string) $connection->getDatabaseName();

        if ($sourcePath === '' || ! is_file($sourcePath)) {
            throw new RuntimeException('No se encontro el archivo de la base de datos SQLite.');
        }

        $suffix = bin2hex(random_bytes(3));
        $filename = "backup-db-{$timestamp}-{$suffix}.sqlite";
        $relativePath = self::BACKUP_DIR . '/' . $filename;
        $absolutePath = $disk->path($relativePath);

        if (! @copy($sourcePath, $absolutePath)) {
            throw new RuntimeException('No se pudo copiar la base de datos SQLite.');
        }

        return $this->backupMetadata($relativePath);
    }

    private function generateSqlDumpBackup($disk, string $timestamp): array
    {
        $suffix = bin2hex(random_bytes(3));
        $filename = "backup-db-{$timestamp}-{$suffix}.sql";
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

    private function generatePostgresBackup($disk, string $timestamp): array
    {
        $suffix = bin2hex(random_bytes(3));
        $filename = "backup-db-{$timestamp}-{$suffix}.sql";
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
                    pg_get_serial_sequence(quote_ident(c.table_schema) || \'.\' || quote_ident(c.table_name), c.column_name) as sequence_name
             from information_schema.columns c
             where c.table_schema = ? and c.table_name = ? and c.column_default like \'nextval%\'
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
