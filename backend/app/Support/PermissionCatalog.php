<?php

namespace App\Support;

class PermissionCatalog
{
    public const FEED_COMMENT = 'feed_comment';
    public const FEED_REACT = 'feed_react';
    public const FEED_PUBLISH = 'feed_publish';
    public const OFFER_PUBLISH = 'offer_publish';

    public static function all(): array
    {
        return [
            self::FEED_COMMENT => [
                'label' => 'Comentar publicaciones',
                'roles' => ['profesional', 'reclutador'],
            ],
            self::FEED_REACT => [
                'label' => 'Reaccionar a publicaciones',
                'roles' => ['profesional', 'reclutador'],
            ],
            self::FEED_PUBLISH => [
                'label' => 'Publicar en el feed',
                'roles' => ['profesional', 'reclutador'],
            ],
            self::OFFER_PUBLISH => [
                'label' => 'Publicar ofertas de trabajo',
                'roles' => ['reclutador'],
            ],
        ];
    }

    public static function names(): array
    {
        return array_keys(self::all());
    }

    public static function label(string $name): string
    {
        return self::all()[$name]['label'] ?? $name;
    }

    public static function allowedRoles(string $name): array
    {
        return self::all()[$name]['roles'] ?? [];
    }

    public static function allowsRole(?string $role, string $name): bool
    {
        $role = self::normalizeRole($role);

        return in_array($role, self::allowedRoles($name), true);
    }

    public static function defaultActiveForRole(?string $role, string $name): bool
    {
        return self::allowsRole($role, $name);
    }

    public static function normalizeRole(?string $role): string
    {
        return trim(mb_strtolower((string) $role));
    }
}
