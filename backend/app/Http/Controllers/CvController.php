<?php

namespace App\Http\Controllers;

use App\Services\CvService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Cv;

class CvController extends Controller
{
    public function __construct(private readonly CvService $cvService) {}

    /**
     * GET /api/cv
     * Lista todos los CVs del usuario autenticado.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $cvs = $this->cvService->list($request->user());

            return response()->json([
                'status' => 'success',
                'data'   => $cvs,
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/cv/{id}
     * Obtiene un CV específico con sus detalles.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $cv = $this->cvService->find($id, $request->user());

            return response()->json([
                'status' => 'success',
                'data'   => $cv,
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/cv
     * Crea un nuevo CV.
     *
     * Body (JSON):
     *   name_cv, template, font, description, visible, cv_url
     *   details: [{ id_experience, id_project, id_skill_profile, ... }]
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name_cv'     => 'sometimes|string|max:255',
            'template'    => 'sometimes|string|max:255',
            'font'        => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string|max:255',
            'visible'     => 'sometimes|boolean',
            'cv_url'      => 'sometimes|nullable|string|max:255',
            'details'     => 'sometimes|array',
        ]);

        try {
            $cv = $this->cvService->create($request->all(), $request->user());

            return response()->json([
                'status'  => 'success',
                'message' => 'CV creado correctamente.',
                'data'    => $cv,
            ], 201);
        } catch (\RuntimeException $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * PUT /api/cv/{id}
     * Actualiza un CV existente.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'name_cv'     => 'sometimes|string|max:255',
            'template'    => 'sometimes|string|max:255',
            'font'        => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string|max:255',
            'visible'     => 'sometimes|boolean',
            'cv_url'      => 'sometimes|nullable|string|max:255',
        ]);

        try {
            $cv = $this->cvService->update($id, $request->all(), $request->user());

            return response()->json([
                'status'  => 'success',
                'message' => 'CV actualizado correctamente.',
                'data'    => $cv,
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * DELETE /api/cv/{id}
     * Elimina (soft delete) un CV.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $this->cvService->delete($id, $request->user());

            return response()->json([
                'status'  => 'success',
                'message' => 'CV eliminado correctamente.',
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * PATCH /api/cv/{id}/visible
     * Alterna la visibilidad de un CV.
     */
    public function toggleVisible(Request $request, int $id): JsonResponse
    {
        try {
            $cv = $this->cvService->toggleVisible($id, $request->user());

            return response()->json([
                'status'  => 'success',
                'message' => 'Visibilidad actualizada.',
                'data'    => $cv,
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/cv/{id}/custom-entry
     * Guarda una entidad solo en el CV sin afectar el perfil.
     */
    public function storeCustomEntry(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'entry_type'  => 'required|in:experience,skill,education',
            'title'       => 'required|string|max:255',
            'subtitle'    => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'date_start'  => 'nullable|string',
            'date_end'    => 'nullable|string',
            'is_current'  => 'nullable|boolean',
        ]);

        try {
            $entry = $this->cvService->saveCustomEntry($id, $request->all(), $request->user());
            return response()->json([
                'status' => 'success',
                'data'   => $entry,
            ], 201);
        } catch (\RuntimeException $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/cv/{id}/custom-entries
     * Devuelve las entidades guardadas solo en este CV.
     */
    public function getCustomEntries(Request $request, int $id): JsonResponse
    {
        try {
            $this->cvService->find($id, $request->user());
            $entries = \App\Models\CvCustomEntry::where('id_cv', '=', $id, 'and')
                ->where('visibility', '=', true, 'and')
                ->get();
            return response()->json(['status' => 'success', 'data' => $entries]);
        } catch (\RuntimeException $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 404);
        }
    }

    /**
     * DELETE /api/cv/{id}/custom-entry/{entryId}
     */
    public function deleteCustomEntry(Request $request, int $id, int $entryId): JsonResponse
    {
        try {
            $this->cvService->find($id, $request->user());
            \App\Models\CvCustomEntry::where('id_cv', '=', $id, 'and')
                ->where('id_cv_custom_entry', '=', $entryId, 'and')
                ->delete();
            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/cv/public/{profileId}
     * CVs públicos (visible=true) de un perfil — accesible sin auth
     */
    public function publicIndex(int $profileId): JsonResponse
    {
        $cvs = Cv::where('id_profile', '=', $profileId, 'and')
            ->where('state', '=', true, 'and')
            ->where('visible', '=', true, 'and')
            ->get();
        return response()->json(['status' => 'success', 'data' => $cvs]);
    }

    /**
     * POST /api/cv/{id}/upload-pdf
     * Recibe el PDF generado en el frontend, lo sube a Cloudinary y guarda la URL.
     */
    public function uploadPdf(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'pdf' => 'required|file|mimes:pdf|max:10240',
        ]);

        try {
            $cv = $this->cvService->find($id, $request->user());

            $cloudinary = new \Cloudinary\Cloudinary(env('CLOUDINARY_URL'));
            $result = $cloudinary->uploadApi()->upload(
                $request->file('pdf')->getRealPath(),
                [
                    'folder'        => 'cvs',
                    'resource_type' => 'raw',
                    'public_id'     => 'cv_' . $id . '_' . time() . '.pdf',
                ]
            );

            $cvName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $cv->name_cv);
            $url = $result['secure_url'];

            $cv->update(['cv_url' => $url]);

            return response()->json(['status' => 'success', 'cv_url' => $url]);
        } catch (\RuntimeException $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/cv/{id}/download
     * Descarga el PDF del CV con el nombre correcto
     */
    public function downloadPdf(int $id): \Illuminate\Http\Response
{
    $cv = Cv::where('id_cv', '=', $id, 'and')
        ->where('visible', '=', true, 'and')
        ->where('state', '=', true, 'and')
        ->firstOrFail();

    if (!$cv->cv_url) {
        abort(404, 'PDF no disponible');
    }

    $filename = preg_replace('/[^a-zA-Z0-9_-]/', '_', $cv->name_cv) . '.pdf';
    
    $response = \Illuminate\Support\Facades\Http::get($cv->cv_url);
    
    return response($response->body(), 200, [
        'Content-Type'        => 'application/pdf',
        'Content-Disposition' => 'attachment; filename="' . $filename . '"',
    ]);
}
}
