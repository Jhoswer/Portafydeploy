<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateUserPermissionsRequest;
use App\Services\PermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function __construct(private readonly PermissionService $permissionService)
    {
    }

    public function search(Request $request): JsonResponse
    {
        try {
            return response()->json(
                $this->permissionService->searchUsers(
                    $request->user(),
                    (string) $request->query('q', '')
                )
            );
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show(Request $request, int $id): JsonResponse
    {
        try {
            return response()->json(
                $this->permissionService->getUserPermissions($request->user(), $id)
            );
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function update(UpdateUserPermissionsRequest $request, int $id): JsonResponse
    {
        try {
            $result = $this->permissionService->updateUserPermissions(
                $request->user(),
                $id,
                $request->validated('permissions')
            );

            return response()->json([
                'message' => 'Permisos actualizados correctamente.',
                'data' => $result,
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'No se pudieron actualizar los permisos.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
