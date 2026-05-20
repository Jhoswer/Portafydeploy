<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Services\CloudinaryService;

class AdminProfileTableController extends Controller
{
    private const TABLES = [
        'cvs' => [
            'table' => 'CV',
            'profileColumn' => 'id_profile',
            'primaryKey' => 'id_cv',
            'columns' => [
                'id_cv',
                'name_cv',
                'template',
                'font',
                'state',
                'visible',
                'archive_pdf',
                'description',
                'created_at',
                'updated_at',
                'cv_url',
                'id_profile',
            ],
            'orderBy' => 'created_at',
        ],
        'experiences' => [
            'table' => 'EXPERIENCE',
            'profileColumn' => 'id_profile',
            'primaryKey' => 'id_experience',
            'columns' => [
                'id_experience',
                'type',
                'company',
                'title',
                'description',
                'start_date',
                'end_date',
                'created_at',
                'updated_at',
                'state',
                'id_profile',
            ],
            'orderBy' => 'start_date',
        ],
        'skills' => [
            'table' => 'SKILL_PROFILE',
            'profileColumn' => 'sp.id_profile',
            'primaryKey' => 'id_skill_profile',
            'columns' => [
                'sp.id_skill_profile',
                'sp.id_skill',
                's.name as skill_name',
                'sp.id_profile',
                'sp.level',
                'sp.visibility',
                'sp.created_at',
                'sp.updated_at',
            ],
            'join' => ['SKILL as s', 's.id_skill', '=', 'sp.id_skill'],
            'alias' => 'SKILL_PROFILE as sp',
            'orderBy' => 'sp.created_at',
        ],
        'offers' => [
            'table' => 'OFFER',
            'profileColumn' => 'id_profile',
            'primaryKey' => 'id_offer',
            'columns' => [
                'id_offer',
                'title',
                'description',
                'created_at',
                'updated_at',
                'closed_at',
                'quota_quantity',
                'state',
                'id_profile',
                'type',
                'modalidad',
                'ubicacion',
                'salary_min',
                'salary_max',
                'currency',
                'nivel',
                'banner_url',
                'area',
                'show_salary',
                'id_audience_type',
            ],
            'orderBy' => 'created_at',
        ],
        'preferences' => [
            'table'         => 'PREFERENCE',
            'profileColumn' => 'id_profile',
            'primaryKey'    => 'id_preference',
            'columns'       => [
                'id_preference',
                'description',
                'type',
                'visibility',
                'color',
                'id_profile',
            ],
            'orderBy' => 'id_preference',
        ],
        'postulations' => [
            'table' => 'POSTULATION',
            'profileColumn' => 'id_postulant',
            'primaryKey' => 'id_postulation',
            'columns' => [
                'id_postulation',
                'id_offer',
                'id_postulant',
                'id_cv',
                'reason',
                'created_at',
                'updated_at',
                'state',
            ],
            'orderBy' => 'created_at',
        ],
        'projects' => [
            'table' => 'PROJECT',
            'profileColumn' => 'id_profile',
            'primaryKey' => 'id_project',
            'columns' => [
                'id_project',
                'title',
                'description',
                'repository_url',
                'url_demo',
                'image',
                'state',
                'created_at',
                'updated_at',
                'url_photo_main',
                'id_profile',
                'visibility',
            ],
            'orderBy' => 'created_at',
        ],
        'publications' => [
            'table' => 'PUBLICATION',
            'profileColumn' => 'id_profile',
            'primaryKey' => 'id_publication',
            'columns' => [
                'id_publication',
                'description',
                'outstanding',
                'visibility',
                'state',
                'created_at',
                'updated_at',
                'id_profile',
            ],
            'orderBy' => 'created_at',
        ],
        'comments' => [
    'table'         => 'COMMENT',
    'profileColumn' => 'id_commentator',
    'primaryKey'    => 'id_comment',
    'columns'       => [
        'id_comment', 'id_publication', 'id_commentator',
        'comment', 'created_at', 'updated_at', 'removed_at',
    ],
    'orderBy' => 'created_at',
],
'providers' => [
    'table'         => 'PROVIDER',
    'profileColumn' => 'id_profile',
    'primaryKey'    => 'id_provider',
    'columns'       => [
        'id_provider', 'provider', 'active',
        'provider_user_id', 'created_at', 'updated_at',
    ],
    'orderBy' => 'created_at',
],
'saved' => [
    'table'         => 'SAVED',
    'profileColumn' => 'id_profile',
    'primaryKey'    => 'id_saved',
    'columns'       => [
        'id_saved', 'id_publication', 'id_project',
        'id_profile', 'created_at',
    ],
    'orderBy' => 'created_at',
],
    ];

    public function index(int $profile, string $resource): JsonResponse
    {
        abort_unless(isset(self::TABLES[$resource]), 404, 'Tabla no soportada.');

        $config = self::TABLES[$resource];
        $from   = $config['alias'] ?? $config['table'];
        $query  = DB::table($from)->select($config['columns']);

        if (isset($config['join'])) {
            $query->leftJoin(...$config['join']);
        }

        $rows = $query
            ->where($config['profileColumn'], $profile)
            ->orderByDesc($config['orderBy'])
            ->get();

        return response()->json([
            'data' => $rows,
            'meta' => [
                'primary_key' => $config['primaryKey'],
                'columns' => collect($config['columns'])
                    ->map(fn (string $col) => str_contains($col, ' as ')
                        ? trim((string) str($col)->after(' as '))
                        : trim((string) str($col)->afterLast('.')))
                    ->values(),
            ],
        ]);
    }

