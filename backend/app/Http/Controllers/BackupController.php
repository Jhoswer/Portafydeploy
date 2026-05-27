<?php

namespace App\Http\Controllers;

use App\Services\BackupService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class BackupController extends Controller
{
    public function __construct(private readonly BackupService $backupService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        try {
            return response()->json([
                'data' => $this->backupService->listBackups($request->user()),
                'meta' => [
                    'can_delete' => $this->backupService->canDeleteBackups($request->user()),
                ],
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'No se pudieron listar los backups.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $backup = $this->backupService->generateBackup($request->user());

            return response()->json([
                'message' => 'Backup generado correctamente.',
                'data' => $backup,
            ], 201);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'No se pudo generar el backup.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function download(Request $request, string $filename): BinaryFileResponse|JsonResponse
    {
        try {
            $path = $this->backupService->downloadBackupPath($request->user(), $filename);

            return response()->download(
                $path,
                basename($path),
                ['Content-Type' => 'application/octet-stream']
            );
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'No se pudo descargar el backup.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function destroy(Request $request, string $filename): JsonResponse
    {
        try {
            $this->backupService->deleteBackup($request->user(), $filename);

            return response()->json([
                'message' => 'Backup eliminado correctamente.',
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'No se pudo eliminar el backup.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function restore(Request $request, string $filename): JsonResponse
    {
        try {
            Log::info('backup.restore.request', [
                'filename' => $filename,
                'user_id' => optional($request->user())->id ?? null,
            ]);

            $result = $this->backupService->restoreBackup($request->user(), $filename);

            Log::info('backup.restore.success', [
                'filename' => $filename,
                'user_id' => optional($request->user())->id ?? null,
                'debug' => $result['debug'] ?? null,
            ]);

            return response()->json([
                'message' => 'Backup restaurado correctamente. Se genero un backup de seguridad previo.',
                'data' => $result,
            ]);
        } catch (\RuntimeException $e) {
            Log::warning('backup.restore.runtime_exception', [
                'filename' => $filename,
                'user_id' => optional($request->user())->id ?? null,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['message' => $e->getMessage()], 422);
        } catch (\Throwable $e) {
            $message = config('app.debug') ? $e->getMessage() : 'No se pudo restaurar el backup.';

            Log::error('backup.restore.failed', [
                'filename' => $filename,
                'user_id' => optional($request->user())->id ?? null,
                'error' => $e->getMessage(),
                'exception' => $e,
            ]);

            return response()->json([
                'message' => $message,
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
