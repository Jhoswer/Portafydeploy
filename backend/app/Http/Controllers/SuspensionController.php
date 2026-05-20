<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSuspensionRequest;
use App\Services\SuspensionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SuspensionController extends Controller
{
    public function __construct(private readonly SuspensionService $suspensionService)
    {
    }

    public function search(Request $request): JsonResponse
    {
        return response()->json(
            $this->suspensionService->searchUsers(
                (string) $request->query('q', '')
            )
        );
    }

    public function store(StoreSuspensionRequest $request): JsonResponse
    {
        try {
            $result = $this->suspensionService->suspendUser(
                $request->user(),
                $request->validated()
            );

            return response()->json([
                'message' => 'Suspension aplicada correctamente.',
                'data' => $result,
            ], 201);
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'No se pudo aplicar la suspension.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
