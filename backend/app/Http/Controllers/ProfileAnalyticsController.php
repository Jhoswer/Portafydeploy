<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Services\ProfileAnalyticsService;
use App\Support\OfficialSchema;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileAnalyticsController extends Controller
{
    public function __construct(private readonly ProfileAnalyticsService $analyticsService) {}

    public function recordView(Request $request, Usuario $usuario): JsonResponse
    {
        try {
            return response()->json($this->analyticsService->recordProfileView(
                $request->user(),
                $usuario,
                (string) $request->input('source', 'profile')
            ));
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function views(Request $request): JsonResponse
    {
        return response()->json(
            $this->analyticsService->profileViews(OfficialSchema::ensureProfile($request->user()))
        );
    }

    public function dashboard(Request $request): JsonResponse
    {
        return response()->json(
            $this->analyticsService->dashboard(OfficialSchema::ensureProfile($request->user()))
        );
    }

    public function event(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'owner_profile_id' => ['required', 'integer'],
                'event_type' => ['required', 'string', 'max:50', 'regex:/^[a-z_]+$/'],
                'target_type' => ['nullable', 'string', 'max:50', 'regex:/^[a-z_]+$/'],
                'target_id' => ['nullable', 'integer'],
                'metadata' => ['nullable', 'array'],
            ]);

            return response()->json($this->analyticsService->storeEvent($request->user(), $validated), 201);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
