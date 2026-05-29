<?php

namespace App\Services;

use App\Models\Profile;
use App\Models\Relation;
use App\Models\Usuario;
use App\Support\OfficialSchema;
use App\Support\ProfileRoleGuard;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ProfileEngagementService
{
    public function __construct(private readonly PublicAssetUrlService $assetUrlService) {}

    public function summary(Profile $profile, ?Profile $viewer = null): array
    {
        $profileId = (int) $profile->getKey();
        $relationCounts = Relation::query()
            ->where('state_relation', 'friends')
            ->where(function (Builder $query) use ($profileId) {
                $query
                    ->where('id_profile2', $profileId)
                    ->orWhere('id_profile1', $profileId);
            })
            ->selectRaw(
                'SUM(CASE WHEN id_profile2 = ? THEN 1 ELSE 0 END) as followers_count,
                 SUM(CASE WHEN id_profile1 = ? THEN 1 ELSE 0 END) as following_count',
                [$profileId, $profileId]
            )
            ->first();

        return [
            'followers' => (int) ($relationCounts?->followers_count ?? 0),
            'following' => (int) ($relationCounts?->following_count ?? 0),
            'is_following' => $viewer
                ? $this->isFollowing((int) $viewer->getKey(), $profileId)
                : false,
        ];
    }

    public function follow(Usuario $authenticatedUser, Usuario $targetUser): array
    {
        $viewer = OfficialSchema::ensureProfile($authenticatedUser);
        $target = OfficialSchema::ensureProfile($targetUser);

        $this->assertSocialProfile($viewer);
        $this->assertSocialProfile($target);

        if ((int) $viewer->getKey() === (int) $target->getKey()) {
            throw new RuntimeException('No puedes seguirte a ti mismo.');
        }

        Relation::updateOrCreate(
            [
                'id_profile1' => $viewer->getKey(),
                'id_profile2' => $target->getKey(),
            ],
            [
                'last_status_date' => now(),
                'state_relation' => 'friends',
                'state_profile1' => 'I accept',
                'state_profile2' => 'I think',
            ]
        );

        return [
            'message' => 'Ahora sigues este perfil.',
            'summary' => $this->summary($target, $viewer),
        ];
    }

    public function unfollow(Usuario $authenticatedUser, Usuario $targetUser): array
    {
        $viewer = OfficialSchema::ensureProfile($authenticatedUser);
        $target = OfficialSchema::ensureProfile($targetUser);

        $this->assertSocialProfile($viewer);
        $this->assertSocialProfile($target);

        Relation::query()
            ->where('id_profile1', $viewer->getKey())
            ->where('id_profile2', $target->getKey())
            ->delete();

        return [
            'message' => 'Dejaste de seguir este perfil.',
            'summary' => $this->summary($target, $viewer),
        ];
    }

    public function status(Usuario $authenticatedUser, Usuario $targetUser): array
    {
        $viewer = OfficialSchema::ensureProfile($authenticatedUser);
        $target = OfficialSchema::ensureProfile($targetUser);

        $this->assertSocialProfile($viewer);
        $this->assertSocialProfile($target);

        return $this->summary($target, $viewer);
    }

    public function list(Profile $target, string $type, ?Profile $viewer): array
    {
        $this->assertSocialProfile($target);

        if ($viewer) {
            $this->assertSocialProfile($viewer);
        }

        if (! in_array($type, ['followers', 'following'], true)) {
            throw new RuntimeException('Tipo de lista no valido.');
        }

        $relationColumn = $type === 'followers' ? 'id_profile2' : 'id_profile1';
        $relatedColumn = $type === 'followers' ? 'id_profile1' : 'id_profile2';
        $relationName = $type === 'followers' ? 'follower' : 'followed';

        $relations = Relation::query()
            ->with([$relationName . '.userRole.user', $relationName . '.jobTitle'])
            ->where($relationColumn, $target->getKey())
            ->where('state_relation', 'friends')
            ->orderByDesc('last_status_date')
            ->limit(200)
            ->get();

        $profileIds = $relations->pluck($relatedColumn)->filter()->map(fn ($id) => (int) $id)->values();
        $viewerFollowing = $viewer
            ? Relation::query()
                ->where('id_profile1', $viewer->getKey())
                ->whereIn('id_profile2', $profileIds)
                ->where('state_relation', 'friends')
                ->pluck('id_profile2')
                ->map(fn ($id) => (int) $id)
                ->flip()
            : collect();

        return [
            'type' => $type,
            'items' => $relations->map(function (Relation $relation) use ($relationName, $viewer, $viewerFollowing) {
                /** @var Profile|null $profile */
                $profile = $relation->{$relationName};

                return $this->mapProfile($profile, $viewer, $viewerFollowing);
            })->filter()->values(),
        ];
    }

    public function isFollowing(int $followerProfileId, int $followedProfileId): bool
    {
        return Relation::query()
            ->where('id_profile1', $followerProfileId)
            ->where('id_profile2', $followedProfileId)
            ->where('state_relation', 'friends')
            ->exists();
    }

    public function activeRelationsQuery(): Builder
    {
        return Relation::query()->where('state_relation', 'friends');
    }

    private function mapProfile(?Profile $profile, ?Profile $viewer, $viewerFollowing): ?array
    {
        if (! $profile) {
            return null;
        }

        if (ProfileRoleGuard::profileIsAdministrative($profile)) {
            return null;
        }

        $user = $profile->userRole?->user;
        $fullName = trim(collect([$profile->name, $profile->last_name])->filter()->implode(' '));
        $profileId = (int) $profile->getKey();

        return [
            'profile_id' => $profileId,
            'user_id' => $user?->getKey(),
            'name' => $fullName !== '' ? $fullName : 'Usuario Portafy',
            'title' => $profile->jobTitle?->name ?: 'Profesional Portafy',
            'photo' => $this->assetUrlService->fromStoragePath($profile->profile_photo),
            'profile_url' => $user ? '/perfil-profesional?usuario=' . $user->getKey() : '',
            'is_me' => $viewer && (int) $viewer->getKey() === $profileId,
            'is_following' => $viewerFollowing->has($profileId),
        ];
    }

    private function assertSocialProfile(Profile $profile): void
    {
        if (ProfileRoleGuard::profileIsAdministrative($profile)) {
            throw new RuntimeException('Este perfil no esta disponible para acciones sociales.');
        }
    }
}
