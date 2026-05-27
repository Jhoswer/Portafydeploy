<?php

namespace App\Http\Controllers;

use App\Models\Emoji;
use App\Models\Experience;
use App\Models\Profile;
use App\Models\Publication;
use App\Models\PublicationAudienceProfessional;
use App\Models\PublicationComment;
use App\Models\PublicationDetail;
use App\Models\ProfileVerificationRequest;
use App\Models\Reaction;
use App\Models\SavedPublication;
use App\Models\Proyecto;
use App\Services\NotificationService;
use App\Services\PublicAssetUrlService;
use App\Support\PermissionCatalog;
use App\Support\OfficialSchema;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class FeedController extends Controller
{
    private const COMMENT_MAX_LENGTH = 280;

    public function __construct(
        private readonly PublicAssetUrlService $assetUrlService,
        private readonly NotificationService $notificationService,
    ) {}


   public function index(Request $request): JsonResponse
{
    $limit = $this->boundedLimit($request);

    // Intenta autenticar sin forzar — visitantes sin token obtienen null
    $user          = auth('sanctum')->user();
    $viewerProfile = $user
        ? OfficialSchema::ensureProfile($user)
        : null;

    $publications = $this->baseFeedQuery($viewerProfile, includeComments: false)
        ->published()
        ->where(function (Builder $q) use ($viewerProfile) {
            // ── Tipo 1: público — siempre visible ─────────────────────
            $q->where('PUBLICATION.id_audience_type', 1);

            if (!$viewerProfile) {
                return;
            }

            $viewerId = $viewerProfile->getKey();

            // ── Tipo 2: seguidores ─────────────────────────────────────
            $q->orWhere(function (Builder $fq) use ($viewerId) {
                $fq->where('PUBLICATION.id_audience_type', 2)
                    ->where(function (Builder $rq) use ($viewerId) {
                        $rq->whereExists(function ($sq) use ($viewerId) {
                                $sq->from('RELATION')
                                    ->where('state_relation', 'friends')
                                    ->whereColumn('RELATION.id_profile2', 'PUBLICATION.id_profile')
                                    ->where('RELATION.id_profile1', $viewerId);
                            })
                            ->orWhereColumn('PUBLICATION.id_profile', DB::raw($viewerId));
                    });
            });

            // ── Tipo 3: conexiones ─────────────────────────────────────
            $q->orWhere(function (Builder $fq) use ($viewerId) {
                $fq->where('PUBLICATION.id_audience_type', 3)
                    ->where(function (Builder $rq) use ($viewerId) {
                        $rq->whereExists(function ($sq) use ($viewerId) {
                                $sq->from('RELATION')
                                    ->where('state_relation', 'friends')
                                    ->whereColumn('RELATION.id_profile2', 'PUBLICATION.id_profile')
                                    ->where('RELATION.id_profile1', $viewerId);
                            })
                            ->orWhereColumn('PUBLICATION.id_profile', DB::raw($viewerId));
                    });
            });

            // ── Tipo 4: tipo de profesional ────────────────────────────
            $q->orWhere(function (Builder $fq) use ($viewerId) {
                $fq->where('PUBLICATION.id_audience_type', 4)
                    ->where(function (Builder $rq) use ($viewerId) {
                        $rq->whereColumn('PUBLICATION.id_profile', DB::raw($viewerId))

                            // Caso A: oferta → PUBLICATION_DETAIL → OFFER_AUDIENCE_PROFESSIONAL
                            ->orWhereExists(function ($sq) use ($viewerId) {
                                $sq->from('PUBLICATION_DETAIL as pd')
                                    ->join('OFFER_AUDIENCE_PROFESSIONAL as oap', 'oap.id_offer', '=', 'pd.id_offer')
                                    ->join('UNIVERSITY_CAREER as uc', 'uc.id_profile', '=', DB::raw($viewerId))
                                    ->join('CAREER as c', 'c.id_career', '=', 'uc.id_career')
                                    ->join('PROFESSIONAL_CAREER as pc', function ($join) {
                                        $join->on('pc.id_professional_area', '=', 'oap.id_professional_area')
                                             ->whereRaw('LOWER(pc.name) = LOWER(c.name)');
                                    })
                                    ->whereColumn('pd.id_publication', 'PUBLICATION.id_publication')
                                    ->whereNotNull('pd.id_offer')
                                    ->where(function ($cq) {
                                        $cq->whereNull('oap.id_professional_career')
                                           ->orWhereColumn('oap.id_professional_career', 'pc.id_professional_career');
                                    });
                            })

                            // Caso B: proyecto/experiencia → PUBLICATION_AUDIENCE_PROFESSIONAL
                            ->orWhereExists(function ($sq) use ($viewerId) {
                                $sq->from('PUBLICATION_AUDIENCE_PROFESSIONAL as pap')
                                    ->join('UNIVERSITY_CAREER as uc', 'uc.id_profile', '=', DB::raw($viewerId))
                                    ->join('CAREER as c', 'c.id_career', '=', 'uc.id_career')
                                    ->join('PROFESSIONAL_CAREER as pc', function ($join) {
                                        $join->on('pc.id_professional_area', '=', 'pap.id_professional_area')
                                             ->whereRaw('LOWER(pc.name) = LOWER(c.name)');
                                    })
                                    ->whereColumn('pap.id_publication', 'PUBLICATION.id_publication')
                                    ->where(function ($cq) {
                                        $cq->whereNull('pap.id_professional_career')
                                           ->orWhereColumn('pap.id_professional_career', 'pc.id_professional_career');
                                    });
                            });
                    });
            });
        })
        ->orderByDesc('PUBLICATION.created_at')
        ->limit($limit)
        ->get()
        ->map(fn(Publication $publication) => $this->toPost($publication, $viewerProfile))
        ->values();

    return response()->json(['data' => $publications]);
}

    private function toOfferPost(\App\Models\Offer $offer): array
    {
        $profile = $offer->profile;

        return [
            'id'            => 'offer-' . $offer->id_offer,
            'publicationId' => 'offer-' . $offer->id_offer,
            'type'          => 'oferta',
            'sourceType'    => 'offer',
            'offerId'       => $offer->id_offer,
            'author'        => [
                'id'     => $profile?->id_profile,
                'name'   => $profile?->company?->name ?? 'Empresa',
                'title'  => $profile?->company?->industry ?? 'Empresa',
                'avatar' => $profile?->company?->logo_url ?? '',
            ],
            'content'       => $offer->description ?? '',
            'title'         => $offer->title,
            'type_contrato' => $offer->type,
            'modalidad'     => $offer->modalidad,
            'ubicacion'     => $offer->ubicacion,
            'nivel'         => $offer->nivel,
            'area'          => $offer->area,
            'salary_min'    => $offer->salary_min,
            'salary_max'    => $offer->salary_max,
            'currency'      => $offer->currency,
            'show_salary'   => $offer->show_salary,
            'closed_at'     => $offer->closed_at?->toDateString(),
            'banner_url'    => $offer->banner_url,
            'tags'          => $offer->skills->pluck('name')->values()->all(),
            'likes'         => 0,
            'commentsCount' => 0,
            'saves'         => 0,
            'likedByMe'     => false,
            'savedByMe'     => false,
            'posted'        => $offer->created_at?->diffForHumans() ?? '',
            'createdAt'     => $offer->created_at?->toISOString(),
            'comments'      => [],
        ];
    }

    public function mine(Request $request): JsonResponse
    {
        $limit   = $this->boundedLimit($request);
        $profile = OfficialSchema::ensureProfile($request->user());

        $publications = $this->baseFeedQuery($profile, includeComments: false)
            ->where('PUBLICATION.id_profile', $profile->getKey())
            ->published()
            ->orderByDesc('PUBLICATION.created_at')
            ->limit($limit)
            ->get();

        return response()->json([
            'data' => $publications->map(fn(Publication $publication) => $this->toPost($publication, $profile))->values(),
        ]);
    }

    public function saved(Request $request): JsonResponse
    {
        $limit   = $this->boundedLimit($request);
        $profile = OfficialSchema::ensureProfile($request->user());

        $savedRows = SavedPublication::query()
            ->where('id_profile', $profile->getKey())
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        $publicationIds = $savedRows
            ->pluck('id_publication')
            ->filter()
            ->values();

        $publications = $this->baseFeedQuery($profile, includeComments: false)
            ->published()
            ->whereIn('PUBLICATION.id_publication', $publicationIds)
            ->get()
            ->keyBy(fn(Publication $publication) => (int) $publication->getKey());

        $posts = $savedRows
            ->map(function (SavedPublication $saved) use ($publications, $profile) {
                $publication = $publications->get((int) $saved->id_publication);

                if (!$publication) {
                    return null;
                }

                return [
                    ...$this->toPost($publication, $profile),
                    'savedAt'    => $saved->created_at?->toISOString(),
                    'savedLabel' => $saved->created_at?->diffForHumans() ?? '',
                ];
            })
            ->filter()
            ->values();

        return response()->json(['data' => $posts]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $profile     = OfficialSchema::ensureProfile($request->user());
        $publication = Publication::query()
            ->where('PUBLICATION.id_publication', $id)
            ->where(function (Builder $query) use ($profile) {
                $query->where(function (Builder $publishedQuery) {
                    $publishedQuery->where('PUBLICATION.state', 'published')
                                   ->where('PUBLICATION.visibility', true);
                })->orWhere('PUBLICATION.id_profile', $profile->getKey());
            })
            ->firstOrFail();

        return response()->json([
            'post' => $this->toPost($this->loadPublication($publication, $profile, includeComments: true), $profile),
        ]);
    }

    public function comments(Request $request, int $id): JsonResponse
    {
        $profile = OfficialSchema::ensureProfile($request->user());

        $publication = Publication::query()
            ->where('PUBLICATION.id_publication', $id)
            ->where(function (Builder $query) use ($profile) {
                $query->where(function (Builder $publishedQuery) {
                    $publishedQuery->where('PUBLICATION.state', 'published')
                        ->where('PUBLICATION.visibility', true);
                })->orWhere('PUBLICATION.id_profile', $profile->getKey());
            })
            ->firstOrFail();

        $post = $this->toPost($this->loadPublication($publication, $profile, includeComments: true), $profile);

        return response()->json([
            'comments' => $post['comments'] ?? [],
            'commentsCount' => $post['commentsCount'] ?? count($post['comments'] ?? []),
        ]);
    }

    /**
     * Publica un proyecto en el feed.
     * Acepta opcionalmente:
     *   - id_audience_type (int)  → 1 público | 2 seguidores | 3 conexiones | 4 profesional
     *   - audience_filters[id_professional_area] (int)   → requerido si tipo 4
     *   - audience_filters[id_professional_career] (int) → opcional si tipo 4
     */
    public function publishProject(Request $request, int $id): JsonResponse
    {
        if (! $request->user()->hasPermission(PermissionCatalog::FEED_PUBLISH)) {
            return response()->json(['message' => 'No tienes permisos para publicar en el feed.'], 422);
        }

        $project         = Proyecto::forUser($request->user()->id)->findOrFail($id);
        $profile         = $project->profile ?: OfficialSchema::ensureProfile($request->user());
        $content         = $request->input('content') ?: $this->defaultProjectContent($project);
        $audienceType    = (int) $request->input('id_audience_type', 1);
        $audienceFilters = $request->input('audience_filters');

        $publication = DB::transaction(function () use ($project, $profile, $content, $audienceType, $audienceFilters) {
            $publication = $this->findPublicationByDetail('id_project', $project->getKey());

            if ($publication) {
                $publication->update([
                    'description'      => Str::limit($content, 255, ''),
                    'visibility'       => true,
                    'state'            => 'published',
                    'id_profile'       => $profile->getKey(),
                    'id_audience_type' => $audienceType,
                ]);

                $publication->detail()->update([
                    'id_publicized' => $profile->getKey(),
                    'id_project'    => $project->getKey(),
                    'id_experience' => null,
                ]);
            } else {
                $publication = Publication::create([
                    'description'      => Str::limit($content, 255, ''),
                    'outstanding'      => false,
                    'visibility'       => true,
                    'state'            => 'published',
                    'id_profile'       => $profile->getKey(),
                    'id_audience_type' => $audienceType,
                ]);

                PublicationDetail::create([
                    'id_publicized'  => $profile->getKey(),
                    'id_project'     => $project->getKey(),
                    'id_publication' => $publication->getKey(),
                ]);
            }

            $this->syncAudienceProfessional($publication->getKey(), $audienceType, $audienceFilters);

            return $publication;
        });

        return response()->json([
            'message' => 'Proyecto compartido en el feed.',
            'post'    => $this->toPost($this->loadPublication($publication, $profile, includeComments: false), $profile),
        ], $publication->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Publica una experiencia en el feed.
     * Acepta opcionalmente:
     *   - id_audience_type (int)  → 1 público | 2 seguidores | 3 conexiones | 4 profesional
     *   - audience_filters[id_professional_area] (int)   → requerido si tipo 4
     *   - audience_filters[id_professional_career] (int) → opcional si tipo 4
     */
    public function publishExperience(Request $request, int $id): JsonResponse
    {
        if (! $request->user()->hasPermission(PermissionCatalog::FEED_PUBLISH)) {
            return response()->json(['message' => 'No tienes permisos para publicar en el feed.'], 422);
        }

        $experience      = Experience::forUser($request->user()->id)->findOrFail($id);
        $profile         = $experience->profile ?: OfficialSchema::ensureProfile($request->user());
        $content         = $request->input('content') ?: $this->defaultExperienceContent($experience);
        $audienceType    = (int) $request->input('id_audience_type', 1);
        $audienceFilters = $request->input('audience_filters');

        $publication = DB::transaction(function () use ($experience, $profile, $content, $audienceType, $audienceFilters) {
            $publication = $this->findPublicationByDetail('id_experience', $experience->getKey());

            if ($publication) {
                $publication->update([
                    'description'      => Str::limit($content, 255, ''),
                    'visibility'       => true,
                    'state'            => 'published',
                    'id_profile'       => $profile->getKey(),
                    'id_audience_type' => $audienceType,
                ]);

                $publication->detail()->update([
                    'id_publicized' => $profile->getKey(),
                    'id_project'    => null,
                    'id_experience' => $experience->getKey(),
                ]);
            } else {
                $publication = Publication::create([
                    'description'      => Str::limit($content, 255, ''),
                    'outstanding'      => false,
                    'visibility'       => true,
                    'state'            => 'published',
                    'id_profile'       => $profile->getKey(),
                    'id_audience_type' => $audienceType,
                ]);

                PublicationDetail::create([
                    'id_publicized'  => $profile->getKey(),
                    'id_experience'  => $experience->getKey(),
                    'id_publication' => $publication->getKey(),
                ]);
            }

            $this->syncAudienceProfessional($publication->getKey(), $audienceType, $audienceFilters);

            return $publication;
        });

        return response()->json([
            'message' => 'Experiencia compartida en el feed.',
            'post'    => $this->toPost($this->loadPublication($publication, $profile, includeComments: false), $profile),
        ], $publication->wasRecentlyCreated ? 201 : 200);
    }

    public function unshare(Request $request, int $id): JsonResponse
    {
        $profile = OfficialSchema::ensureProfile($request->user());

        $publication = Publication::query()
            ->with('detail')
            ->where('PUBLICATION.id_publication', $id)
            ->where('PUBLICATION.id_profile', $profile->getKey())
            ->firstOrFail();

        $publication->update(['visibility' => false]);

        return response()->json([
            'message'       => 'Elemento retirado del feed.',
            'publicationId' => (int) $publication->getKey(),
            'projectId'     => $publication->detail?->id_project,
            'experienceId'  => $publication->detail?->id_experience,
        ]);
    }

    public function toggleLike(Request $request, int $id): JsonResponse
    {
        if (! $request->user()->hasPermission(PermissionCatalog::FEED_REACT)) {
            return response()->json(['message' => 'No tienes permisos para reaccionar a publicaciones.'], 422);
        }

        $profile     = OfficialSchema::ensureProfile($request->user());
        $publication = Publication::published()
            ->with('profile.userRole.user')
            ->findOrFail($id);
        $emoji = $this->likeEmoji();

        $reaction = Reaction::query()
            ->where('id_publication', $publication->getKey())
            ->where('id_reactor', $profile->getKey())
            ->first();

        $liked = false;

        if ($reaction) {
            $reaction->delete();
        } else {
            Reaction::create([
                'id_publication' => $publication->getKey(),
                'id_reactor'     => $profile->getKey(),
                'id_emoji'       => $emoji->getKey(),
            ]);
            $liked = true;
        }

        $notification = null;
        try {
            $owner = $publication->profile?->userRole?->user;

            if ($liked && $owner && $owner->id !== $request->user()->id) {
                $actorName = trim($request->user()->name . ' ' . $request->user()->last_name);

                $notification = $this->notificationService->createActivity(
                    receiver:      $owner,
                    sender:        $request->user(),
                    type:          'like',
                    title:         'Nueva reaccion',
                    message:       "{$actorName} reacciono a tu publicacion.",
                    referenceType: 'publication',
                    referenceId:   (int) $publication->getKey(),
                    device:        $request->userAgent(),
                    location:      $request->ip(),
                );
            }
        } catch (\Throwable $e) {
            Log::error('[toggleLike notification error] ' . $e->getMessage());
        }

        return response()->json([
            'liked'                => $liked,
            'notification_created' => (bool) $notification,
            'post'                 => $this->toPost(
                $this->loadPublication($publication->fresh(), $profile, includeComments: false),
                $profile
            ),
        ]);
    }

    public function toggleSave(Request $request, int $id): JsonResponse
    {
        $profile     = OfficialSchema::ensureProfile($request->user());
        $publication = Publication::published()->with('detail')->findOrFail($id);

        $saved = SavedPublication::query()
            ->where('id_publication', $publication->getKey())
            ->where('id_profile', $profile->getKey())
            ->first();

        $isSaved = false;

        if ($saved) {
            $saved->delete();
        } else {
            SavedPublication::create([
                'id_publication' => $publication->getKey(),
                'id_profile'     => $profile->getKey(),
                'id_project'     => $publication->detail?->id_project,
            ]);
            $isSaved = true;
        }

        return response()->json([
            'saved' => $isSaved,
            'post'  => $this->toPost(
                $this->loadPublication($publication->fresh(), $profile, includeComments: false),
                $profile
            ),
        ]);
    }

    public function comment(Request $request, int $id): JsonResponse
    {
        if (! $request->user()->hasPermission(PermissionCatalog::FEED_COMMENT)) {
            return response()->json(['message' => 'No tienes permisos para comentar publicaciones.'], 422);
        }

        $profile     = OfficialSchema::ensureProfile($request->user());
        $publication = Publication::published()
            ->with('profile.userRole.user')
            ->findOrFail($id);
        $comment = $this->normalizeComment((string) $request->input('comment', ''));

        $validator = Validator::make(
            ['comment' => $comment],
            [
                'comment' => [
                    'required',
                    'string',
                    'max:' . self::COMMENT_MAX_LENGTH,
                    "regex:/\\A[\\pL\\pN\\s.,;:!?¡¿'\"()@#%&+\\-_\\/]+\\z/u",
                ],
            ],
            [
                'comment.required' => 'Escribe un comentario antes de enviarlo.',
                'comment.max'      => 'El comentario no puede superar ' . self::COMMENT_MAX_LENGTH . ' caracteres.',
                'comment.regex'    => 'Usa solo letras, numeros, espacios y puntuacion comun.',
            ]
        );

        $data = $validator->validate();

        $newComment = PublicationComment::create([
            'id_publication'  => $publication->getKey(),
            'id_commentator'  => $profile->getKey(),
            'comment'         => $data['comment'],
        ]);

        $notification = null;
        $owner        = $publication->profile?->userRole?->user;
        if ($owner && $owner->id !== $request->user()->id) {
            $actorName = trim($request->user()->nombre . ' ' . $request->user()->apellido);

            $notification = $this->notificationService->createActivity(
                receiver:      $owner,
                sender:        $request->user(),
                type:          'comment',
                title:         'Nuevo comentario',
                message:       "{$actorName} comento tu publicacion: " . Str::limit($data['comment'], 80),
                referenceType: 'comment',
                referenceId:   (int) $newComment->getKey(),
                device:        $request->userAgent(),
                location:      $request->ip(),
            );
        }

        return response()->json([
            'message'              => 'Comentario publicado.',
            'notification_created' => (bool) $notification,
            'post'                 => $this->toPost(
                $this->loadPublication($publication->fresh(), $profile, includeComments: true),
                $profile
            ),
        ], 201);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Métodos privados
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Sincroniza los filtros de audiencia profesional.
     * Si el tipo es 4 y hay filtros, los guarda/actualiza.
     * Si el tipo cambia a otro, elimina los filtros previos.
     */
    private function syncAudienceProfessional(int $publicationId, int $audienceType, ?array $filters): void
    {
        PublicationAudienceProfessional::where('id_publication', $publicationId)->delete();

        if ($audienceType === 4 && !empty($filters['id_professional_area'])) {
            PublicationAudienceProfessional::insert([
                'id_publication'         => $publicationId,
                'id_professional_area'   => $filters['id_professional_area'],
                'id_professional_career' => $filters['id_professional_career'] ?? null,
            ]);
        }
    }

    private function normalizeComment(string $comment): string
    {
        $comment = preg_replace('/[\\x00-\\x1F\\x7F]/u', ' ', $comment) ?? '';
        $comment = preg_replace('/\\s+/u', ' ', $comment) ?? '';

        return trim($comment);
    }

    private function boundedLimit(Request $request): int
    {
        return max(1, min((int) $request->integer('limit', 20), 50));
    }

    private function baseFeedQuery(?Profile $viewerProfile = null, bool $includeComments = false): Builder
    {
        $query = Publication::query()
            ->from('PUBLICATION')  // ← fuerza el alias de tabla explícito
            ->with([
                'profile' => fn ( $profileQuery) => $profileQuery->withCount(['followerRelations', 'followingRelations']),
                'profile.userRole.user',
                'profile.jobTitle',
                'profile.verificationRequests',
                'detail.project.skills',
                'detail.experience',
                'detail.offer.skills',
                'detail.offer.profile.company',
                'latestComment.commentator.userRole.user',
                'latestComment.commentator.verificationRequests',
            ])
            ->withCount([
                'comments as comments_count',
                'reactions as likes_count',
                'saves as saves_count',
            ]);

        if ($includeComments) {
            $query->with([
                'comments.commentator.userRole.user',
                'comments.commentator.verificationRequests',
            ]);
        }

        if ($viewerProfile) {
            $query->withExists([
                'reactions as liked_by_me' => fn(Builder $b) => $b->where('id_reactor', $viewerProfile->getKey()),
                'saves as saved_by_me'     => fn(Builder $b) => $b->where('id_profile', $viewerProfile->getKey()),
            ]);
        }

        return $query;
    }

    private function findPublicationByDetail(string $column, int $id): ?Publication
    {
        return Publication::query()
            ->whereHas('detail', fn(Builder $b) => $b->where($column, $id))
            ->first();
    }

    private function loadPublication(
        Publication $publication,
        ?Profile $viewerProfile = null,
        bool $includeComments = true
    ): Publication {
        return $this->baseFeedQuery($viewerProfile, $includeComments)->findOrFail($publication->getKey());
    }

    private function likeEmoji(): Emoji
    {
        return Emoji::firstOrCreate(
            ['name'  => 'like'],
            ['state' => 'activate']
        );
    }

    private function toPost(Publication $publication, ?Profile $viewerProfile = null): array
    {
        $detail     = $publication->detail;
        $project    = $detail?->project;
        $experience = $detail?->experience;
        $offer      = $detail?->offer;

        $profile    = $publication->profile ?: $project?->profile ?: $experience?->profile;
        $user       = $profile?->userRole?->user;
        $authorName = trim(
            ($profile?->name ?? $user?->nombre ?? '') .
            ' ' .
            ($profile?->last_name ?? $user?->apellido ?? '')
        );
        $authorName = $authorName !== '' ? $authorName : 'Usuario Portafy';

        $likedByMe = (bool) ($publication->liked_by_me ?? false);
        $savedByMe = (bool) ($publication->saved_by_me ?? false);

        if (
            $viewerProfile &&
            !array_key_exists('liked_by_me', $publication->getAttributes()) &&
            $publication->relationLoaded('reactions')
        ) {
            $likedByMe = $publication->reactions->contains('id_reactor', $viewerProfile->getKey());
            $savedByMe = $publication->saves->contains('id_profile', $viewerProfile->getKey());
        }

        $comments = $publication->relationLoaded('comments')
            ? $publication->comments
            : ($publication->relationLoaded('latestComment') && $publication->latestComment
                ? collect([$publication->latestComment])
                : collect());

        $commentsData = $comments->map(fn(PublicationComment $comment) => [
            'id'           => (int) $comment->getKey(),
            'text'         => $comment->comment,
            'author'       => trim(
                ($comment->commentator?->name ?? '') .
                ' ' .
                ($comment->commentator?->last_name ?? '')
            ) ?: 'Usuario Portafy',
            'authorAvatar' => $this->assetUrlService->fromStoragePath($comment->commentator?->profile_photo),
            'authorId'     => $comment->commentator?->userRole?->user?->id ?? null,
            'authorIsVerified' => $this->profileIsVerified($comment->commentator),
            'posted'       => $comment->created_at?->diffForHumans() ?? '',
        ])->values();

        $authorFollowersCount = 0;
        $authorFollowingCount = 0;
        $authorIsFollowing = false;
        if ($profile) {
            $authorFollowersCount = (int) (
                $profile->follower_relations_count
                ?? $profile->followerRelations()->count()
            );
            $authorFollowingCount = (int) (
                $profile->following_relations_count
                ?? $profile->followingRelations()->count()
            );
            $authorIsFollowing = $viewerProfile
                && (int) $viewerProfile->getKey() !== (int) $profile->getKey()
                && $profile->followerRelations()
                    ->where('id_profile1', $viewerProfile->getKey())
                    ->where('state_relation', 'friends')
                    ->exists();
        }

        // ── Oferta vinculada a la publicación ─────────────────────────────
        if ($offer) {
            $offerProfile = $offer->profile;

            return [
                'id'            => 'publication-' . $publication->getKey(),
                'publicationId' => (int) $publication->getKey(),
                'offerId'       => $offer->id_offer,
                'type'          => 'oferta',
                'sourceType'    => 'offer',
                'author'        => [
                    'id'     => $offerProfile?->id_profile,
                    'name'   => $offerProfile?->company?->name ?? 'Empresa',
                    'title'  => $offerProfile?->company?->industry ?? 'Empresa',
                    'avatar' => $offerProfile?->company?->logo_url ?? '',
                ],
                'content'       => $offer->description ?? '',
                'title'         => $offer->title,
                'type_contrato' => $offer->type,
                'modalidad'     => $offer->modalidad,
                'ubicacion'     => $offer->ubicacion,
                'nivel'         => $offer->nivel,
                'area'          => $offer->area,
                'salary_min'    => $offer->salary_min,
                'salary_max'    => $offer->salary_max,
                'currency'      => $offer->currency,
                'show_salary'   => $offer->show_salary,
                'closed_at'     => $offer->closed_at?->toDateString(),
                'banner_url'    => $offer->banner_url,
                'tags'          => $offer->skills->pluck('name')->values()->all(),
                'likes'         => (int) ($publication->likes_count ?? 0),
                'commentsCount' => (int) ($publication->comments_count ?? 0),
                'saves'         => (int) ($publication->saves_count ?? 0),
                'likedByMe'     => $likedByMe,
                'savedByMe'     => $savedByMe,
                'ownedByMe'     => $viewerProfile && $offerProfile &&
                    (int) $viewerProfile->getKey() === (int) $offerProfile->getKey(),
                'posted'        => $publication->created_at?->diffForHumans() ?? '',
                'createdAt'     => $publication->created_at?->toISOString(),
                'comments'      => $commentsData,
            ];
        }

        // ── Proyecto / Experiencia / Perfil ───────────────────────────────
        $sourceType = $project ? 'project' : ($experience ? 'experience' : 'profile');

        return [
            'id'            => 'publication-' . $publication->getKey(),
            'publicationId' => (int) $publication->getKey(),
            'type'          => 'portfolio',
            'sourceType'    => $sourceType,
            'projectId'     => $project?->id,
            'experienceId'  => $experience?->id,
            'author'        => [
                'id'             => $user?->id,
                'name'           => $authorName,
                'title'          => $profile?->jobTitle?->name ?: 'Profesional Portafy',
                'avatar'         => $this->assetUrlService->fromStoragePath($profile?->profile_photo),
                'isVerified'     => $this->profileIsVerified($profile),
                'followersCount' => $authorFollowersCount,
                'followingCount' => $authorFollowingCount,
                'isFollowing'    => $authorIsFollowing,
            ],
            'content'       => $publication->description ?: $this->defaultContent($project, $experience),
            'visibility'    => (bool) $publication->visibility,
            'ownedByMe'     => $viewerProfile && $profile &&
                (int) $viewerProfile->getKey() === (int) $profile->getKey(),
            'project'       => $project ? [
                'title'       => $project->titulo,
                'description' => $project->descripcion,
                'status'      => $project->estado,
                'repoUrl'     => $project->url_repositorio,
                'demoUrl'     => $project->url_demo,
            ] : null,
            'experience'    => $experience ? [
                'title'       => $experience->title,
                'company'     => $experience->company,
                'type'        => $experience->type,
                'typeLabel'   => $experience->type_label,
                'description' => $experience->descripcion,
                'startDate'   => $experience->fecha_inicio,
                'endDate'     => $experience->fecha_fin,
                'isCurrent'   => $experience->actualmente,
            ] : null,
            'image'         => $this->assetUrlService->fromStoragePath($project?->imagen),
            'likes'         => (int) ($publication->likes_count ?? 0),
            'commentsCount' => (int) ($publication->comments_count ?? 0),
            'saves'         => (int) ($publication->saves_count ?? 0),
            'likedByMe'     => $likedByMe,
            'savedByMe'     => $savedByMe,
            'tags'          => $project?->skills?->pluck('name')->values()->all() ?? [],
            'posted'        => $publication->created_at?->diffForHumans() ?? '',
            'createdAt'     => $publication->created_at?->toISOString(),
            'comments'      => $commentsData,
        ];
    }

    private function defaultContent(?Proyecto $project, ?Experience $experience): string
    {
        if ($project) {
            return $this->defaultProjectContent($project);
        }

        if ($experience) {
            return $this->defaultExperienceContent($experience);
        }

        return 'Comparti una actualizacion de mi perfil profesional.';
    }

    private function defaultProjectContent(?Proyecto $project): string
    {
        if (!$project) {
            return 'Comparti un proyecto de mi portafolio.';
        }

        $description = trim((string) $project->descripcion);

        if ($description === '') {
            return 'Comparti mi proyecto "' . $project->titulo . '" desde mi portafolio.';
        }

        return 'Proyecto publicado: ' . Str::limit($description, 210);
    }

    private function defaultExperienceContent(?Experience $experience): string
    {
        if (!$experience) {
            return 'Comparti una experiencia profesional de mi perfil.';
        }

        $headline    = trim(implode(' en ', array_filter([$experience->title, $experience->company])));
        $description = trim((string) $experience->descripcion);

        if ($description === '') {
            return 'Experiencia publicada: ' . ($headline ?: 'Trayectoria profesional') . '.';
        }

        return 'Experiencia publicada: ' . ($headline ?: 'Trayectoria profesional') . '. ' . Str::limit($description, 170);
    }

    private function profileIsVerified(?Profile $profile): bool
    {
        if (! $profile) {
            return false;
        }

        if ($profile->relationLoaded('verificationRequests')) {
            $latest = $profile->verificationRequests
                ->sortByDesc('id_verification_request')
                ->first();

            return $latest?->status === 'approved';
        }

        return ProfileVerificationRequest::query()
            ->where('id_profile', $profile->getKey())
            ->orderByDesc('id_verification_request')
            ->value('status') === 'approved';
    }
}
