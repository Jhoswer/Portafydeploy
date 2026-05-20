<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Services\ProfileEngagementService;
use App\Support\OfficialSchema;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileEngagementController extends Controller
{
    public function __construct(private readonly ProfileEngagementService $engagementService) {}

    public function list(Request $request, Usuario $usuario): JsonResponse
    {
        try {
            $type = (string) $request->query('type', 'followers');
            $target = OfficialSchema::ensureProfile($usuario);
            $viewer = $request->user() ? OfficialSchema::ensureProfile($request->user()) : null;

            return response()->json($this->engagementService->list($target, $type, $viewer));
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function follow(Request $request, Usuario $usuario): JsonResponse
    {
        try {
            return response()->json($this->engagementService->follow($request->user(), $usuario), 201);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function status(Request $request, Usuario $usuario): JsonResponse
    {
        try {
            return response()->json($this->engagementService->status($request->user(), $usuario));
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function unfollow(Request $request, Usuario $usuario): JsonResponse
    {
        try {
            return response()->json($this->engagementService->unfollow($request->user(), $usuario));
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
