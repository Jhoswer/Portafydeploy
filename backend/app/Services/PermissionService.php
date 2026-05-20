<?php

namespace App\Services;

use App\Models\Usuario;
use App\Support\PermissionCatalog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use RuntimeException;

class PermissionService
{
    private const DEFAULT_REGION = 'Por defecto';

    public function searchUsers(Usuario $actor, string $query = ''): array
    {
        $this->assertActorCanManage($actor);

        $query = preg_replace('/\s+/', ' ', trim($query));
        $userRolePk = $this->userRolePrimaryKeyColumn();
        $latestUserRoles = DB::table('USER_ROLE')
            ->select('id_user', DB::raw('MAX("' . $userRolePk . '") as current_user_role_id'))
            ->groupBy('id_user');

        $builder = Usuario::query()
            ->select('USER.*', 'sc.name as permission_scope_location')
            ->joinSub($latestUserRoles, 'latest_ur', function ($join) {
                $join->on('latest_ur.id_user', '=', 'USER.id_user');
            })
            ->join('USER_ROLE as ur', 'ur.' . $userRolePk, '=', 'latest_ur.current_user_role_id')
            ->join('ROLE as r', 'r.id_role', '=', 'ur.id_role')
            ->join('PROFILE as p', 'p.id_user_rol', '=', 'ur.' . $userRolePk)
            ->leftJoin('STATE_COUNTRY as sc', 'sc.id_state_country', '=', 'p.id_state_country');

        if ($query !== '') {
            $words = preg_split('/\s+/', $query, -1, PREG_SPLIT_NO_EMPTY);

            if (count($words) >= 2) {
                $nombre = $words[0];
                $apellido = implode(' ', array_slice($words, 1));

                $builder->where(function (Builder $builder) use ($nombre, $apellido) {
                    $builder->whereRaw('"USER".name ILIKE ?', ["%{$nombre}%"])
                        ->whereRaw('"USER".last_name ILIKE ?', ["%{$apellido}%"]);
                });
            } else {
                $builder->where(function (Builder $builder) use ($query) {
                    $builder->whereRaw('"USER".name ILIKE ?', ["%{$query}%"])
                        ->orWhereRaw('"USER".last_name ILIKE ?', ["%{$query}%"])
                        ->orWhereRaw('"USER".email ILIKE ?', ["%{$query}%"]);
                });
            }
        }

        $this->applyScope($builder, $actor);

        $users = $builder->distinct()->limit(30)->get();

        return $users->map(fn (Usuario $user) => $this->formatSearchUser($user, $actor))->values()->all();
    }

    public function getUserPermissions(Usuario $actor, int $userId): array
    {
        $this->assertActorCanManage($actor);

        $target = $this->findTargetUser($userId);
        $this->assertTargetVisible($actor, $target);

        $userRoleId = $this->userRoleId($target);
        if (! $this->hasProfileForUserRole($userRoleId)) {
            throw new RuntimeException('El usuario no tiene rol o perfil asociado.');
        }

        $catalog = $this->fetchPermissionCatalog();
        $assigned = $this->fetchAssignedPermissions($userRoleId);

        $catalog = $catalog->filter(function ($permission) use ($target) {
            return PermissionCatalog::allowsRole($target->rol, (string) $permission->name);
        });

        return [
            'usuario' => $this->formatTargetUser($target, $actor),
            'permissions' => $catalog->map(function ($permission) use ($assigned, $target) {
                $state = $this->resolvePermissionState(
                    (int) $permission->id_permission,
                    (string) $permission->name,
                    $assigned,
                    $target->rol
                );

                return [
                    'id_permission' => (int) $permission->id_permission,
                    'name' => (string) $permission->name,
                    'label' => PermissionCatalog::label((string) $permission->name),
                    'roles' => PermissionCatalog::allowedRoles((string) $permission->name),
                    'active' => $state['active'],
                    'deadline' => $state['deadline'],
                    'permission_active' => (bool) ($permission->active ?? true),
                ];
            })->values(),
        ];
    }

