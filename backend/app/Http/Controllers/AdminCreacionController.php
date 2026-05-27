<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Services\CloudinaryService;

/**
 * AdminCreacionController
 *
 * Maneja la INSERCIÓN de nuevos registros en la BD
 * para el módulo Creación del panel de administración.
 *
 * Rutas sugeridas en routes/api.php:
 *
 *   $router->post('admin/profile/{profile}/cvs',          [AdminCreacionController::class, 'storeCv']);
 *   $router->post('admin/profile/{profile}/experiences',  [AdminCreacionController::class, 'storeExperience']);
 *   $router->post('admin/profile/{profile}/skills',       [AdminCreacionController::class, 'storeSkill']);
 *   $router->post('admin/profile/{profile}/offers',       [AdminCreacionController::class, 'storeOffer']);
 *   $router->post('admin/profile/{profile}/postulations', [AdminCreacionController::class, 'storePostulation']);
 *   $router->post('admin/profile/{profile}/projects',     [AdminCreacionController::class, 'storeProject']);
 *   $router->post('admin/profile/{profile}/publications', [AdminCreacionController::class, 'storePublication']);
 */
class AdminCreacionController extends Controller
{
    /* ── Helpers ─────────────────────────────────────────────────── */

    /** Verifica que el perfil exista, o aborta con 404. */
    private function assertProfileExists(int $profile): void
    {
        abort_unless(
            DB::table('PROFILE')->where('id_profile', $profile)->exists(),
            404,
            'Perfil no encontrado.'
        );
    }

    /* ═══════════════════════════════════════════════════════════════
       CV
    ═══════════════════════════════════════════════════════════════ */

    /**
     * POST admin/profile/{profile}/cvs
     * Crea un nuevo CV para el perfil.
     */
    public function storeCv(Request $request, int $profile): JsonResponse
    {
        $this->assertProfileExists($profile);

        $payload = $request->validate([
            'name_cv'     => ['nullable', 'string', 'max:255'],
            'template'    => ['nullable', 'string', 'max:255'],
            'font'        => ['nullable', 'string', 'max:255'],
            'state'       => ['sometimes', 'boolean'],
            'visible'     => ['sometimes', 'boolean'],
            'archive_pdf' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:255'],
            'cv_url'      => ['nullable', 'string', 'max:255'],
        ]);

        $id = DB::table('CV')->insertGetId([
            'id_profile'  => $profile,
            'name_cv'     => $payload['name_cv']     ?? null,
            'template'    => $payload['template']    ?? null,
            'font'        => $payload['font']        ?? null,
            'state'       => $payload['state']       ?? false,
            'visible'     => $payload['visible']     ?? true,
            'archive_pdf' => $payload['archive_pdf'] ?? null,
            'description' => $payload['description'] ?? null,
            'cv_url'      => $payload['cv_url']      ?? null,
            'created_at'  => now(),
            'updated_at'  => now(),
        ], 'id_cv');

        $created = DB::table('CV')->where('id_cv', $id)->first();

        return response()->json(['data' => ['cv' => $created]], 201);
    }

    /* ═══════════════════════════════════════════════════════════════
       EXPERIENCE
    ═══════════════════════════════════════════════════════════════ */

    /**
     * POST admin/profile/{profile}/experiences
     * Crea una nueva experiencia laboral o académica.
     */
    public function storeExperience(Request $request, int $profile): JsonResponse
    {
        $this->assertProfileExists($profile);

        $payload = $request->validate([
            'type'        => ['required', 'string', 'in:labor,academic'],
            'company'     => ['nullable', 'string', 'max:255'],
            'title'       => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_date'  => ['nullable', 'date'],
            'end_date'    => ['nullable', 'date'],
            'state'       => ['sometimes', 'nullable', 'string', 'in:public,private'],
        ]);

        $id = DB::table('EXPERIENCE')->insertGetId([
            'id_profile'  => $profile,
            'type'        => $payload['type'],
            'company'     => $payload['company']     ?? null,
            'title'       => $payload['title']       ?? null,
            'description' => $payload['description'] ?? null,
            'start_date'  => $payload['start_date']  ?? null,
            'end_date'    => $payload['end_date']    ?? null,
            'state'       => $payload['state']       ?? 'public',
            'created_at'  => now(),
            'updated_at'  => now(),
        ], 'id_experience');

        $created = DB::table('EXPERIENCE')->where('id_experience', $id)->first();

        return response()->json(['data' => ['experience' => $created]], 201);
    }

    /* ═══════════════════════════════════════════════════════════════
       SKILL  (SKILL_PROFILE)
    ═══════════════════════════════════════════════════════════════ */

