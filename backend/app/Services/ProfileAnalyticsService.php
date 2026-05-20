<?php

namespace App\Services;

use App\Models\AnalyticEvent;
use App\Models\Profile;
use App\Models\ProfileView;
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
}
