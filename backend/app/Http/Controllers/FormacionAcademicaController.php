<?php

namespace App\Http\Controllers;

use App\Http\Requests\FormacionAcademicaRequest;
use App\Models\FormacionAcademica;
use App\Support\OfficialSchema;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class FormacionAcademicaController extends Controller
{
    public function store(FormacionAcademicaRequest $request): JsonResponse
    {
        try {
            $profile = OfficialSchema::ensureProfile($request->user());
            $university = OfficialSchema::ensureUniversity($request->input('institucion'));
            $career = OfficialSchema::ensureCareer($request->input('nombre_programa'));

            $formacion = FormacionAcademica::create([
                'training_type' => $request->input('nivel_formacion'),
                'start_date' => $request->input('fecha_inicio'),
                'end_date' => $request->input('fecha_fin'),
                'visibility' => true,
                'id_university' => $university->getKey(),
                'id_career' => $career->getKey(),
                'id_profile' => $profile->getKey(),
            ]);

            $this->clearProfileCache($request->user()->id);

            return response()->json([
                'message' => 'Formacion academica guardada correctamente',
                'formacion' => $formacion->fresh(['university', 'career', 'profile.userRole']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $formaciones = FormacionAcademica::forUser($request->user()->id)
                ->orderByDesc('start_date')
                ->orderByDesc('id_university_career')
                ->get();

            return response()->json([
                'formaciones' => $formaciones,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(FormacionAcademicaRequest $request, FormacionAcademica $formacion): JsonResponse
    {
        try {
            $profile = OfficialSchema::ensureProfile($request->user());
            $this->authorizeOwner($formacion, $profile->getKey());

            $university = OfficialSchema::ensureUniversity($request->input('institucion'));
            $career = OfficialSchema::ensureCareer($request->input('nombre_programa'));

            $formacion->update([
                'training_type' => $request->input('nivel_formacion'),
                'start_date' => $request->input('fecha_inicio'),
                'end_date' => $request->input('fecha_fin'),
                'visibility' => true,
                'id_university' => $university->getKey(),
                'id_career' => $career->getKey(),
            ]);

            $this->clearProfileCache($request->user()->id);

            return response()->json([
                'message' => 'Formacion academica actualizada correctamente',
                'formacion' => $formacion->fresh(['university', 'career', 'profile.userRole']),
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, FormacionAcademica $formacion): JsonResponse
    {
        try {
            $profile = OfficialSchema::ensureProfile($request->user());
            $this->authorizeOwner($formacion, $profile->getKey());

            $formacion->delete();
            $this->clearProfileCache($request->user()->id);

            return response()->json([
                'message' => 'Formacion academica eliminada correctamente',
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    private function authorizeOwner(FormacionAcademica $formacion, int $profileId): void
    {
        if ((int) $formacion->id_profile !== $profileId) {
            throw new \Illuminate\Auth\Access\AuthorizationException('No puedes modificar esta formacion academica.');
        }
    }

    private function clearProfileCache(int $userId): void
    {
        Cache::forget("profile.{$userId}.overview");
    }
}