    /**
     * POST admin/profile/{profile}/skills
     * Asocia una habilidad existente al perfil.
     */
    public function storeSkill(Request $request, int $profile): JsonResponse
    {
        $this->assertProfileExists($profile);

        $payload = $request->validate([
            'id_skill'   => ['required', 'integer', 'exists:SKILL,id_skill'],
            'level'      => ['sometimes', 'nullable', 'string', 'in:junior,mid,senior'],
            'visibility' => ['sometimes', 'boolean'],
        ]);

        /* Respetar el UNIQUE (id_profile, id_skill) */
        $alreadyExists = DB::table('SKILL_PROFILE')
            ->where('id_profile', $profile)
            ->where('id_skill',   $payload['id_skill'])
            ->exists();

        if ($alreadyExists) {
            return response()->json(
                ['message' => 'Esta habilidad ya está asociada al perfil.'],
                422
            );
        }

        $id = DB::table('SKILL_PROFILE')->insertGetId([
            'id_profile'  => $profile,
            'id_skill'    => $payload['id_skill'],
            'level'       => $payload['level']      ?? null,
            'visibility'  => $payload['visibility'] ?? true,
            'created_at'  => now(),
            'updated_at'  => now(),
        ], 'id_skill_profile');

        $created = DB::table('SKILL_PROFILE as sp')
            ->leftJoin('SKILL as s', 's.id_skill', '=', 'sp.id_skill')
            ->where('sp.id_skill_profile', $id)
            ->select([
                'sp.id_skill_profile',
                'sp.id_skill',
                's.name as skill_name',
                'sp.id_profile',
                'sp.level',
                'sp.visibility',
                'sp.created_at',
                'sp.updated_at',
            ])
            ->first();

        return response()->json(['data' => ['skill' => $created]], 201);
    }

    /* ═══════════════════════════════════════════════════════════════
       OFFER
    ═══════════════════════════════════════════════════════════════ */

    /**
     * POST admin/profile/{profile}/offers
     * Crea una nueva oferta laboral.
     */
    public function storeOffer(
        Request $request,
        int $profile,
        CloudinaryService $cloudinary
    ): JsonResponse {
        $this->assertProfileExists($profile);

        $payload = $request->validate([
            'title'            => ['nullable', 'string', 'max:255'],
            'description'      => ['nullable', 'string', 'max:255'],
            'closed_at'        => ['nullable', 'date'],
            'quota_quantity'   => ['nullable', 'integer', 'min:0'],
            'state'            => ['sometimes', 'string', 'in:open,visible,closed,removed,private'],
            'type'             => ['nullable', 'string', 'max:50'],
            'modalidad'        => ['nullable', 'string', 'max:50'],
            'ubicacion'        => ['nullable', 'string', 'max:255'],
            'salary_min'       => ['nullable', 'integer', 'min:0'],
            'salary_max'       => ['nullable', 'integer', 'min:0'],
            'currency'         => ['nullable', 'string', 'max:10'],
            'nivel'            => ['nullable', 'string', 'max:50'],
            'area'             => ['nullable', 'string', 'max:255'],
            'show_salary'      => ['sometimes', 'boolean'],
            'id_audience_type' => ['nullable', 'integer'],
            'banner'           => ['sometimes', 'nullable', 'file', 'image', 'max:5120'],
        ]);

        $bannerUrl = null;
        if ($request->hasFile('banner') && $request->file('banner')->isValid()) {
            $bannerUrl = $cloudinary->upload(
                $request->file('banner'),
                'portafy/offers'
            );
        }

        $id = DB::table('OFFER')->insertGetId([
            'id_profile'       => $profile,
            'title'            => $payload['title']            ?? null,
            'description'      => $payload['description']      ?? null,
            'closed_at'        => $payload['closed_at']        ?? null,
            'quota_quantity'   => $payload['quota_quantity']   ?? null,
            'state'            => $payload['state']            ?? 'private',
            'type'             => $payload['type']             ?? null,
            'modalidad'        => $payload['modalidad']        ?? null,
            'ubicacion'        => $payload['ubicacion']        ?? null,
            'salary_min'       => $payload['salary_min']       ?? null,
            'salary_max'       => $payload['salary_max']       ?? null,
            'currency'         => $payload['currency']         ?? null,
            'nivel'            => $payload['nivel']            ?? null,
            'banner_url'       => $bannerUrl,
            'area'             => $payload['area']             ?? null,
            'show_salary'      => $payload['show_salary']      ?? false,
            'id_audience_type' => $payload['id_audience_type'] ?? null,
            'created_at'       => now(),
            'updated_at'       => now(),
        ], 'id_offer');

        $created = DB::table('OFFER')->where('id_offer', $id)->first();

        return response()->json(['data' => ['offer' => $created]], 201);
    }

    /* ═══════════════════════════════════════════════════════════════
       POSTULATION
    ═══════════════════════════════════════════════════════════════ */

