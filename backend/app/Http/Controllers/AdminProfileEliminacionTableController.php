<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

/**
 * AdminProfileEliminacionTableController
 *
 * Maneja la "eliminación" de registros para el módulo de administración.
 * - Si la tabla tiene un campo de estado con valor 'removed', hace soft-delete.
 * - Si la tabla tiene removed_at, lo rellena con la fecha actual.
 * - Si la tabla tiene `active`, lo pone en false.
 * - Si la tabla no tiene ninguno de esos mecanismos, hace delete real.
 *
 * Endpoint: POST admin/eliminacion/{profile}/{resource}/bulk-delete
 * Body: { "ids": [1, 2, 3] }
 */
class AdminProfileEliminacionTableController extends Controller
{
    /**
     * Configuración de cada recurso.
     *
     * Claves:
     *  - table          : nombre real de la tabla en BD
     *  - profileColumn  : columna que referencia al perfil
     *  - primaryKey     : clave primaria de la tabla
     *  - softDelete     : tipo de soft-delete ('state' | 'removed_at' | 'active' | null)
     *  - softValue      : valor a asignar cuando softDelete = 'state'
     */
    private const RESOURCES = [

        /* ── Soft-delete por state = 'removed' ── */
        'offers' => [
            'table'         => 'OFFER',
            'profileColumn' => 'id_profile',
            'primaryKey'    => 'id_offer',
            'softDelete'    => 'state',
            'softValue'     => 'removed',
        ],
        'projects' => [
            'table'         => 'PROJECT',
            'profileColumn' => 'id_profile',
            'primaryKey'    => 'id_project',
            'softDelete'    => 'state',
            'softValue'     => 'removed',
        ],
        'publications' => [
            'table'         => 'PUBLICATION',
            'profileColumn' => 'id_profile',
            'primaryKey'    => 'id_publication',
            'softDelete'    => 'state',
            'softValue'     => 'removed',
        ],

        /* ── Soft-delete por removed_at ── */
        'comments' => [
            'table'         => 'COMMENT',
            'profileColumn' => 'id_commentator',
            'primaryKey'    => 'id_comment',
            'softDelete'    => 'removed_at',
            'softValue'     => null, // se usa now()
        ],

        /* ── Soft-delete por active = false ── */
        'providers' => [
            'table'         => 'PROVIDER',
            'profileColumn' => 'id_profile',
            'primaryKey'    => 'id_provider',
            'softDelete'    => 'active',
            'softValue'     => false,
        ],

        /* ── Delete real (no tienen campo de estado útil) ── */
        'cvs' => [
            'table'         => 'CV',
            'profileColumn' => 'id_profile',
            'primaryKey'    => 'id_cv',
            'softDelete'    => null,
        ],
        'skills' => [
            'table'         => 'SKILL_PROFILE',
            'profileColumn' => 'id_profile',
            'primaryKey'    => 'id_skill_profile',
            'softDelete'    => null,
        ],
        'experiences' => [
            'table'         => 'EXPERIENCE',
            'profileColumn' => 'id_profile',
            'primaryKey'    => 'id_experience',
            'softDelete'    => null,
        ],
        'postulations' => [
            'table'         => 'POSTULATION',
            'profileColumn' => 'id_postulant',
            'primaryKey'    => 'id_postulation',
            'softDelete'    => null,
        ],
        'saved' => [
            'table'         => 'SAVED',
            'profileColumn' => 'id_profile',
            'primaryKey'    => 'id_saved',
            'softDelete'    => null,
        ],
    ];

    /**
     * POST admin/eliminacion/{profile}/{resource}/bulk-delete
     */
    public function bulkDelete(Request $request, int $profile, string $resource): JsonResponse
    {
        abort_unless(isset(self::RESOURCES[$resource]), 404, 'Recurso no soportado.');

        $payload = $request->validate([
            'ids'   => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ]);

        $config     = self::RESOURCES[$resource];
        $table      = $config['table'];
        $profileCol = $config['profileColumn'];
        $pk         = $config['primaryKey'];

        /* Verificar que los IDs pertenezcan al perfil */
        $validIds = DB::table($table)
            ->where($profileCol, $profile)
            ->whereIn($pk, $payload['ids'])
            ->pluck($pk)
            ->all();

        if (empty($validIds)) {
            return response()->json([
                'data' => [
                    'affected'  => 0,
                    'requested' => count($payload['ids']),
                    'not_found' => count($payload['ids']),
                    'message'   => 'Ningún ID pertenece a este perfil.',
                    'mode'      => 'none',
                ],
            ], 422);
        }

        $affected = 0;
        $mode     = 'hard';

        DB::transaction(function () use ($config, $table, $pk, $validIds, &$affected, &$mode) {

            switch ($config['softDelete']) {

                /* ── state = 'removed' ── */
                case 'state':
                    $affected = DB::table($table)
                        ->whereIn($pk, $validIds)
                        ->update([
                            'state'      => $config['softValue'],
                            'updated_at' => now(),
                        ]);
                    $mode = 'soft:state';
                    break;

                /* ── removed_at = now() ── */
                case 'removed_at':
                    $affected = DB::table($table)
                        ->whereIn($pk, $validIds)
                        ->update([
                            'removed_at' => now(),
                            'updated_at' => now(),
                        ]);
                    $mode = 'soft:removed_at';
                    break;

                /* ── active = false ── */
                case 'active':
                    $affected = DB::table($table)
                        ->whereIn($pk, $validIds)
                        ->update([
                            'active'     => false,
                            'updated_at' => now(),
                        ]);
                    $mode = 'soft:active';
                    break;

                /* ── Delete real ── */
                default:
                    $affected = DB::table($table)
                        ->whereIn($pk, $validIds)
                        ->delete();
                    $mode = 'hard';
                    break;
            }
        });

        return response()->json([
            'data' => [
                'affected'  => $affected,
                'requested' => count($payload['ids']),
                'not_found' => count($payload['ids']) - count($validIds),
                'mode'      => $mode,
            ],
        ]);
    }