    public function bulkDelete(Request $request, int $profile, string $resource): JsonResponse
{
    abort_unless(isset(self::TABLES[$resource]), 404, 'Tabla no soportada.');

    $payload = $request->validate([
        'ids'   => ['required', 'array', 'min:1'],
        'ids.*' => ['integer'],
    ]);

    $config = self::TABLES[$resource];

    /*
     * Usar siempre el nombre real de la tabla (sin alias)
     * y quitar el prefijo del alias en profileColumn.
     * Ej: 'sp.id_profile' → 'id_profile'
     */
    $table      = $config['table'];
    $profileCol = str_contains($config['profileColumn'], '.')
        ? (string) str($config['profileColumn'])->afterLast('.')
        : $config['profileColumn'];
    $pk = $config['primaryKey'];

    /* Verificar que los IDs realmente pertenezcan a este perfil */
    $validIds = DB::table($table)
        ->where($profileCol, $profile)
        ->whereIn($pk, $payload['ids'])
        ->pluck($pk)
        ->all();

    if (empty($validIds)) {
        return response()->json([
            'data' => [
                'deleted'   => 0,
                'requested' => count($payload['ids']),
                'not_found' => count($payload['ids']),
                'message'   => 'Ningún ID pertenece a este perfil.',
            ],
        ], 422);
    }

    $deleted = DB::table($table)
        ->whereIn($pk, $validIds)
        ->delete();

    return response()->json([
        'data' => [
            'deleted'   => $deleted,
            'requested' => count($payload['ids']),
            'not_found' => count($payload['ids']) - count($validIds),
        ],
    ]);
}
    /* ── CV ──────────────────────────────────────────────────────── */
    public function showCv(int $profile, int $cv): JsonResponse
    {
        $record = DB::table('CV')
            ->where('id_profile', $profile)
            ->where('id_cv', $cv)
            ->first();

        abort_unless($record, 404, 'CV no encontrado.');

        $details = DB::table('CV_DETAIL')
            ->leftJoin('PROJECT',           'PROJECT.id_project',                '=', 'CV_DETAIL.id_project')
            ->leftJoin('EXPERIENCE',        'EXPERIENCE.id_experience',          '=', 'CV_DETAIL.id_experience')
            ->leftJoin('CERTIFICATE',       'CERTIFICATE.id_certificate',        '=', 'CV_DETAIL.id_certificate')
            ->leftJoin('UNIVERSITY_CAREER', 'UNIVERSITY_CAREER.id_university_career', '=', 'CV_DETAIL.id_university_career')
            ->leftJoin('UNIVERSITY',        'UNIVERSITY.id_university',          '=', 'UNIVERSITY_CAREER.id_university')
            ->leftJoin('CAREER',            'CAREER.id_career',                  '=', 'UNIVERSITY_CAREER.id_career')
            ->leftJoin('SOCIAL_NETWORK',    'SOCIAL_NETWORK.id_social_networks', '=', 'CV_DETAIL.id_social_network')
            ->leftJoin('PLATFORM',          'PLATFORM.id_platform',              '=', 'SOCIAL_NETWORK.id_platform')
            ->leftJoin('SKILL_PROFILE',     'SKILL_PROFILE.id_skill_profile',    '=', 'CV_DETAIL.id_skill_profile')
            ->leftJoin('SKILL',             'SKILL.id_skill',                    '=', 'SKILL_PROFILE.id_skill')
            ->where('CV_DETAIL.id_cv', $cv)
            ->orderBy('CV_DETAIL.id_cv_detail')
            ->select([
                'CV_DETAIL.*',
                DB::raw(
                    "COALESCE(\"PROJECT\".title, \"EXPERIENCE\".title, \"CERTIFICATE\".description, " .
                    "\"CAREER\".name, \"PLATFORM\".name, \"SKILL\".name, 'Detalle sin nombre') as display_name"
                ),
                DB::raw("
                    CASE
                        WHEN \"CV_DETAIL\".id_project          IS NOT NULL THEN 'project'
                        WHEN \"CV_DETAIL\".id_experience       IS NOT NULL THEN 'experience'
                        WHEN \"CV_DETAIL\".id_certificate      IS NOT NULL THEN 'certificate'
                        WHEN \"CV_DETAIL\".id_university_career IS NOT NULL THEN 'university_career'
                        WHEN \"CV_DETAIL\".id_social_network   IS NOT NULL THEN 'social_network'
                        WHEN \"CV_DETAIL\".id_skill_profile    IS NOT NULL THEN 'skill_profile'
                        ELSE ''
                    END as detail_type
                "),
                DB::raw("
                    COALESCE(
                        \"CV_DETAIL\".id_project,
                        \"CV_DETAIL\".id_experience,
                        \"CV_DETAIL\".id_certificate,
                        \"CV_DETAIL\".id_university_career,
                        \"CV_DETAIL\".id_social_network,
                        \"CV_DETAIL\".id_skill_profile
                    ) as detail_value
                "),
                DB::raw('"UNIVERSITY".name as university_name'),
            ])
            ->get();

        return response()->json([
            'data' => [
                'cv'       => $record,
                'details'  => $details,
                'catalogs' => $this->cvDetailCatalogs($profile),
            ],
        ]);
    }

    public function updateCv(Request $request, int $profile, int $cv): JsonResponse
    {
        $payload = $request->validate([
            'name_cv'                        => ['sometimes', 'nullable', 'string', 'max:255'],
            'template'                       => ['sometimes', 'nullable', 'string', 'max:255'],
            'font'                           => ['sometimes', 'nullable', 'string', 'max:255'],
            'state'                          => ['sometimes', 'boolean'],
            'visible'                        => ['sometimes', 'boolean'],
            'archive_pdf'                    => ['sometimes', 'nullable', 'string', 'max:255'],
            'description'                    => ['sometimes', 'nullable', 'string', 'max:255'],
            'cv_url'                         => ['sometimes', 'nullable', 'string', 'max:255'],
            'details'                        => ['sometimes', 'array'],
            'details.*.id_cv_detail'         => ['nullable', 'integer'],
            'details.*.id_project'           => ['nullable', 'integer'],
            'details.*.id_experience'        => ['nullable', 'integer'],
            'details.*.id_certificate'       => ['nullable', 'integer'],
            'details.*.id_university_career' => ['nullable', 'integer'],
            'details.*.id_social_network'    => ['nullable', 'integer'],
            'details.*.id_skill_profile'     => ['nullable', 'integer'],
            'details.*.visibility'           => ['sometimes', 'boolean'],
            'details.*._delete'              => ['sometimes', 'boolean'],
        ]);

        $exists = DB::table('CV')
            ->where('id_profile', $profile)
            ->where('id_cv', $cv)
            ->exists();

        abort_unless($exists, 404, 'CV no encontrado.');

        DB::transaction(function () use ($payload, $cv) {
            $cvData = collect($payload)
                ->only([
                    'name_cv', 'template', 'font', 'state', 'visible',
                    'archive_pdf', 'description', 'cv_url',
                ])
                ->all();

            if ($cvData !== []) {
                $cvData['updated_at'] = now();
                DB::table('CV')->where('id_cv', $cv)->update($cvData);
            }

            foreach ($payload['details'] ?? [] as $detail) {
                $detailId = $detail['id_cv_detail'] ?? null;

                if (($detail['_delete'] ?? false) && $detailId) {
                    DB::table('CV_DETAIL')
                        ->where('id_cv', $cv)
                        ->where('id_cv_detail', $detailId)
                        ->delete();
                    continue;
                }

                $detailData = collect($detail)
                    ->only([
                        'id_project', 'id_experience', 'id_certificate',
                        'id_university_career', 'id_social_network',
                        'id_skill_profile', 'visibility',
                    ])
                    ->all();

                if ($detailData === []) {
                    continue;
                }

                $detailData['updated_at'] = now();

                if ($detailId) {
                    DB::table('CV_DETAIL')
                        ->where('id_cv', $cv)
                        ->where('id_cv_detail', $detailId)
                        ->update($detailData);
                } else {
                    $detailData['id_cv']      = $cv;
                    $detailData['created_at'] = now();
                    DB::table('CV_DETAIL')->insert($detailData);
                }
            }
        });

        return $this->showCv($profile, $cv);
    }

    /* ── SKILL ───────────────────────────────────────────────────── */

    public function showSkill(int $profile, int $skill): JsonResponse
    {
        $record = DB::table('SKILL_PROFILE as sp')
            ->leftJoin('SKILL as s', 's.id_skill', '=', 'sp.id_skill')
            ->where('sp.id_profile', $profile)
            ->where('sp.id_skill_profile', $skill)
            ->select([
                'sp.id_skill_profile',
                's.name',
                'sp.level',
                's.description',
                's.state',
                'sp.visibility',
            ])
            ->first();

        abort_unless($record, 404, 'Habilidad no encontrada.');

        return response()->json(['data' => ['skill' => $record]]);
    }

    public function updateSkill(Request $request, int $profile, int $skill): JsonResponse
    {
        $payload = $request->validate([
            'level'      => ['sometimes', 'nullable', 'string', 'in:junior,mid,senior'],
            'visibility' => ['sometimes', 'boolean'],
        ]);

        $exists = DB::table('SKILL_PROFILE')
            ->where('id_profile', $profile)
            ->where('id_skill_profile', $skill)
            ->exists();

        abort_unless($exists, 404, 'Habilidad no encontrada.');

        DB::transaction(function () use ($payload, $skill) {
            $profileData = collect($payload)->only(['level', 'visibility'])->all();
            if ($profileData !== []) {
                $profileData['updated_at'] = now();
                DB::table('SKILL_PROFILE')->where('id_skill_profile', $skill)->update($profileData);
            }
        });

        return $this->showSkill($profile, $skill);
    }

    /* ── EXPERIENCE ──────────────────────────────────────────────── */

    public function showExperience(int $profile, int $experience): JsonResponse
    {
        $record = DB::table('EXPERIENCE')
            ->where('id_profile', $profile)
            ->where('id_experience', $experience)
            ->first();

        abort_unless($record, 404, 'Experiencia no encontrada.');

        return response()->json(['data' => ['experience' => $record]]);
    }

    public function updateExperience(Request $request, int $profile, int $experience): JsonResponse
    {
        $payload = $request->validate([
            'type'        => ['sometimes', 'nullable', 'string', 'in:labor,academic'],
            'company'     => ['sometimes', 'nullable', 'string', 'max:255'],
            'title'       => ['sometimes', 'nullable', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'start_date'  => ['sometimes', 'nullable', 'date'],
            'end_date'    => ['sometimes', 'nullable', 'date'],
            'state'       => ['sometimes', 'nullable', 'string', 'in:public,private'],
        ]);

        $exists = DB::table('EXPERIENCE')
            ->where('id_profile', $profile)
            ->where('id_experience', $experience)
            ->exists();

        abort_unless($exists, 404, 'Experiencia no encontrada.');

        $data = collect($payload)->all();
        if ($data !== []) {
            $data['updated_at'] = now();
            DB::table('EXPERIENCE')->where('id_experience', $experience)->update($data);
        }

        return $this->showExperience($profile, $experience);
    }

    /* ── OFFER ───────────────────────────────────────────────────── */

    public function showOffer(int $profile, int $offer): JsonResponse
    {
        $record = DB::table('OFFER')
            ->where('id_profile', $profile)
            ->where('id_offer', $offer)
            ->first();

        abort_unless($record, 404, 'Oferta no encontrada.');

        // Detalles asociados (skills y job_titles)
        $details = DB::table('OFFER_DETAIL as od')
            ->leftJoin('SKILL as s',      's.id_skill',      '=', 'od.id_skill')
            ->leftJoin('JOB_TITLE as jt', 'jt.id_job_title', '=', 'od.id_job_title')
            ->where('od.id_offer', $offer)
            ->select([
                'od.id_offer_detail',
                'od.id_skill',
                's.name as skill_name',
                'od.id_job_title',
                'jt.name as job_title_name',
            ])
            ->get();

        // Catálogos necesarios para el modal
        $catalogs = [
            // Tipos de audiencia: muestra code, guarda id_audience_type
            'audience_types' => DB::table('AUDIENCE_TYPE')
                ->orderBy('id_audience_type')
                ->get([
                    'id_audience_type as value',
                    'code',
                    'name',
                ]),

            // Skills disponibles para agregar a la oferta
            'skills' => DB::table('SKILL')
                ->orderBy('name')
                ->get([
                    'id_skill as value',
                    'name as label',
                ]),

            // Puestos disponibles para agregar a la oferta
            'job_titles' => DB::table('JOB_TITLE')
                ->orderBy('name')
                ->get([
                    'id_job_title as value',
                    'name as label',
                ]),
        ];

        return response()->json([
            'data' => [
                'offer'    => $record,
                'details'  => $details,
                'catalogs' => $catalogs,
            ],
        ]);
    }

    public function updateOffer(Request $request, int $profile, int $offer, CloudinaryService $cloudinary): JsonResponse
{
    // FormData envía `details` como string JSON; hay que convertirlo antes de validar
    if ($request->has('details') && is_string($request->input('details'))) {
        $request->merge([
            'details' => json_decode($request->input('details'), true) ?? [],
        ]);
    }

    $payload = $request->validate([
        'title'            => ['sometimes', 'nullable', 'string', 'max:255'],
        'description'      => ['sometimes', 'nullable', 'string', 'max:255'],
        'closed_at'        => ['sometimes', 'nullable', 'date'],
        'quota_quantity'   => ['sometimes', 'nullable', 'integer', 'min:0'],
        'state'            => ['sometimes', 'nullable', 'string', 'in:open,visible,closed,removed,private'],
        'type'             => ['sometimes', 'nullable', 'string', 'max:50'],
        'modalidad'        => ['sometimes', 'nullable', 'string', 'max:50'],
        'ubicacion'        => ['sometimes', 'nullable', 'string', 'max:255'],
        'salary_min'       => ['sometimes', 'nullable', 'integer', 'min:0'],
        'salary_max'       => ['sometimes', 'nullable', 'integer', 'min:0'],
        'currency'         => ['sometimes', 'nullable', 'string', 'max:10'],
        'nivel'            => ['sometimes', 'nullable', 'string', 'max:50'],
        'banner_url'       => ['sometimes', 'nullable', 'string', 'max:255'],
        'area'             => ['sometimes', 'nullable', 'string', 'max:255'],
        'show_salary'      => ['sometimes', 'boolean'],
        'id_audience_type' => ['sometimes', 'nullable', 'integer'],
        'banner'           => ['sometimes', 'nullable', 'file', 'image', 'max:5120'],
        'details'                   => ['sometimes', 'array'],
        'details.*.id_offer_detail' => ['nullable', 'integer'],
        'details.*.id_skill'        => ['nullable', 'integer'],
        'details.*.id_job_title'    => ['nullable', 'integer'],
        'details.*._delete'         => ['sometimes', 'boolean'],
    ]);

    $exists = DB::table('OFFER')
        ->where('id_profile', $profile)
        ->where('id_offer', $offer)
        ->exists();

    abort_unless($exists, 404, 'Oferta no encontrada.');

    // ── Subida de banner usando CloudinaryService (igual que foto de perfil) ──
    if ($request->hasFile('banner') && $request->file('banner')->isValid()) {
        $payload['banner_url'] = $cloudinary->upload(
            $request->file('banner'),
            'portafy/offers'
        );
    }

    DB::transaction(function () use ($payload, $offer) {
        $offerData = collect($payload)
            ->only([
                'title', 'description', 'closed_at', 'quota_quantity',
                'state', 'type', 'modalidad', 'ubicacion',
                'salary_min', 'salary_max', 'currency', 'nivel',
                'banner_url', 'area', 'show_salary', 'id_audience_type',
            ])
            ->all();

        if ($offerData !== []) {
            $offerData['updated_at'] = now();
            DB::table('OFFER')->where('id_offer', $offer)->update($offerData);
        }

        foreach ($payload['details'] ?? [] as $detail) {
            $detailId = $detail['id_offer_detail'] ?? null;

            if (($detail['_delete'] ?? false) && $detailId) {
                DB::table('OFFER_DETAIL')
                    ->where('id_offer', $offer)
                    ->where('id_offer_detail', $detailId)
                    ->delete();
                continue;
            }

            $detailData = collect($detail)
                ->only(['id_skill', 'id_job_title'])
                ->filter(fn($v) => $v !== null)
                ->all();

            if ($detailData === []) {
                continue;
            }

            if ($detailId) {
                DB::table('OFFER_DETAIL')
                    ->where('id_offer', $offer)
                    ->where('id_offer_detail', $detailId)
                    ->update($detailData);
            } else {
                $detailData['id_offer'] = $offer;
                DB::table('OFFER_DETAIL')->insert($detailData);
            }
        }
    });

    return $this->showOffer($profile, $offer);
}

 public function showPostulation(int $profile, int $postulation): JsonResponse
    {
        $record = DB::table('POSTULATION')
            ->where('id_postulant', $profile)
            ->where('id_postulation', $postulation)
            ->first();
 
        abort_unless($record, 404, 'Postulación no encontrada.');
 
        /* CVs del perfil para el combobox del frontend */
        $cvs = DB::table('CV')
            ->where('id_profile', $profile)
            ->orderBy('name_cv')
            ->get([
                'id_cv as value',
                DB::raw("COALESCE(name_cv, 'CV sin nombre') as label"),
            ]);
 
        return response()->json([
            'data' => [
                'postulation' => $record,
                'catalogs'    => [
                    'cvs' => $cvs,
                ],
            ],
        ]);
    }
 
    public function updatePostulation(Request $request, int $profile, int $postulation): JsonResponse
    {
        $payload = $request->validate([
            'id_cv'  => ['sometimes', 'nullable', 'integer', 'exists:CV,id_cv'],
            'reason' => ['sometimes', 'nullable', 'string', 'max:255'],
            'state'  => ['sometimes', 'nullable', 'string', 'in:in_verification,refused,accepted'],
        ]);
 
        $exists = DB::table('POSTULATION')
            ->where('id_postulant', $profile)
            ->where('id_postulation', $postulation)
            ->exists();
 
        abort_unless($exists, 404, 'Postulación no encontrada.');
 
        $data = collect($payload)->all();
        if ($data !== []) {
            $data['updated_at'] = now();
            DB::table('POSTULATION')
                ->where('id_postulation', $postulation)
                ->update($data);
        }
 
        return $this->showPostulation($profile, $postulation);
    }

        /* ── PREFERENCE ──────────────────────────────────────────────── */
 
    public function showPreference(int $profile, int $preference): JsonResponse
    {
        $record = DB::table('PREFERENCE')
            ->where('id_profile', $profile)
            ->where('id_preference', $preference)
            ->first();
 
        abort_unless($record, 404, 'Preferencia no encontrada.');
 
        return response()->json(['data' => ['preference' => $record]]);
    }
 
    public function updatePreference(Request $request, int $profile, int $preference): JsonResponse
    {
        $payload = $request->validate([
            'description' => ['sometimes', 'nullable', 'string', 'max:255'],
            'type'        => [
                'sometimes', 'nullable', 'string',
                'in:privacy,personalization',
            ],
            'visibility'  => ['sometimes', 'boolean'],
            'color'       => [
                'sometimes', 'nullable', 'string',
                'in:red,yellow,green,purple,sky blue,pink,cyan,black,orange,coffee,default,blue',
            ],
        ]);
 
        $exists = DB::table('PREFERENCE')
            ->where('id_profile', $profile)
            ->where('id_preference', $preference)
            ->exists();
 
        abort_unless($exists, 404, 'Preferencia no encontrada.');
 
        $data = collect($payload)->all();
        if ($data !== []) {
            DB::table('PREFERENCE')
                ->where('id_preference', $preference)
                ->update($data);
        }
 
        return $this->showPreference($profile, $preference);
    }

    public function showAcademico(int $profile): JsonResponse
    {
        $profileRecord = DB::table('PROFILE')
            ->leftJoin('JOB_TITLE', 'JOB_TITLE.id_job_title', '=', 'PROFILE.id_job_title')
            ->where('PROFILE.id_profile', $profile)
            ->select([
                'PROFILE.id_profile',
                'PROFILE.id_job_title',
                'JOB_TITLE.name as job_title_name',
            ])
            ->first();
 
        abort_unless($profileRecord, 404, 'Perfil no encontrado.');
 
        $universityCareers = DB::table('UNIVERSITY_CAREER')
            ->leftJoin('UNIVERSITY', 'UNIVERSITY.id_university', '=', 'UNIVERSITY_CAREER.id_university')
            ->leftJoin('CAREER',     'CAREER.id_career',         '=', 'UNIVERSITY_CAREER.id_career')
            ->where('UNIVERSITY_CAREER.id_profile', $profile)
            ->select([
                'UNIVERSITY_CAREER.id_university_career',
                'UNIVERSITY_CAREER.training_type',
                'UNIVERSITY_CAREER.start_date',
                'UNIVERSITY_CAREER.end_date',
                'UNIVERSITY_CAREER.visibility',
                'UNIVERSITY_CAREER.id_university',
                'UNIVERSITY_CAREER.id_career',
                'UNIVERSITY.name as university_name',
                'CAREER.name as career_name',
            ])
            ->orderBy('UNIVERSITY_CAREER.start_date')
            ->get();
 
        /* Catálogos para los comboboxes del frontend */
        $jobTitles = DB::table('JOB_TITLE')
            ->orderBy('name')
            ->get(['id_job_title as value', 'name as label']);
 
        $universities = DB::table('UNIVERSITY')
            ->orderBy('name')
            ->get(['id_university as value', 'name as label']);
 
        $careers = DB::table('CAREER')
            ->orderBy('name')
            ->get(['id_career as value', 'name as label']);
 
        return response()->json([
            'data' => [
                'profile'            => $profileRecord,
                'university_careers' => $universityCareers,
                'catalogs'           => [
                    'job_titles'   => $jobTitles,
                    'universities' => $universities,
                    'careers'      => $careers,
                ],
            ],
        ]);
    }
 
    public function updateAcademico(Request $request, int $profile): JsonResponse
    {
        $payload = $request->validate([
            'id_job_title'                       => ['sometimes', 'nullable', 'integer'],
            'careers'                            => ['sometimes', 'array'],
            'careers.*.id_university_career'     => ['nullable', 'integer'],
            'careers.*.id_university'            => ['nullable', 'integer'],
            'careers.*.id_career'               => ['nullable', 'integer'],
            'careers.*.training_type'            => ['nullable', 'string', 'max:255'],
            'careers.*.start_date'              => ['nullable', 'date'],
            'careers.*.end_date'                => ['nullable', 'date'],
            'careers.*.visibility'              => ['sometimes', 'boolean'],
            'careers.*._delete'                 => ['sometimes', 'boolean'],
        ]);
 
        $exists = DB::table('PROFILE')->where('id_profile', $profile)->exists();
        abort_unless($exists, 404, 'Perfil no encontrado.');
 
        DB::transaction(function () use ($payload, $profile) {
            /* Actualizar título de trabajo en PROFILE */
            if (array_key_exists('id_job_title', $payload)) {
                DB::table('PROFILE')
                    ->where('id_profile', $profile)
                    ->update([
                        'id_job_title' => $payload['id_job_title'],
                        'updated_at'   => now(),
                    ]);
            }
 
            /* Procesar carreras universitarias */
            foreach ($payload['careers'] ?? [] as $career) {
                $careerId = $career['id_university_career'] ?? null;
 
                /* Eliminar */
                if (($career['_delete'] ?? false) && $careerId) {
                    DB::table('UNIVERSITY_CAREER')
                        ->where('id_profile', $profile)
                        ->where('id_university_career', $careerId)
                        ->delete();
                    continue;
                }
 
                $careerData = collect($career)
                    ->only([
                        'id_university', 'id_career', 'training_type',
                        'start_date', 'end_date', 'visibility',
                    ])
                    ->all();
 
                if ($careerData === []) {
                    continue;
                }
 
                $careerData['updated_at'] = now();
 
                if ($careerId) {
                    /* Actualizar existente — verificar que pertenezca al perfil */
                    DB::table('UNIVERSITY_CAREER')
                        ->where('id_profile', $profile)
                        ->where('id_university_career', $careerId)
                        ->update($careerData);
                } else {
                    /* Insertar nueva */
                    $careerData['id_profile'] = $profile;
                    $careerData['created_at'] = now();
                    DB::table('UNIVERSITY_CAREER')->insert($careerData);
                }
            }
        });
 
        return $this->showAcademico($profile);
    }

    /* ── PROJECT ─────────────────────────────────────────────────── */
 
    public function showProject(int $profile, int $project): JsonResponse
    {
        $record = DB::table('PROJECT')
            ->where('id_profile', $profile)
            ->where('id_project', $project)
            ->first();
 
        abort_unless($record, 404, 'Proyecto no encontrado.');
 
        /* Skills asociadas al proyecto */
        $skills = DB::table('PROJECT_SKILL as ps')
            ->leftJoin('SKILL as s', 's.id_skill', '=', 'ps.id_skill')
            ->where('ps.id_project', $project)
            ->select([
                'ps.id_project_skill',
                'ps.id_skill',
                DB::raw("COALESCE(s.name, 'Skill sin nombre') as skill_name"),
            ])
            ->get();
 
        /* Catálogo de todas las skills disponibles para el combobox */
        $allSkills = DB::table('SKILL')
            ->orderBy('name')
            ->get(['id_skill as value', 'name as label']);
 
        return response()->json([
            'data' => [
                'project'  => $record,
                'skills'   => $skills,
                'catalogs' => [
                    'skills' => $allSkills,
                ],
            ],
        ]);
    }
 
    public function updateProject(
        Request $request,
        int $profile,
        int $project,
        CloudinaryService $cloudinary
    ): JsonResponse {
        /* FormData envía `skills` como string JSON */
        if ($request->has('skills') && is_string($request->input('skills'))) {
            $request->merge([
                'skills' => json_decode($request->input('skills'), true) ?? [],
            ]);
        }
 
        $payload = $request->validate([
            'title'          => ['sometimes', 'nullable', 'string', 'max:255'],
            'description'    => ['sometimes', 'nullable', 'string'],
            'repository_url' => ['sometimes', 'nullable', 'string', 'max:255'],
            'url_demo'       => ['sometimes', 'nullable', 'string', 'max:255'],
            'state'          => ['sometimes', 'nullable', 'string', 'in:in_progress,completed,removed'],
            'visibility'     => ['sometimes', 'boolean'],
            'url_photo_main' => ['sometimes', 'nullable', 'string', 'max:255'],
            'photo'          => ['sometimes', 'nullable', 'file', 'image', 'max:5120'],
            '_delete_photo'  => ['sometimes', 'boolean'],
            'skills'                         => ['sometimes', 'array'],
            'skills.*.id_project_skill'      => ['nullable', 'integer'],
            'skills.*.id_skill'              => ['nullable', 'integer'],
            'skills.*._delete'               => ['sometimes', 'boolean'],
        ]);
 
        $exists = DB::table('PROJECT')
            ->where('id_profile', $profile)
            ->where('id_project', $project)
            ->exists();
 
        abort_unless($exists, 404, 'Proyecto no encontrado.');
 
        /* Subida de foto a Cloudinary (igual que banner en updateOffer) */
        if ($request->hasFile('photo') && $request->file('photo')->isValid()) {
            $payload['url_photo_main'] = $cloudinary->upload(
                $request->file('photo'),
                'portafy/projects'
            );
        }

        /* Eliminar foto si se solicita */
        if ($request->boolean('_delete_photo')) {
            $payload['url_photo_main'] = null;
        }
 
        DB::transaction(function () use ($payload, $project) {
            /* Actualizar campos del proyecto */
            $projectData = collect($payload)
                ->only([
                    'title', 'description', 'repository_url', 'url_demo',
                    'state', 'visibility', 'url_photo_main',
                ])
                ->all();
 
            if ($projectData !== []) {
                $projectData['updated_at'] = now();
                DB::table('PROJECT')->where('id_project', $project)->update($projectData);
            }
 
            /* Procesar skills */
            foreach ($payload['skills'] ?? [] as $skill) {
                $skillId = $skill['id_project_skill'] ?? null;
 
                if (($skill['_delete'] ?? false) && $skillId) {
                    /* Eliminar skill existente */
                    DB::table('PROJECT_SKILL')
                        ->where('id_project', $project)
                        ->where('id_project_skill', $skillId)
                        ->delete();
                    continue;
                }
 
                if (!($skill['_delete'] ?? false) && !$skillId && isset($skill['id_skill'])) {
                    /* Agregar skill nueva — respetar el UNIQUE (id_project, id_skill) */
                    $alreadyExists = DB::table('PROJECT_SKILL')
                        ->where('id_project', $project)
                        ->where('id_skill', $skill['id_skill'])
                        ->exists();
 
                    if (!$alreadyExists) {
                        DB::table('PROJECT_SKILL')->insert([
                            'id_project'  => $project,
                            'id_skill'    => $skill['id_skill'],
                            'created_at'  => now(),
                            'updated_at'  => now(),
                        ]);
                    }
                }
            }
        });
 
        return $this->showProject($profile, $project);
    }

    /* ── PUBLICATION ─────────────────────────────────────────────── */
 
public function showPublication(int $profile, int $publication): JsonResponse
{
    $record = DB::table('PUBLICATION')
        ->where('id_profile', $profile)
        ->where('id_publication', $publication)
        ->first();
 
    abort_unless($record, 404, 'Publicación no encontrada.');
 
    /* Detalle (hasOne) */
    $detail = DB::table('PUBLICATION_DETAIL')
        ->where('id_publication', $publication)
        ->first();
 
    /* Audiencias profesionales (hasMany) */
    $audiences = DB::table('PUBLICATION_AUDIENCE_PROFESSIONAL as pap')
        ->leftJoin('PROFESSIONAL_AREA as pa',     'pa.id_professional_area',   '=', 'pap.id_professional_area')
        ->leftJoin('PROFESSIONAL_CAREER as pc',   'pc.id_professional_career', '=', 'pap.id_professional_career')
        ->where('pap.id_publication', $publication)
        ->select([
            'pap.id',
            'pap.id_professional_area',
            'pap.id_professional_career',
            'pa.name  as area_name',
            'pc.name  as career_name',
        ])
        ->get();
 
    /* Catálogos para los comboboxes del frontend */
    $catalogs = [
        'audience_types' => DB::table('AUDIENCE_TYPE')
            ->orderBy('id_audience_type')
            ->get(['id_audience_type as value', 'code', 'name']),
 
        'offers' => DB::table('OFFER')
            ->where('id_profile', $profile)
            ->orderBy('title')
            ->get([
                'id_offer as value',
                DB::raw("COALESCE(title, 'Oferta sin título') as label"),
            ]),
 
        'projects' => DB::table('PROJECT')
            ->where('id_profile', $profile)
            ->orderBy('title')
            ->get([
                'id_project as value',
                DB::raw("COALESCE(title, 'Proyecto sin título') as label"),
            ]),
 
        'cvs' => DB::table('CV')
            ->where('id_profile', $profile)
            ->orderBy('name_cv')
            ->get([
                'id_cv as value',
                DB::raw("COALESCE(name_cv, 'CV sin nombre') as label"),
            ]),
 
        'experiences' => DB::table('EXPERIENCE')
            ->where('id_profile', $profile)
            ->orderBy('title')
            ->get([
                'id_experience as value',
                DB::raw("COALESCE(title, company, 'Experiencia sin título') as label"),
            ]),
 
        /* Todos los perfiles (para id_publicized) — limitado a 200 */
        'profiles' => DB::table('PROFILE')
            ->orderBy('name')
            ->limit(200)
            ->get([
                'id_profile as value',
                DB::raw("TRIM(CONCAT(name, ' ', last_name)) as label"),
            ]),
 
        'professional_areas' => DB::table('PROFESSIONAL_AREA')
            ->orderBy('name')
            ->get(['id_professional_area as value', 'name as label']),
 
        'professional_careers' => DB::table('PROFESSIONAL_CAREER')
            ->orderBy('name')
            ->get(['id_professional_career as value', 'name as label']),
    ];
 
    return response()->json([
        'data' => [
            'publication' => $record,
            'detail'      => $detail,
            'audiences'   => $audiences,
            'catalogs'    => $catalogs,
        ],
    ]);
}
 
public function updatePublication(Request $request, int $profile, int $publication): JsonResponse
{
    $payload = $request->validate([
        'description'      => ['sometimes', 'nullable', 'string', 'max:255'],
        'outstanding'      => ['sometimes', 'boolean'],
        'visibility'       => ['sometimes', 'boolean'],
        'state'            => ['sometimes', 'nullable', 'string', 'in:incomplete,published,removed'],
        'id_audience_type' => ['sometimes', 'nullable', 'integer'],
 
        /* Detalle (registro único) */
        'detail'                          => ['sometimes', 'nullable', 'array'],
        'detail.id_publication_detail'    => ['nullable', 'integer'],
        'detail.id_publicized'            => ['nullable', 'integer'],
        'detail.id_offer'                 => ['nullable', 'integer'],
        'detail.id_project'               => ['nullable', 'integer'],
        'detail.id_cv'                    => ['nullable', 'integer'],
        'detail.id_experience'            => ['nullable', 'integer'],
 
        /* Audiencias profesionales */
        'audiences'                              => ['sometimes', 'array'],
        'audiences.*.id'                         => ['nullable', 'integer'],
        'audiences.*.id_professional_area'       => ['nullable', 'integer'],
        'audiences.*.id_professional_career'     => ['nullable', 'integer'],
        'audiences.*._delete'                    => ['sometimes', 'boolean'],
    ]);
 
    $exists = DB::table('PUBLICATION')
        ->where('id_profile', $profile)
        ->where('id_publication', $publication)
        ->exists();
 
    abort_unless($exists, 404, 'Publicación no encontrada.');
 
    DB::transaction(function () use ($payload, $publication) {
 
        /* ── 1. Actualizar campos principales de PUBLICATION ── */
        $pubData = collect($payload)
            ->only(['description', 'outstanding', 'visibility', 'state', 'id_audience_type'])
            ->all();
 
        if ($pubData !== []) {
            $pubData['updated_at'] = now();
            DB::table('PUBLICATION')
                ->where('id_publication', $publication)
                ->update($pubData);
        }
 
        /* ── 2. Upsert de PUBLICATION_DETAIL ── */
        if (isset($payload['detail'])) {
            $det   = $payload['detail'];
            $detId = $det['id_publication_detail'] ?? null;
 
            $detData = collect($det)
                ->only(['id_publicized', 'id_offer', 'id_project', 'id_cv', 'id_experience'])
                ->all();
 
            if ($detId) {
                /* Actualizar fila existente (los NULL limpian la FK) */
                DB::table('PUBLICATION_DETAIL')
                    ->where('id_publication', $publication)
                    ->where('id_publication_detail', $detId)
                    ->update($detData);
            } else {
                /* Insertar solo si al menos un FK tiene valor */
                $hasValue = collect($detData)->filter(fn ($v) => $v !== null)->isNotEmpty();
                if ($hasValue) {
                    $detData['id_publication'] = $publication;
                    DB::table('PUBLICATION_DETAIL')->insert($detData);
                }
            }
        }
 
        /* ── 3. Procesar PUBLICATION_AUDIENCE_PROFESSIONAL ── */
        foreach ($payload['audiences'] ?? [] as $aud) {
            $audId = $aud['id'] ?? null;
 
            if (($aud['_delete'] ?? false) && $audId) {
                DB::table('PUBLICATION_AUDIENCE_PROFESSIONAL')
                    ->where('id_publication', $publication)
                    ->where('id', $audId)
                    ->delete();
                continue;
            }
 
            /* Insertar nueva (solo si no marcada como eliminar y sin ID) */
            if (!($aud['_delete'] ?? false) && !$audId && isset($aud['id_professional_area'])) {
                DB::table('PUBLICATION_AUDIENCE_PROFESSIONAL')->insert([
                    'id_publication'         => $publication,
                    'id_professional_area'   => $aud['id_professional_area'],
                    'id_professional_career' => $aud['id_professional_career'] ?? null,
                    'created_at'             => now(),
                ]);
            }
        }
    });
 
    return $this->showPublication($profile, $publication);
}

    /* ── SOCIAL NETWORK ──────────────────────────────────────────── */
 
    /**
     * GET  admin/profile/{profile}/socials
     * Devuelve todas las redes sociales del perfil + catálogo de plataformas.
     */
    public function showSocials(int $profile): JsonResponse
    {
        abort_unless(
            DB::table('PROFILE')->where('id_profile', $profile)->exists(),
            404, 'Perfil no encontrado.'
        );
 
        $socials = DB::table('SOCIAL_NETWORK as sn')
            ->leftJoin('PLATFORM as p', 'p.id_platform', '=', 'sn.id_platform')
            ->where('sn.id_profile', $profile)
            ->select([
                'sn.id_social_networks',
                'sn.id_platform',
                'sn.url',
                'sn.public',
                'sn.created_at',
                'sn.updated_at',
                'p.name as platform_name',
            ])
            ->orderBy('p.name')
            ->get();
 
        $platforms = DB::table('PLATFORM')
            ->orderBy('name')
            ->get(['id_platform as value', 'name as label']);
 
        return response()->json([
            'data' => [
                'socials'   => $socials,
                'platforms' => $platforms,
            ],
        ]);
    }
 
    /**
     * POST admin/profile/{profile}/socials
     * Crea una nueva red social para el perfil.
     */
    public function storeSocial(Request $request, int $profile): JsonResponse
    {
        $payload = $request->validate([
            'id_platform' => ['required', 'integer', 'exists:PLATFORM,id_platform'],
            'url'         => ['required', 'string', 'max:255'],
            'public'      => ['sometimes', 'boolean'],
        ]);
 
        abort_unless(
            DB::table('PROFILE')->where('id_profile', $profile)->exists(),
            404, 'Perfil no encontrado.'
        );
 
        /* Respetar el UNIQUE (id_profile, id_platform) */
        $alreadyExists = DB::table('SOCIAL_NETWORK')
            ->where('id_profile',  $profile)
            ->where('id_platform', $payload['id_platform'])
            ->exists();
 
        if ($alreadyExists) {
            return response()->json(
                ['message' => 'Ya existe una red social con esta plataforma para este perfil.'],
                422
            );
        }
 
        $id = DB::table('SOCIAL_NETWORK')->insertGetId([
            'id_profile'  => $profile,
            'id_platform' => $payload['id_platform'],
            'url'         => $payload['url'],
            'public'      => $payload['public'] ?? true,
            'created_at'  => now(),
            'updated_at'  => now(),
        ], 'id_social_networks');
 
        $created = DB::table('SOCIAL_NETWORK as sn')
            ->leftJoin('PLATFORM as p', 'p.id_platform', '=', 'sn.id_platform')
            ->where('sn.id_social_networks', $id)
            ->select([
                'sn.id_social_networks',
                'sn.id_platform',
                'sn.url',
                'sn.public',
                'sn.created_at',
                'sn.updated_at',
                'p.name as platform_name',
            ])
            ->first();
 
        return response()->json(['data' => $created], 201);
    }
 
    /**
     * PUT admin/profile/{profile}/social/{social}
     * Actualiza una red social existente.
     */
    public function updateSocial(Request $request, int $profile, int $social): JsonResponse
    {
        $payload = $request->validate([
            'id_platform' => ['sometimes', 'integer', 'exists:PLATFORM,id_platform'],
            'url'         => ['sometimes', 'string', 'max:255'],
            'public'      => ['sometimes', 'boolean'],
        ]);
 
        $exists = DB::table('SOCIAL_NETWORK')
            ->where('id_profile',        $profile)
            ->where('id_social_networks', $social)
            ->exists();
 
        abort_unless($exists, 404, 'Red social no encontrada.');
 
        /* Si cambia la plataforma, verificar que no haya duplicado */
        if (isset($payload['id_platform'])) {
            $duplicate = DB::table('SOCIAL_NETWORK')
                ->where('id_profile',        $profile)
                ->where('id_platform',       $payload['id_platform'])
                ->where('id_social_networks', '!=', $social)
                ->exists();
 
            if ($duplicate) {
                return response()->json(
                    ['message' => 'Ya existe otra red social con esta plataforma.'],
                    422
                );
            }
        }
 
        $data = collect($payload)->all();
        if ($data !== []) {
            $data['updated_at'] = now();
            DB::table('SOCIAL_NETWORK')
                ->where('id_social_networks', $social)
                ->update($data);
        }
 
        $updated = DB::table('SOCIAL_NETWORK as sn')
            ->leftJoin('PLATFORM as p', 'p.id_platform', '=', 'sn.id_platform')
            ->where('sn.id_social_networks', $social)
            ->select([
                'sn.id_social_networks',
                'sn.id_platform',
                'sn.url',
                'sn.public',
                'sn.created_at',
                'sn.updated_at',
                'p.name as platform_name',
            ])
            ->first();
 
        return response()->json(['data' => $updated]);
    }
 
    /**
     * DELETE admin/profile/{profile}/social/{social}
     * Elimina una red social.
     */
    public function destroySocial(int $profile, int $social): JsonResponse
    {
        $exists = DB::table('SOCIAL_NETWORK')
            ->where('id_profile',        $profile)
            ->where('id_social_networks', $social)
            ->exists();
 
        abort_unless($exists, 404, 'Red social no encontrada.');
 
        DB::table('SOCIAL_NETWORK')
            ->where('id_social_networks', $social)
            ->delete();
 
        return response()->json(['data' => null]);
    }

    /* ── Catálogos internos ──────────────────────────────────────── */
    private function cvDetailCatalogs(int $profile): array
    {
        return [
            'project' => DB::table('PROJECT')
                ->where('id_profile', $profile)
                ->orderBy('title')
                ->get(['id_project as value', 'title as label']),

            'experience' => DB::table('EXPERIENCE')
                ->where('id_profile', $profile)
                ->orderBy('title')
                ->get([
                    'id_experience as value',
                    DB::raw("COALESCE(title, company, 'Experiencia sin titulo') as label"),
                ]),

            'certificate' => DB::table('CERTIFICATE')
                ->where('id_profile', $profile)
                ->orderBy('description')
                ->get([
                    'id_certificate as value',
                    DB::raw("COALESCE(description, 'Certificado sin descripcion') as label"),
                ]),

            'university_career' => DB::table('UNIVERSITY_CAREER')
                ->leftJoin('UNIVERSITY', 'UNIVERSITY.id_university', '=', 'UNIVERSITY_CAREER.id_university')
                ->leftJoin('CAREER',     'CAREER.id_career',         '=', 'UNIVERSITY_CAREER.id_career')
                ->where('UNIVERSITY_CAREER.id_profile', $profile)
                ->orderBy('CAREER.name')
                ->get([
                    'UNIVERSITY_CAREER.id_university_career as value',
                    DB::raw(
                        "TRIM(CONCAT(" .
                            "COALESCE(\"CAREER\".name, 'Formacion'), ' - ', " .
                            "COALESCE(\"UNIVERSITY\".name, 'Institucion sin nombre')" .
                        ")) as label"
                    ),
                ]),

            'social_network' => DB::table('SOCIAL_NETWORK')
                ->leftJoin('PLATFORM', 'PLATFORM.id_platform', '=', 'SOCIAL_NETWORK.id_platform')
                ->where('SOCIAL_NETWORK.id_profile', $profile)
                ->orderBy('PLATFORM.name')
                ->get([
                    'SOCIAL_NETWORK.id_social_networks as value',
                    DB::raw(
                        "COALESCE(\"PLATFORM\".name, \"SOCIAL_NETWORK\".url, 'Red social sin nombre') as label"
                    ),
                ]),

            'skill_profile' => DB::table('SKILL_PROFILE')
                ->leftJoin('SKILL', 'SKILL.id_skill', '=', 'SKILL_PROFILE.id_skill')
                ->where('SKILL_PROFILE.id_profile', $profile)
                ->orderBy('SKILL.name')
                ->get([
                    'SKILL_PROFILE.id_skill_profile as value',
                    DB::raw("COALESCE(\"SKILL\".name, 'Habilidad sin nombre') as label"),
                ]),
        ];
    }
}