    public function updateUserPermissions(Usuario $actor, int $userId, array $permissionsPayload): array
    {
        $this->assertActorCanManage($actor);

        $target = $this->findTargetUser($userId);
        $this->assertTargetVisible($actor, $target);

        $role = strtolower((string) $target->rol);
        if (in_array($role, ['administrador', 'super administrador'], true)) {
            throw new RuntimeException('No se pueden modificar permisos de administradores o super administradores.');
        }

        $userRoleId = $this->userRoleId($target);
        if (! $this->hasProfileForUserRole($userRoleId)) {
            throw new RuntimeException('El usuario no tiene rol o perfil asociado.');
        }

        $catalog = $this->fetchPermissionCatalog();
        $catalogById = $catalog->keyBy(fn ($permission) => (int) $permission->id_permission);
        $previous = $this->fetchAssignedPermissions($userRoleId);

        $normalized = collect($permissionsPayload)->mapWithKeys(function ($item) {
            $permissionId = (int) ($item['id_permission'] ?? 0);
            $active = (bool) ($item['active'] ?? false);
            $deadline = $this->normalizeDeadline($item['deadline'] ?? null);

            return $permissionId > 0
                ? [$permissionId => ['active' => $active, 'deadline' => $deadline]]
                : [];
        });

        $applied = [];
        $removed = [];
        $temporary = [];

        DB::transaction(function () use (
            $normalized,
            $catalogById,
            $previous,
            $userRoleId,
            $target,
            $actor,
            &$applied,
            &$removed,
            &$temporary
        ) {
            foreach ($normalized as $permissionId => $payload) {
                if (! $catalogById->has($permissionId)) {
                    continue;
                }

                $permission = $catalogById->get($permissionId);
                $name = (string) $permission->name;

                if (! PermissionCatalog::allowsRole($target->rol, $name)) {
                    continue;
                }

                $before = $previous[$permissionId] ?? null;
                $beforeActive = (bool) ($before['active'] ?? PermissionCatalog::defaultActiveForRole($target->rol, $name));
                $beforeDeadline = $before['deadline'] ?? null;
                $afterActive = (bool) $payload['active'];
                $afterDeadline = $afterActive ? null : ($payload['deadline'] ?: null);

                if (
                    $beforeActive === $afterActive
                    && ($beforeDeadline ?? null) === ($afterDeadline ?? null)
                ) {
                    continue;
                }

                $pivotKey = [
                    $this->permissionPivotUserRoleColumn() => $userRoleId,
                    'id_permission' => $permissionId,
                ];
                $pivotData = [
                    'active' => $afterActive,
                    'deadline' => $afterDeadline,
                    'updated_at' => now(),
                ];

                $existing = DB::table('PERMISSION_USER_ROL')
                    ->where($pivotKey)
                    ->first();

                if ($existing) {
                    DB::table('PERMISSION_USER_ROL')
                        ->where($pivotKey)
                        ->update($pivotData);
                } else {
                    DB::table('PERMISSION_USER_ROL')->insert([
                        ...$pivotKey,
                        ...$pivotData,
                        'created_at' => now(),
                    ]);
                }

                if ($afterActive) {
                    $applied[] = $name;
                    continue;
                }

                if ($afterDeadline) {
                    $temporary[] = [
                        'name' => $name,
                        'deadline' => $afterDeadline,
                    ];
                    continue;
                }

                $removed[] = $name;
            }

            try {
                $actorRoleId = $this->userRoleId($actor);

                DB::table('LOG')->insert([
                    'id_user_rol' => $actorRoleId,
                    'modified_table' => 'PERMISSION_USER_ROL',
                    'modified_field' => 'active',
                    'previous_value' => json_encode($previous),
                    'new_value' => json_encode($normalized->all()),
                    'created_at' => now(),
                    'type' => 'update',
                ]);
            } catch (\Throwable) {
                // La auditoria no debe bloquear la actualizacion de permisos.
            }
        });

        return [
            'usuario' => $this->formatTargetUser($target, $actor),
            'summary' => [
                'applied' => array_values(array_unique($applied)),
                'removed' => array_values(array_unique($removed)),
                'temporary' => $temporary,
            ],
        ];
    }

