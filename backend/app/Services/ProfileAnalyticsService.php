<?php

namespace App\Services;

use App\Models\AnalyticEvent;
use App\Models\Profile;
use App\Models\ProfileView;
use App\Models\Publication;
use App\Models\Usuario;
use App\Support\OfficialSchema;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ProfileAnalyticsService
{
    public function __construct(private readonly PublicAssetUrlService $assetUrlService) {}

    public function recordProfileView(Usuario $viewerUser, Usuario $ownerUser, string $source = 'profile'): array
    {
        $viewer = OfficialSchema::ensureProfile($viewerUser);
        $owner = OfficialSchema::ensureProfile($ownerUser);

        if ((int) $viewer->getKey() === (int) $owner->getKey()) {
            return ['recorded' => false, 'message' => 'Vista propia ignorada.'];
        }

        $recent = ProfileView::query()
            ->where('id_profile_owner', $owner->getKey())
            ->where('id_viewer_profile', $viewer->getKey())
            ->where('viewed_at', '>=', now()->subMinutes(30))
            ->exists();

        if ($recent) {
            return ['recorded' => false, 'message' => 'Vista ya registrada recientemente.'];
        }

        ProfileView::create([
            'id_profile_owner' => $owner->getKey(),
            'id_viewer_profile' => $viewer->getKey(),
            'viewed_at' => now(),
            'source' => mb_substr($source, 0, 50),
        ]);

        Cache::forget('profile.analytics.dashboard.' . $owner->getKey());
        $this->recordEvent($owner, $viewer, 'profile_view', 'profile', $owner->getKey());

        return ['recorded' => true];
    }

    public function recordEvent(Profile $owner, ?Profile $actor, string $eventType, ?string $targetType = null, ?int $targetId = null, array $metadata = []): void
    {
        AnalyticEvent::create([
            'id_profile_owner' => $owner->getKey(),
            'id_actor_profile' => $actor?->getKey(),
            'event_type' => mb_substr($eventType, 0, 50),
            'target_type' => $targetType ? mb_substr($targetType, 0, 50) : null,
            'target_id' => $targetId,
            'metadata' => $metadata ?: null,
            'occurred_at' => now(),
        ]);

        Cache::forget('profile.analytics.dashboard.' . $owner->getKey());
    }

    public function profileViews(Profile $owner): array
    {
        $views = ProfileView::query()
            ->with(['viewer.userRole.user', 'viewer.jobTitle'])
            ->where('id_profile_owner', $owner->getKey())
            ->orderByDesc('viewed_at')
            ->limit(100)
            ->get();

        return [
            'total' => ProfileView::where('id_profile_owner', $owner->getKey())->count(),
            'items' => $views->map(fn (ProfileView $view) => [
                'id' => (int) $view->getKey(),
                'viewed_at' => $view->viewed_at?->toISOString(),
                'viewed_ago' => $view->viewed_at?->diffForHumans(),
                'source' => $view->source,
                'viewer' => $this->mapProfile($view->viewer),
            ])->values(),
        ];
    }

    public function dashboard(Profile $owner): array
    {
        return Cache::remember(
            'profile.analytics.dashboard.' . $owner->getKey(),
            now()->addSeconds(20),
            function () use ($owner) {
                $now = now();
                $start = $now->copy()->subDays(13)->startOfDay();
                $ownerId = $owner->getKey();

                $profileViews = ProfileView::where('id_profile_owner', $ownerId);
                $events = AnalyticEvent::where('id_profile_owner', $ownerId);
                $publications = Publication::published()
                    ->where('id_profile', $ownerId)
                    ->with(['detail.project', 'detail.experience'])
                    ->withCount([
                        'comments as comments_count',
                        'reactions as likes_count',
                        'saves as saves_count',
                    ])
                    ->get();

                $portfolioPosts = $publications->count();
                $portfolioLikes = (int) $publications->sum('likes_count');
                $portfolioComments = (int) $publications->sum('comments_count');
                $portfolioSaves = (int) $publications->sum('saves_count');

                $series = ProfileView::query()
                    ->selectRaw('DATE(viewed_at) as day, COUNT(*) as total')
                    ->where('id_profile_owner', $ownerId)
                    ->where('viewed_at', '>=', $start)
                    ->groupBy(DB::raw('DATE(viewed_at)'))
                    ->orderBy('day')
                    ->pluck('total', 'day');

                $days = collect(range(0, 13))->map(function (int $offset) use ($start, $series) {
                    $day = $start->copy()->addDays($offset)->toDateString();
                    return [
                        'day' => $day,
                        'label' => Carbon::parse($day)->format('d/m'),
                        'views' => (int) ($series[$day] ?? 0),
                    ];
                });

                return [
                    'summary' => [
                        'profile_views' => (clone $profileViews)->count(),
                        'profile_views_week' => (clone $profileViews)->where('viewed_at', '>=', $now->copy()->subDays(7))->count(),
                        'project_views' => (clone $events)->where('event_type', 'project_view')->count(),
                        'experience_views' => (clone $events)->where('event_type', 'experience_view')->count(),
                        'contact_clicks' => (clone $events)->where('event_type', 'contact_click')->count(),
                        'cv_clicks' => (clone $events)->where('event_type', 'cv_click')->count(),
                        'portfolio_posts' => $portfolioPosts,
                        'portfolio_likes' => $portfolioLikes,
                        'portfolio_comments' => $portfolioComments,
                        'portfolio_saves' => $portfolioSaves,
                        'portfolio_engagement' => $portfolioLikes + $portfolioComments + $portfolioSaves,
                        'engagement_rate' => $portfolioPosts > 0
                            ? round(($portfolioLikes + $portfolioComments + $portfolioSaves) / $portfolioPosts, 1)
                            : 0,
                    ],
                    'series' => $days->values(),
                    'top_events' => AnalyticEvent::query()
                        ->selectRaw('event_type, COUNT(*) as total')
                        ->where('id_profile_owner', $ownerId)
                        ->groupBy('event_type')
                        ->orderByDesc('total')
                        ->limit(8)
                        ->get()
                        ->map(fn ($item) => ['type' => $item->event_type, 'total' => (int) $item->total])
                        ->values(),
                    'top_publications' => $publications
                        ->sortByDesc(fn (Publication $publication) => $this->publicationScore($publication))
                        ->take(5)
                        ->map(fn (Publication $publication) => [
                            'id' => (int) $publication->getKey(),
                            'title' => $this->publicationTitle($publication),
                            'type' => $publication->detail?->experience ? 'experience' : 'project',
                            'likes' => (int) ($publication->likes_count ?? 0),
                            'comments' => (int) ($publication->comments_count ?? 0),
                            'saves' => (int) ($publication->saves_count ?? 0),
                            'score' => $this->publicationScore($publication),
                        ])
                        ->values(),
                    'top_projects_profile' => $this->topProjectsFromProfileViews($ownerId),
                    'top_projects_feed' => $this->topProjectsFromFeed($publications),
                ];
            }
        );
    }

    public function storeEvent(Usuario $actorUser, array $payload): array
    {
        $actor = OfficialSchema::ensureProfile($actorUser);
        $ownerId = (int) ($payload['owner_profile_id'] ?? 0);

        if (! $ownerId) {
            throw new RuntimeException('No se pudo identificar el perfil destino.');
        }

        $owner = Profile::findOrFail($ownerId);

        $this->recordEvent(
            $owner,
            $actor,
            (string) $payload['event_type'],
            $payload['target_type'] ?? null,
            isset($payload['target_id']) ? (int) $payload['target_id'] : null,
            $payload['metadata'] ?? []
        );

        return ['message' => 'Evento registrado.'];
    }

    private function mapProfile(?Profile $profile): array
    {
        if (! $profile) {
            return ['id' => null, 'name' => 'Usuario', 'photo' => '', 'profile_url' => ''];
        }

        $user = $profile->userRole?->user;
        $name = trim(collect([$profile->name, $profile->last_name])->filter()->implode(' '));

        return [
            'profile_id' => (int) $profile->getKey(),
            'user_id' => $user?->getKey(),
            'name' => $name !== '' ? $name : 'Usuario Portafy',
            'title' => $profile->jobTitle?->name ?: 'Profesional Portafy',
            'photo' => $this->assetUrlService->fromStoragePath($profile->profile_photo),
            'profile_url' => $user ? '/perfil-profesional?usuario=' . $user->getKey() : '',
        ];
    }

    private function publicationScore(Publication $publication): int
    {
        return ((int) ($publication->likes_count ?? 0) * 3)
            + ((int) ($publication->comments_count ?? 0) * 2)
            + ((int) ($publication->saves_count ?? 0) * 2);
    }

    private function publicationTitle(Publication $publication): string
    {
        $projectTitle = trim((string) ($publication->detail?->project?->titulo ?? ''));
        if ($projectTitle !== '') {
            return $projectTitle;
        }

        $experienceTitle = trim((string) ($publication->detail?->experience?->title ?? ''));
        if ($experienceTitle !== '') {
            return $experienceTitle;
        }

        return 'Publicacion del portafolio';
    }

    private function topProjectsFromProfileViews(int $ownerId): array
    {
        return DB::table('PROJECT as p')
            ->leftJoin('ANALYTIC_EVENT as ae', function ($join) use ($ownerId) {
                $join->on('ae.target_id', '=', 'p.id_project')
                    ->where('ae.id_profile_owner', '=', $ownerId)
                    ->where('ae.event_type', '=', 'project_view')
                    ->where('ae.target_type', '=', 'project');
            })
            ->where('p.id_profile', $ownerId)
            ->selectRaw('p.id_project as id, p.title as title, COUNT(ae.id_analytic_event) as views')
            ->groupBy('p.id_project', 'p.title')
            ->orderByDesc('views')
            ->orderBy('p.title')
            ->limit(3)
            ->get()
            ->map(fn ($item) => [
                'id' => (int) $item->id,
                'title' => $item->title ?: 'Proyecto sin titulo',
                'views' => (int) $item->views,
            ])
            ->values()
            ->all();
    }

    private function topProjectsFromFeed($publications): array
    {
        return $publications
            ->filter(fn (Publication $publication) => $publication->detail?->project)
            ->sortByDesc(fn (Publication $publication) => $this->publicationScore($publication))
            ->take(3)
            ->map(fn (Publication $publication) => [
                'id' => (int) $publication->detail->project->getKey(),
                'publication_id' => (int) $publication->getKey(),
                'title' => $this->publicationTitle($publication),
                'score' => $this->publicationScore($publication),
                'likes' => (int) ($publication->likes_count ?? 0),
                'comments' => (int) ($publication->comments_count ?? 0),
                'saves' => (int) ($publication->saves_count ?? 0),
            ])
            ->values()
            ->all();
    }
}
