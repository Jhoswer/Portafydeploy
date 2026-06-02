<?php

namespace App\Http\Controllers;

use App\Http\Requests\FormacionAcademicaRequest;
use App\Models\FormacionAcademica;
use App\Services\CloudinaryService;
use App\Support\OfficialSchema;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class FormacionAcademicaController extends Controller
{
    public function __construct(private readonly CloudinaryService $cloudinaryService) {}

    public function store(FormacionAcademicaRequest $request): JsonResponse
    {
        try {
            $profile = OfficialSchema::ensureProfile($request->user());
            $university = OfficialSchema::ensureUniversity($request->input('institucion'));
            $career = OfficialSchema::ensureCareer($request->input('nombre_programa'));
            $supportPath = $this->storeSupportDocument($request);

            $formacion = FormacionAcademica::create([
                'training_type' => $request->input('nivel_formacion'),
                'start_date' => $request->input('fecha_inicio'),
                'end_date' => $request->input('fecha_fin'),
                'visibility' => true,
                'id_university' => $university->getKey(),
                'id_career' => $career->getKey(),
                'id_profile' => $profile->getKey(),
                'support_document_url' => $supportPath,
                'support_status' => $supportPath ? 'pending' : 'none',
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
            $supportPath = $this->storeSupportDocument($request);
            $removeSupport = $request->boolean('remove_support_document');

            $data = [
                'training_type' => $request->input('nivel_formacion'),
                'start_date' => $request->input('fecha_inicio'),
                'end_date' => $request->input('fecha_fin'),
                'visibility' => true,
                'id_university' => $university->getKey(),
                'id_career' => $career->getKey(),
            ];

            if ($removeSupport) {
                $data['support_document_url'] = null;
                $data['support_status'] = 'none';
                $data['support_reviewed_at'] = null;
                $data['support_rejection_reason'] = null;
            } elseif ($supportPath) {
                $data['support_document_url'] = $supportPath;
                $data['support_status'] = 'pending';
                $data['support_reviewed_at'] = null;
                $data['support_rejection_reason'] = null;
            } elseif ($formacion->support_document_url && $this->educationDataChanged($formacion, $data)) {
                $data['support_status'] = 'pending';
                $data['support_reviewed_at'] = null;
                $data['support_rejection_reason'] = null;
            }

            $formacion->update($data);

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

    private function storeSupportDocument(Request $request): ?string
    {
        $file = $request->file('support_document');

        if (! $file) {
            return null;
        }

        $resourceType = str_contains((string) $file->getMimeType(), 'pdf') ? 'raw' : 'image';

        return $this->cloudinaryService->uploadFile($file, 'portafolio/formacion-respaldos', $resourceType, [
            'use_filename' => true,
            'unique_filename' => true,
        ]);
    }

    private function educationDataChanged(FormacionAcademica $formacion, array $data): bool
    {
        foreach (['training_type', 'id_university', 'id_career'] as $field) {
            if ((string) $formacion->getRawOriginal($field) !== (string) ($data[$field] ?? '')) {
                return true;
            }
        }

        foreach (['start_date', 'end_date'] as $field) {
            $current = substr((string) $formacion->getRawOriginal($field), 0, 10);
            $next = substr((string) ($data[$field] ?? ''), 0, 10);

            if ($current !== $next) {
                return true;
            }
        }

        return false;
    }

    private function clearProfileCache(int $userId): void
    {
        Cache::forget("profile.{$userId}.overview");
    }
}