    private function fetchPermissionCatalog()
    {
        $permissions = DB::table('PERMISSION')
            ->where('active', true)
            ->whereIn('name', PermissionCatalog::names())
            ->get(['id_permission', 'name', 'active']);

        $order = array_flip(PermissionCatalog::names());

        return $permissions
            ->sortBy(fn ($permission) => $order[(string) $permission->name] ?? 999)
            ->values();
    }

    private function fetchAssignedPermissions(int $userRoleId): array
    {
        $fk = $this->permissionPivotUserRoleColumn();

        return DB::table('PERMISSION_USER_ROL')
            ->where($fk, $userRoleId)
            ->get(['id_permission', 'active', 'deadline'])
            ->mapWithKeys(function ($row) {
                return [
                    (int) $row->id_permission => [
                        'active' => (bool) $row->active,
                        'deadline' => $row->deadline ? Carbon::parse($row->deadline)->toDateString() : null,
                    ],
                ];
            })
            ->all();
    }

    private function resolvePermissionState(int $permissionId, string $permissionName, array $assigned, ?string $role): array
    {
        $row = $assigned[$permissionId] ?? null;

        if (! is_array($row)) {
            return [
                'active' => PermissionCatalog::defaultActiveForRole($role, $permissionName),
                'deadline' => null,
            ];
        }

        $deadline = $row['deadline'] ?? null;
        $active = (bool) ($row['active'] ?? false);

        if ($deadline) {
            $deadlineDate = Carbon::parse($deadline)->endOfDay();

            if (! $active && now()->lessThanOrEqualTo($deadlineDate)) {
                return [
                    'active' => false,
                    'deadline' => $deadlineDate->toDateString(),
                ];
            }

            if (! $active && now()->greaterThan($deadlineDate)) {
                return [
                    'active' => PermissionCatalog::defaultActiveForRole($role, $permissionName),
                    'deadline' => $deadlineDate->toDateString(),
                ];
            }

            return [
                'active' => $active,
                'deadline' => $deadlineDate->toDateString(),
            ];
        }

        return [
            'active' => $active,
            'deadline' => null,
        ];
    }

    private function findTargetUser(int $userId): Usuario
    {
        return Usuario::query()
            ->select('USER.*')
            ->with(['profile.jobTitle', 'profile.stateCountry', 'profile.userRole'])
            ->findOrFail($userId);
    }

    private function formatSearchUser(Usuario $user, Usuario $actor): array
    {
        $role = strtolower((string) $user->rol);
        $canEdit = ! in_array($role, ['administrador', 'super administrador'], true) && $this->isInScope($actor, $user);

        return [
            'id' => $user->id_user,
            'nombre' => $user->nombre,
            'apellido' => $user->apellido,
            'email' => $user->email,
            'rol' => $user->rol,
            'ubicacion' => $this->scopeLocation($user),
            'foto_perfil' => $user->foto_perfil ?: null,
            'can_edit' => $canEdit,
            'disable_reason' => $canEdit ? null : $this->buildDisableReason($user, $actor),
        ];
    }

    private function formatTargetUser(Usuario $user, Usuario $actor): array
    {
        $role = strtolower((string) $user->rol);
        $canEdit = ! in_array($role, ['administrador', 'super administrador'], true) && $this->isInScope($actor, $user);

        return [
            'id' => $user->id_user,
            'nombre' => $user->nombre,
            'apellido' => $user->apellido,
            'email' => $user->email,
            'rol' => $user->rol,
            'ubicacion' => $this->scopeLocation($user),
            'foto_perfil' => $user->foto_perfil ?: null,
            'can_edit' => $canEdit,
            'disable_reason' => $canEdit ? null : $this->buildDisableReason($user, $actor),
        ];
    }

    private function applyScope(Builder $builder, Usuario $actor): void
    {
        if ($this->isSuperAdmin($actor)) {
            return;
        }

        $actorStateCountryId = $this->stateCountryId($actor);

        if ($actorStateCountryId === null) {
            $builder->where(function (Builder $scopeQuery): void {
                $scopeQuery->whereNull('p.id_state_country')
                    ->orWhereRaw('LOWER(COALESCE(sc.name, \'\')) = LOWER(?)', [self::DEFAULT_REGION]);
            });
            return;
        }

        $builder->where('p.id_state_country', $actorStateCountryId);
    }