    /**
 * GET admin/eliminacion/{profile}/datos-personales
 */
public function showDatosPersonales(int $profile): JsonResponse
{
    abort_unless(DB::table('PROFILE')->where('id_profile', $profile)->exists(), 404, 'Perfil no encontrado.');

    /* Proveedores */
    $providers = DB::table('PROVIDER')
        ->where('id_profile', $profile)
        ->get(['id_provider', 'provider', 'active', 'created_at']);

    /* Compañía (via PROFILE.id_company) */
    $profileRow = DB::table('PROFILE')
        ->leftJoin('COMPANY',    'COMPANY.id_company',       '=', 'PROFILE.id_company')
        ->leftJoin('JOB_TITLE',  'JOB_TITLE.id_job_title',  '=', 'PROFILE.id_job_title')
        ->where('PROFILE.id_profile', $profile)
        ->select(['PROFILE.id_company', 'COMPANY.name as company_name',
                  'PROFILE.id_job_title', 'JOB_TITLE.name as job_title_name'])
        ->first();

    $company = $profileRow?->id_company
        ? ['id_company' => $profileRow->id_company, 'name' => $profileRow->company_name]
        : null;

$job_title = $profileRow?->id_job_title
    ? ['id_job_title' => $profileRow->id_job_title, 'name' => $profileRow->job_title_name]
    : null;

    /* Redes Sociales */
    $socials = DB::table('SOCIAL_NETWORK as sn')
        ->leftJoin('PLATFORM as p', 'p.id_platform', '=', 'sn.id_platform')
        ->where('sn.id_profile', $profile)
        ->get(['sn.id_social_networks', 'p.name as platform_name', 'sn.url', 'sn.public']);

    /* Estudios */
    $studies = DB::table('UNIVERSITY_CAREER as uc')
        ->leftJoin('UNIVERSITY as u', 'u.id_university', '=', 'uc.id_university')
        ->leftJoin('CAREER as c',     'c.id_career',     '=', 'uc.id_career')
        ->where('uc.id_profile', $profile)
        ->get(['uc.id_university_career', 'c.name as career_name',
               'u.name as university_name', 'uc.training_type']);

    return response()->json(['data' => compact('providers','company','socials','job_title','studies')]);
}

/**
 * POST admin/eliminacion/{profile}/datos-personales/delete
 */
public function deleteDatosPersonales(Request $request, int $profile): JsonResponse
{
    $payload = $request->validate([
        'provider_ids'          => ['sometimes', 'array'],
        'provider_ids.*'        => ['integer'],
        'delete_company'        => ['sometimes', 'boolean'],
        'social_network_ids'    => ['sometimes', 'array'],
        'social_network_ids.*'  => ['integer'],
        'delete_job_title'      => ['sometimes', 'boolean'],
        'university_career_ids' => ['sometimes', 'array'],
        'university_career_ids.*' => ['integer'],
    ]);

    abort_unless(DB::table('PROFILE')->where('id_profile', $profile)->exists(), 404);

    DB::transaction(function () use ($payload, $profile) {
        /* Proveedores → soft-delete (active = false) */
        if (!empty($payload['provider_ids'])) {
            DB::table('PROVIDER')
                ->where('id_profile', $profile)
                ->whereIn('id_provider', $payload['provider_ids'])
                ->update(['active' => false, 'updated_at' => now()]);
        }

        /* Compañía → nullify id_company en PROFILE */
        if ($payload['delete_company'] ?? false) {
            DB::table('PROFILE')
                ->where('id_profile', $profile)
                ->update(['id_company' => null, 'updated_at' => now()]);
        }

        /* Redes Sociales → delete real */
        if (!empty($payload['social_network_ids'])) {
            DB::table('SOCIAL_NETWORK')
                ->where('id_profile', $profile)
                ->whereIn('id_social_networks', $payload['social_network_ids'])
                ->delete();
        }

        /* Título profesional → nullify id_job_title en PROFILE */
        if ($payload['delete_job_title'] ?? false) {
            DB::table('PROFILE')
                ->where('id_profile', $profile)
                ->update(['id_job_title' => null, 'updated_at' => now()]);
        }

        /* Estudios → delete real */
        if (!empty($payload['university_career_ids'])) {
            DB::table('UNIVERSITY_CAREER')
                ->where('id_profile', $profile)
                ->whereIn('id_university_career', $payload['university_career_ids'])
                ->delete();
        }
    });

    return response()->json(['data' => ['message' => 'Eliminación completada.']]);
}
}