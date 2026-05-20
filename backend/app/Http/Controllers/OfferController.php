<?php

namespace App\Http\Controllers;

use App\Models\Offer;
use App\Services\OfferService;
use App\Support\PermissionCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OfferController extends Controller
{
    public function __construct(protected OfferService $offerService) {}

    // ── Feed público — todas las ofertas abiertas ─────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $this->offerService->closeExpiredOffers();
        $offers = Offer::with('skills', 'audienceType')
            ->whereIn('state', ['open', 'visible'])
            ->orderByDesc('created_at')
            ->paginate(10);

        return response()->json($offers);
    }

    // ── Ofertas del reclutador autenticado ────────────────────────────────────
    public function mine(Request $request): JsonResponse
    {
        $this->offerService->closeExpiredOffers();
        $profile = $request->user()->profileRecord();

        Log::info('[mine] profile', ['id_profile' => $profile->id_profile]);

        $offers = Offer::with('skills', 'audienceType')
            ->where('id_profile', $profile->id_profile)
            ->whereNotIn('state', ['removed'])
            ->orderByDesc('created_at')
            ->get();

        $offerIds = $offers->pluck('id_offer')->toArray();

        Log::info('[mine] offerIds', ['ids' => $offerIds]);

        if (empty($offerIds)) {
            Log::info('[mine] sin ofertas, retornando vacío');
            return response()->json(['data' => $offers]);
        }

        try {
            $stats = DB::table(DB::raw('"POSTULATION" as p'))
                ->whereIn('p.id_offer', $offerIds)
                ->select(
                    DB::raw('p.id_offer'),
                    DB::raw('COUNT(*) as total'),
                    DB::raw("SUM(CASE WHEN p.state = 'accepted'        THEN 1 ELSE 0 END) as accepted"),
                    DB::raw("SUM(CASE WHEN p.state = 'refused'         THEN 1 ELSE 0 END) as refused"),
                    DB::raw("SUM(CASE WHEN p.state = 'in_verification' THEN 1 ELSE 0 END) as in_verification"),
                    DB::raw("SUM(CASE WHEN p.state = 'new'             THEN 1 ELSE 0 END) as cnt_new"),
                    DB::raw("SUM(CASE WHEN p.state = 'in_interview'    THEN 1 ELSE 0 END) as in_interview")
                )
                ->groupBy(DB::raw('p.id_offer'))
                ->get()
                ->keyBy('id_offer');

            Log::info('[mine] stats OK', ['count' => $stats->count(), 'data' => $stats->toArray()]);
        } catch (\Exception $e) {
            Log::error('[mine] stats ERROR', ['msg' => $e->getMessage()]);
            $stats = collect();
        }

        try {
            $postulantes = DB::table(DB::raw('"POSTULATION" as p'))
                ->join(DB::raw('"PROFILE" as pr'),       'p.id_postulant',  '=', 'pr.id_profile')
                ->join(DB::raw('"USER_ROLE" as ur'),     'pr.id_user_rol',  '=', 'ur.id_user_role')
                ->join(DB::raw('"USER" as u'),           'ur.id_user',      '=', 'u.id_user')
                ->leftJoin(DB::raw('"JOB_TITLE" as jt'), 'pr.id_job_title', '=', 'jt.id_job_title')
                ->leftJoin(DB::raw('"CV" as cv'),        'p.id_cv',         '=', 'cv.id_cv')
                ->leftJoin(DB::raw('"INTERVIEW" as iv'), 'p.id_postulation','=', 'iv.id_postulation')
                ->whereIn('p.id_offer', $offerIds)
                ->select(
                    DB::raw('p.id_offer'),
                    DB::raw('p.id_postulation'),
                    DB::raw('p.state'),
                    DB::raw('p.reason'),
                    DB::raw('p.created_at'),
                    DB::raw('pr.id_profile'),
                    DB::raw('pr.name'),
                    DB::raw('pr.last_name'),
                    DB::raw('pr.profile_photo'),
                    DB::raw('pr.biography'),
                    DB::raw('u.email'),
                    DB::raw('jt.name as job_title'),
                    DB::raw('p.id_cv'),
                    DB::raw('cv.name_cv'),
                    DB::raw('cv.cv_url'),
                    DB::raw('cv.archive_pdf'),
                    DB::raw('iv.id_interview'),
                    DB::raw('iv.type       as interview_type'),
                    DB::raw('iv.link       as interview_link'),
                    DB::raw('iv.address    as interview_address'),
                    DB::raw('iv.interview_date'),
                    DB::raw('iv.interview_time')
                )
                ->orderBy(DB::raw('p.created_at'), 'desc')
                ->get()
                ->groupBy('id_offer');

            Log::info('[mine] postulantes OK', ['ofertas_con_postulantes' => $postulantes->keys()->toArray()]);
        } catch (\Exception $e) {
            Log::error('[mine] postulantes ERROR', ['msg' => $e->getMessage()]);
            $postulantes = collect();
        }

        $offers->each(function ($offer) use ($stats, $postulantes) {
            $id = $offer->id_offer;

            $offer->stats = $stats->has($id)
                ? [
                    'total'           => (int) $stats[$id]->total,
                    'accepted'        => (int) $stats[$id]->accepted,
                    'refused'         => (int) $stats[$id]->refused,
                    'in_verification' => (int) $stats[$id]->in_verification,
                    'nuevo'           => (int) $stats[$id]->cnt_new,
                    'in_interview'    => (int) $stats[$id]->in_interview,
                ]
                : ['total' => 0, 'accepted' => 0, 'refused' => 0, 'in_verification' => 0, 'nuevo' => 0, 'in_interview' => 0];

            $offer->postulantes = $postulantes->has($id)
                ? $postulantes[$id]->map(fn($p) => [
                    'id_postulation' => $p->id_postulation,
                    'state'          => $p->state,
                    'reason'         => $p->reason,
                    'created_at'     => $p->created_at,
                    'id_profile'     => $p->id_profile,
                    'name'           => $p->name,
                    'last_name'      => $p->last_name,
                    'profile_photo'  => $p->profile_photo,
                    'biography'      => $p->biography,
                    'email'          => $p->email,
                    'job_title'      => $p->job_title ?? null,
                    'has_cv'         => !is_null($p->id_cv ?? null),
                    'id_cv'          => $p->id_cv ?? null,
                    'cv_name'        => $p->cv_name ?? null,
                    'cv_url'         => $p->cv_url ?? null,
                    'archive_pdf'    => $p->archive_pdf ?? null,
                    'interview'      => is_null($p->id_interview) ? null : [
                        'id_interview'     => $p->id_interview,
                        'type'             => $p->interview_type,
                        'link'             => $p->interview_link,
                        'address'          => $p->interview_address,
                        'interview_date'   => $p->interview_date,
                        'interview_time'   => $p->interview_time,
                    ],
                ])->values()
                : collect();

            Log::info('[mine] oferta procesada', [
                'id_offer'          => $id,
                'stats'             => $offer->stats,
                'postulantes_count' => count($offer->postulantes),
            ]);
        });

        return response()->json(['data' => $offers]);
    }

    // ── Detalle de una oferta ─────────────────────────────────────────────────
    public function show(int $id): JsonResponse
    {
        $offer = Offer::with('skills', 'profile', 'audienceType', 'audienceProfessional')
            ->findOrFail($id);

        return response()->json(['offer' => $offer]);
    }

    // ── Crear oferta ──────────────────────────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        try {
            $profile = $request->user()->profileRecord();

            $validated = $request->validate([
                'title'                                  => 'required|string|max:255',
                'description'                            => 'nullable|string',
                'type'                                   => 'nullable|string',
                'modalidad'                              => 'nullable|string',
                'ubicacion'                              => 'nullable|string|max:255',
                'salary_min'                             => 'nullable|integer',
                'salary_max'                             => 'nullable|integer',
                'currency'                               => 'nullable|string|max:10',
                'nivel'                                  => 'nullable|string',
                'area'                                   => 'nullable|string|max:255',
                'show_salary'                            => 'nullable|boolean',
                'quota_quantity'                         => 'nullable|integer',
                'closed_at'                              => 'nullable|date',
                'state'                                  => 'required|in:open,private',
                'skills'                                 => 'nullable|array',
                'skills.*'                               => 'string|max:100',
                'banner'                                 => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
                'id_audience_type'                       => 'required|exists:AUDIENCE_TYPE,id_audience_type',
                'audience_filters'                       => 'nullable|array',
                'audience_filters.id_professional_area'  => 'nullable|integer|exists:PROFESSIONAL_AREA,id_professional_area',
                'audience_filters.career'                => 'nullable|string|max:100',
            ]);

            if ((int) $validated['id_audience_type'] === 4) {
                $request->validate([
                    'audience_filters.id_professional_area' => 'required|integer|exists:PROFESSIONAL_AREA,id_professional_area',
                ]);
            }

            $audienceFilters = $request->input('audience_filters');

            if (in_array($validated['state'], ['open', 'visible'], true) && ! $request->user()->hasPermission(PermissionCatalog::OFFER_PUBLISH)) {
                return response()->json(['message' => 'No tienes permisos para publicar ofertas de trabajo.'], 422);
            }

            $offer = $this->offerService->store(
                $validated,
                $profile,
                $request->file('banner') ?? null,
                $audienceFilters,
            );

            return response()->json([
                'message' => 'Convocatoria creada exitosamente.',
                'offer'   => $offer,
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Datos inválidos.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    // ── Actualizar oferta ─────────────────────────────────────────────────────
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $profile = $request->user()->profileRecord();
            $offer   = Offer::where('id_offer', $id)
                            ->where('id_profile', $profile->id_profile)
                            ->firstOrFail();

            $validated = $request->validate([
                'title'                                  => 'sometimes|string|max:255',
                'description'                            => 'nullable|string',
                'type'                                   => 'nullable|string',
                'modalidad'                              => 'nullable|string',
                'ubicacion'                              => 'nullable|string|max:255',
                'salary_min'                             => 'nullable|integer',
                'salary_max'                             => 'nullable|integer',
                'currency'                               => 'nullable|string|max:10',
                'nivel'                                  => 'nullable|string',
                'area'                                   => 'nullable|string|max:255',
                'show_salary'                            => 'nullable|boolean',
                'quota_quantity'                         => 'nullable|integer',
                'closed_at'                              => 'nullable|date',
                'state'                                  => 'nullable|in:open,visible,closed,private',
                'skills'                                 => 'nullable|array',
                'skills.*'                               => 'string|max:100',
                'banner'                                 => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
                'id_audience_type'                       => 'nullable|exists:AUDIENCE_TYPE,id_audience_type',
                'audience_filters'                       => 'nullable|array',
                'audience_filters.id_professional_area'  => 'nullable|integer|exists:PROFESSIONAL_AREA,id_professional_area',
                'audience_filters.career'                => 'nullable|string|max:100',
            ]);

            $audienceFilters = $request->input('audience_filters');

            $finalState = $validated['state'] ?? $offer->state;
            if (in_array($finalState, ['open', 'visible'], true) && ! $request->user()->hasPermission(PermissionCatalog::OFFER_PUBLISH)) {
                return response()->json(['message' => 'No tienes permisos para publicar ofertas de trabajo.'], 422);
            }

            $audienceFilters = $request->input('audience_filters');

            $offer = $this->offerService->update(
                $offer,
                $validated,
                $request->file('banner') ?? null,
                $audienceFilters,
            );

            return response()->json([
                'message' => 'Convocatoria actualizada.',
                'offer'   => $offer,
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Datos inválidos.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    // ── Eliminar (soft delete) ────────────────────────────────────────────────
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $profile = $request->user()->profileRecord();
            $offer   = Offer::where('id_offer', $id)
                            ->where('id_profile', $profile->id_profile)
                            ->firstOrFail();

            $this->offerService->destroy($offer);

            return response()->json(['message' => 'Convocatoria eliminada.']);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    // ── Stats de postulantes para todas las ofertas del reclutador ────────────
    public function stats(Request $request): JsonResponse
    {
        $profile = $request->user()->profileRecord();

        $stats = DB::table(DB::raw('"POSTULATION" as p'))
            ->join(DB::raw('"OFFER" as o'), 'p.id_offer', '=', 'o.id_offer')
            ->where('o.id_profile', $profile->id_profile)
            ->whereNotIn('o.state', ['removed'])
            ->select(
                DB::raw('p.id_offer'),
                DB::raw('COUNT(*) as total'),
                DB::raw("SUM(CASE WHEN p.state = 'accepted'        THEN 1 ELSE 0 END) as accepted"),
                DB::raw("SUM(CASE WHEN p.state = 'refused'         THEN 1 ELSE 0 END) as refused"),
                DB::raw("SUM(CASE WHEN p.state = 'in_verification' THEN 1 ELSE 0 END) as in_verification"),
                DB::raw("SUM(CASE WHEN p.state = 'new'             THEN 1 ELSE 0 END) as cnt_new"),
                DB::raw("SUM(CASE WHEN p.state = 'in_interview'    THEN 1 ELSE 0 END) as in_interview")
            )
            ->groupBy(DB::raw('p.id_offer'))
            ->get();

        return response()->json(['stats' => $stats]);
    }
}