    private function isInScope(Usuario $actor, Usuario $target): bool
    {
        if ($this->isSuperAdmin($actor)) {
            return true;
        }

        $actorStateCountryId = $this->stateCountryId($actor);
        $targetStateCountryId = $this->stateCountryId($target);

        if ($actorStateCountryId === null) {
            return $targetStateCountryId === null;
        }

        return $actorStateCountryId === $targetStateCountryId;
    }

    private function buildDisableReason(Usuario $target, Usuario $actor): string
    {
        $role = strtolower((string) $target->rol);

        if (in_array($role, ['administrador', 'super administrador'], true)) {
            return 'No se pueden modificar permisos de administradores o super administradores.';
        }

        if (! $this->isInScope($actor, $target)) {
            return 'Este usuario no pertenece a tu alcance de administracion.';
        }

        return '';
    }

    private function assertTargetVisible(Usuario $actor, Usuario $target): void
    {
        if (! $this->isInScope($actor, $target)) {
            throw new RuntimeException('El usuario no pertenece a tu alcance de administracion.');
        }
    }

    private function assertActorCanManage(Usuario $actor): void
    {
        $role = strtolower((string) $actor->rol);

        if (! in_array($role, ['administrador', 'super administrador'], true)) {
            throw new RuntimeException('No tienes permisos para administrar accesos.');
        }
    }

    private function isSuperAdmin(Usuario $actor): bool
    {
        return strtolower((string) $actor->rol) === 'super administrador';
    }

    private function stateCountryId(Usuario $user): ?int
    {
        $userRoleId = $this->userRoleId($user);

        if (! $userRoleId) {
            return null;
        }

        $location = DB::table('PROFILE as p')
            ->leftJoin('STATE_COUNTRY as sc', 'sc.id_state_country', '=', 'p.id_state_country')
            ->where('p.id_user_rol', $userRoleId)
            ->first(['p.id_state_country', 'sc.name']);

        if (strcasecmp(trim((string) ($location?->name ?? '')), self::DEFAULT_REGION) === 0) {
            return null;
        }

        return $location?->id_state_country ? (int) $location->id_state_country : null;
    }

    private function scopeLocation(Usuario $user): ?string
    {
        $location = $user->getAttribute('permission_scope_location');

        if (is_string($location) && trim($location) !== '') {
            return trim($location);
        }

        $userRoleId = $this->userRoleId($user);

        if (! $userRoleId) {
            return null;
        }

        $location = DB::table('PROFILE as p')
            ->leftJoin('STATE_COUNTRY as sc', 'sc.id_state_country', '=', 'p.id_state_country')
            ->where('p.id_user_rol', $userRoleId)
            ->value('sc.name');

        return is_string($location) && trim($location) !== '' ? trim($location) : null;
    }

    private function hasProfileForUserRole(?int $userRoleId): bool
    {
        return $userRoleId
            ? DB::table('PROFILE')->where('id_user_rol', $userRoleId)->exists()
            : false;
    }

    private function userRoleId(Usuario $user): ?int
    {
        $userRoleId = DB::table('USER_ROLE')
            ->where('id_user', $user->id_user)
            ->orderByDesc($this->userRolePrimaryKeyColumn())
            ->value($this->userRolePrimaryKeyColumn());

        return $userRoleId ? (int) $userRoleId : null;
    }

    private function normalizeDeadline(mixed $value): ?string
    {
        if (! $value) {
            return null;
        }

        try {
            return Carbon::parse($value)->toDateString();
        } catch (\Throwable) {
            return null;
        }
    }

    private function userRolePrimaryKeyColumn(): string
    {
        return Schema::hasColumn('USER_ROLE', 'id_user_role') ? 'id_user_role' : 'id_user_rol';
    }

    private function permissionPivotUserRoleColumn(): string
    {
        return Schema::hasColumn('PERMISSION_USER_ROL', 'id_user_role') ? 'id_user_role' : 'id_user_rol';
    }
}
