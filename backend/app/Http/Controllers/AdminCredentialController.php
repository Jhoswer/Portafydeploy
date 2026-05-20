<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdminCredentialUpdateRequest;
use App\Models\Profile;
use App\Services\AdminCredentialService;
use Illuminate\Http\JsonResponse;

class AdminCredentialController extends Controller
{
    public function __construct(private readonly AdminCredentialService $credentialService) {}

    public function show(Profile $profile): JsonResponse
    {
        return response()->json($this->credentialService->show($profile));
    }

    public function update(AdminCredentialUpdateRequest $request, Profile $profile): JsonResponse
    {
        try {
            return response()->json([
                'status' => 'success',
                'message' => 'Credenciales actualizadas correctamente',
                'data' => $this->credentialService->update($request, $profile),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
