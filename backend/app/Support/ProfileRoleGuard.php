<?php

namespace App\Support;

use App\Models\Profile;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Builder;

final class ProfileRoleGuard
{
    public const PUBLIC_PROFILE_ROLES = ['profesional', 'reclutador'];
    public const ADMIN_PROFILE_ROLES = ['administrador', 'super administrador'];

    public static function normalize(?string $role): string
    {
        return trim(mb_strtolower((string) $role));
    }

    public static function isAdministrativeRole(?string $role): bool
    {
        return in_array(self::normalize($role), self::ADMIN_PROFILE_ROLES, true);
    }

    public static function userIsAdministrative(?Usuario $user): bool
    {
        return $user ? self::isAdministrativeRole($user->rol) : false;
    }

    public static function profileIsAdministrative(?Profile $profile): bool
    {
        if (! $profile) {
            return false;
        }

        $profile->loadMissing('userRole.role');

        return self::isAdministrativeRole($profile->userRole?->role?->name);
    }

    public static function scopeToPublicProfiles(Builder $query, string $roleColumn = 'ROLE.name'): Builder
    {
        return $query->whereIn($roleColumn, self::PUBLIC_PROFILE_ROLES);
    }
}