    /**
     * POST admin/profile/{profile}/postulations
     * Crea una nueva postulación para el perfil (como postulante).
     */
    public function storePostulation(Request $request, int $profile): JsonResponse
    {
        $this->assertProfileExists($profile);

        $payload = $request->validate([
            'id_offer' => ['required', 'integer', 'exists:OFFER,id_offer'],
            'id_cv'    => ['nullable', 'integer', 'exists:CV,id_cv'],
            'reason'   => ['nullable', 'string', 'max:255'],
            'state'    => ['sometimes', 'string', 'in:in_verification,refused,accepted'],
        ]);

        /* Verificar que no exista ya una postulación al mismo offer */
        $alreadyExists = DB::table('POSTULATION')
            ->where('id_postulant', $profile)
            ->where('id_offer',     $payload['id_offer'])
            ->exists();

        if ($alreadyExists) {
            return response()->json(
                ['message' => 'Este perfil ya tiene una postulación para esa oferta.'],
                422
            );
        }

        $id = DB::table('POSTULATION')->insertGetId([
            'id_postulant' => $profile,
            'id_offer'     => $payload['id_offer'],
            'id_cv'        => $payload['id_cv']    ?? null,
            'reason'       => $payload['reason']   ?? null,
            'state'        => $payload['state']    ?? 'in_verification',
            'created_at'   => now(),
            'updated_at'   => now(),
        ], 'id_postulation');

        $created = DB::table('POSTULATION')->where('id_postulation', $id)->first();

        return response()->json(['data' => ['postulation' => $created]], 201);
    }

    /* ═══════════════════════════════════════════════════════════════
       PROJECT
    ═══════════════════════════════════════════════════════════════ */

    /**
     * POST admin/profile/{profile}/projects
     * Crea un nuevo proyecto.
     */
    public function storeProject(
        Request $request,
        int $profile,
        CloudinaryService $cloudinary
    ): JsonResponse {
        $this->assertProfileExists($profile);

        $payload = $request->validate([
            'title'          => ['nullable', 'string', 'max:255'],
            'description'    => ['nullable', 'string'],
            'repository_url' => ['nullable', 'string', 'max:255'],
            'url_demo'       => ['nullable', 'string', 'max:255'],
            'state'          => ['sometimes', 'string', 'in:in_progress,completed,removed'],
            'visibility'     => ['sometimes', 'boolean'],
            'photo'          => ['sometimes', 'nullable', 'file', 'image', 'max:5120'],
        ]);

        $photoUrl = null;
        if ($request->hasFile('photo') && $request->file('photo')->isValid()) {
            $photoUrl = $cloudinary->upload(
                $request->file('photo'),
                'portafy/projects'
            );
        }

        $id = DB::table('PROJECT')->insertGetId([
            'id_profile'     => $profile,
            'title'          => $payload['title']          ?? null,
            'description'    => $payload['description']    ?? null,
            'repository_url' => $payload['repository_url'] ?? null,
            'url_demo'       => $payload['url_demo']       ?? null,
            'state'          => $payload['state']          ?? 'in_progress',
            'visibility'     => $payload['visibility']     ?? true,
            'url_photo_main' => $photoUrl,
            'created_at'     => now(),
            'updated_at'     => now(),
        ], 'id_project');

        $created = DB::table('PROJECT')->where('id_project', $id)->first();

        return response()->json(['data' => ['project' => $created]], 201);
    }

    /* ═══════════════════════════════════════════════════════════════
       PUBLICATION
    ═══════════════════════════════════════════════════════════════ */

    /**
     * POST admin/profile/{profile}/publications
     * Crea una nueva publicación.
     */
    public function storePublication(Request $request, int $profile): JsonResponse
    {
        $this->assertProfileExists($profile);

        $payload = $request->validate([
            'description'      => ['nullable', 'string', 'max:255'],
            'outstanding'      => ['sometimes', 'boolean'],
            'visibility'       => ['sometimes', 'boolean'],
            'state'            => ['sometimes', 'string', 'in:incomplete,published,removed'],
            'id_audience_type' => ['nullable', 'integer'],
        ]);

        $id = DB::table('PUBLICATION')->insertGetId([
            'id_profile'       => $profile,
            'description'      => $payload['description']      ?? null,
            'outstanding'      => $payload['outstanding']      ?? false,
            'visibility'       => $payload['visibility']       ?? true,
            'state'            => $payload['state']            ?? 'incomplete',
            'id_audience_type' => $payload['id_audience_type'] ?? null,
            'created_at'       => now(),
            'updated_at'       => now(),
        ], 'id_publication');

        $created = DB::table('PUBLICATION')->where('id_publication', $id)->first();

        return response()->json(['data' => ['publication' => $created]], 201);
    }

public function availableOffers(): JsonResponse
{
    $offers = DB::table('OFFER')
        ->whereIn('state', ['visible', 'open'])
        ->select(['id_offer', 'title', 'state', 'id_profile'])
        ->orderByDesc('id_offer')
        ->get();

    return response()->json(['data' => $offers]);
}
}