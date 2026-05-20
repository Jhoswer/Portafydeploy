<?php

namespace App\Models;

use App\Support\OfficialSchema;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'USER';

    protected $primaryKey = 'id_user';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'name',
        'last_name',
        'email',
        'email_verified_at',
        'remember_token',
        'number',
    ];

    protected $hidden = [
        'remember_token',
        'name',
        'last_name',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    protected $appends = [
        'id',
        'nombre',
        'apellido',
        'rol',
        'provider',
        'provider_id',
        'profesion',
        'biografia',
        'fecha_nacimiento',
        'ubicacion',
        'foto_perfil',
        'foto_portada',
        'url_cv',
        'perfil_completado',
        'contacto_publico',
        'visibilidad_contacto',
        'estado',
        'suspension_status',
        'suspension_active',
    ];

    public function userRoles()
    {
        return $this->hasMany(UserRole::class, 'id_user', 'id_user');
    }

    public function primaryUserRole()
    {
        return $this->hasOne(UserRole::class, 'id_user', 'id_user')->latestOfMany('id_user_role');
    }

    public function profile()
    {
        return $this->hasOneThrough(
            Profile::class,
            UserRole::class,
            'id_user',
            'id_user_rol',
            'id_user',
            'id_user_role'
        );
    }

    public function getIdAttribute(): int
    {
        return (int) $this->getKey();
    }

    public function getNombreAttribute(): string
    {
        $profile = $this->profileRecord();

        return (string) ($profile?->name ?? $this->getRawOriginal('name') ?? '');
    }

    public function getApellidoAttribute(): string
    {
        $profile = $this->profileRecord();

        return (string) ($profile?->last_name ?? $this->getRawOriginal('last_name') ?? '');
    }

    public function getRolAttribute(): string
    {
        $role = $this->userRoles()
            ->with('role')
            ->orderByDesc('id_user_role')
            ->first()?->role?->name;

        return $role ?: 'usuario';
    }

    public function getProviderAttribute(): ?string
    {
        return $this->activeProviderRecord()?->provider;
    }

    public function getProveedorAttribute(): ?string
    {
        return $this->getProviderAttribute();
    }

    public function getProviderIdAttribute(): ?string
    {
        return $this->activeProviderRecord()?->provider_user_id;
    }

    public function getProveedorIdAttribute(): ?string
    {
        return $this->getProviderIdAttribute();
    }

    public function getProfesionAttribute(): string
    {
        return (string) ($this->profileRecord()?->jobTitle?->name ?? '');
    }

    public function getBiografiaAttribute(): string
    {
        return (string) ($this->profileRecord()?->biography ?? '');
    }

    public function getFechaNacimientoAttribute(): mixed
    {
        return $this->profileRecord()?->birthdate;
    }

    public function getUbicacionAttribute(): string
    {
        return (string) ($this->profileRecord()?->stateCountry?->name ?? '');
    }

    public function getFotoPerfilAttribute(): string
    {
        return (string) ($this->profileRecord()?->profile_photo ?? '');
    }

    public function getFotoPortadaAttribute(): string
    {
        return (string) ($this->profileRecord()?->cover_photo ?? '');
    }

    public function getUrlCvAttribute(): string
    {
        return (string) ($this->currentCvRecord()?->cv_url ?? '');
    }

    public function getPerfilCompletadoAttribute(): bool
    {
        return (bool) ($this->profileRecord()?->completed_profile ?? false);
    }

    public function getContactoPublicoAttribute(): bool
    {
        $profile = $this->profileRecord();

        if (! $profile) {
            return true;
        }

        $preference = Preference::query()
            ->where('id_profile', $profile->getKey())
            ->where('type', 'privacy')
            ->where('description', 'contact_visibility')
            ->orderByDesc('id_preference')
            ->first();

        return (bool) ($preference?->visibility ?? true);
    }

    public function getVisibilidadContactoAttribute(): string
    {
        return $this->contacto_publico ? 'public' : 'private';
    }

    public function getEstadoAttribute(): string
    {
        return $this->isSuspended() ? 'suspendido' : 'activo';
    }

    public function getSuspensionActiveAttribute(): bool
    {
        return $this->isSuspended();
    }

    public function getSuspensionStatusAttribute(): string
    {
        $profileState = $this->profileRecord()?->profileState;

        if (! $profileState || $profileState->state_profile !== 'suspended') {
            return 'activo';
        }

        if ($profileState->end_date && now()->greaterThan(\Illuminate\Support\Carbon::parse($profileState->end_date))) {
            return 'expirada';
        }

        return $profileState->end_date ? 'temporal' : 'permanente';
    }

    public function isSuspended(): bool
    {
        $profileState = $this->profileRecord()?->profileState;

        if (! $profileState || $profileState->state_profile !== 'suspended') {
            return false;
        }

        if ($profileState->end_date) {
            return now()->lessThanOrEqualTo(\Illuminate\Support\Carbon::parse($profileState->end_date));
        }

        return true;
    }

    public function getAuthPassword(): string
    {
        return (string) ($this->credentialRecord()?->password ?? '');
    }

    public function profileRecord(): ?Profile
    {
        if ($this->relationLoaded('profile')) {
            return $this->getRelation('profile');
        }

        $profile = $this->profile()
            ->with(['jobTitle', 'stateCountry', 'profileState'])
            ->first();

        if ($profile) {
            $this->setRelation('profile', $profile);
        }

        return $profile;
    }

    public function credentialRecord(): ?Credential
    {
        return $this->profileRecord()?->credential()->first();
    }

    public function activeProviderRecord(?string $provider = null): ?Provider
    {
        $profile = $this->profileRecord();

        if (! $profile) {
            return null;
        }

        return $profile->providers()
            ->when($provider, fn ($query) => $query->where('provider', $provider))
            ->where('active', true)
            ->orderByDesc('id_provider')
            ->first();
    }

    public function currentCvRecord(): ?Cv
    {
        $profile = $this->profileRecord();

        if (! $profile) {
            return null;
        }

        return $profile->cvs()
            ->whereNotNull('cv_url')
            ->orderByDesc('id_cv')
            ->first();
    }

    public function activePermissions(): array
    {
        $profile = $this->profileRecord();
        $userRole = $profile?->userRole;

        if (! $userRole) {
            return [];
        }

        $pivotColumn = \Illuminate\Support\Facades\Schema::hasColumn('PERMISSION_USER_ROL', 'id_user_role')
            ? 'id_user_role'
            : 'id_user_rol';

        $roleName = $this->rol;

        $rows = \Illuminate\Support\Facades\DB::table('PERMISSION_USER_ROL')
            ->join('PERMISSION', 'PERMISSION.id_permission', '=', 'PERMISSION_USER_ROL.id_permission')
            ->where('PERMISSION_USER_ROL.' . $pivotColumn, $userRole->getKey())
            ->where('PERMISSION.active', true)
            ->orderBy('PERMISSION.name')
            ->get([
                'PERMISSION.name',
                'PERMISSION_USER_ROL.active as pivot_active',
                'PERMISSION_USER_ROL.deadline as pivot_deadline',
            ]);

        $active = [];
        $seen = [];

        foreach ($rows as $row) {
            $name = (string) $row->name;
            if (! PermissionCatalog::allowsRole($roleName, $name)) {
                continue;
            }

            $deadline = $row->pivot_deadline ? \Illuminate\Support\Carbon::parse($row->pivot_deadline)->endOfDay() : null;
            $isActive = (bool) $row->pivot_active;
            $seen[$name] = true;

            if ($isActive) {
                $active[] = $name;
                continue;
            }

            if ($deadline) {
                if (now()->lessThanOrEqualTo($deadline)) {
                    continue;
                }

                if (PermissionCatalog::defaultActiveForRole($roleName, $name)) {
                    $active[] = $name;
                }
            }
        }

        foreach (PermissionCatalog::names() as $permissionName) {
            if (isset($seen[$permissionName])) {
                continue;
            }

            if (in_array($permissionName, $active, true)) {
                continue;
            }

            if (PermissionCatalog::defaultActiveForRole($roleName, $permissionName)) {
                $active[] = $permissionName;
            }
        }

        return array_values(array_unique($active));
    }

    public function hasPermission(string $permissionName): bool
    {
        $permissionName = trim($permissionName);

        if ($permissionName === '') {
            return false;
        }

        return in_array($permissionName, $this->activePermissions(), true);
    }

    public function syncRole(?string $roleName = null): void
    {
        OfficialSchema::ensureUserRole($this, $roleName ?? $this->rol);
        $this->unsetRelation('profile');
    }

    public function syncPassword(string $passwordHash): void
    {
        $profile = OfficialSchema::ensureProfile($this);

        $credential = $profile->credential()->firstOrNew([
            'id_profile' => $profile->getKey(),
        ]);

        $credential->old_password = $credential->exists ? $credential->password : null;
        $credential->password = $passwordHash;
        $credential->save();
    }

    public function syncProvider(string $providerName, string $providerUserId): void
    {
        $profile = OfficialSchema::ensureProfile($this);

        OfficialSchema::synchronizeProvider($profile, $providerName, $providerUserId);
    }

    public function syncCvUrl(string $path): void
    {
        $profile = OfficialSchema::ensureProfile($this);

        $cv = $profile->cvs()->firstOrNew([
            'id_profile' => $profile->getKey(),
            'cv_url' => $path,
        ]);

        $cv->name_cv = $cv->name_cv ?: 'CV principal';
        $cv->visible = true;
        $cv->state = true;
        $cv->save();
    }

    public function syncCoreData(array $attributes): void
    {
        $payload = array_filter([
            'name' => $attributes['nombre'] ?? $attributes['name'] ?? null,
            'last_name' => $attributes['apellido'] ?? $attributes['last_name'] ?? null,
            'email' => $attributes['email'] ?? null,
        ], static fn ($value) => $value !== null);

        if ($payload !== []) {
            $this->fill($payload);
            $this->save();
        }
    }

    public function syncProfileData(array $attributes): void
    {
        $this->syncCoreData($attributes);

        $profile = OfficialSchema::ensureProfile($this);
        $profilePayload = array_filter([
            'name' => $attributes['nombre'] ?? $attributes['name'] ?? null,
            'last_name' => $attributes['apellido'] ?? $attributes['last_name'] ?? null,
            'biography' => $attributes['biografia'] ?? null,
            'birthdate' => $attributes['fecha_nacimiento'] ?? null,
            'profile_photo' => $attributes['foto_perfil'] ?? null,
            'cover_photo' => $attributes['foto_portada'] ?? null,
            'completed_profile' => array_key_exists('perfil_completado', $attributes)
                ? (int) ((bool) $attributes['perfil_completado'])
                : null,
        ], static fn ($value) => $value !== null);

        if (array_key_exists('profesion', $attributes)) {
            $profilePayload['id_job_title'] = OfficialSchema::ensureJobTitle($attributes['profesion'])?->getKey();
        }

        if (array_key_exists('ubicacion', $attributes)) {
            $profilePayload['id_state_country'] = OfficialSchema::ensureStateCountry($attributes['ubicacion'])?->getKey();
        }

        if ($profilePayload !== []) {
            $profile->fill($profilePayload);
            $profile->save();
            $this->setRelation('profile', $profile->fresh(['jobTitle', 'stateCountry']));
        }

        if (array_key_exists('contacto_publico', $attributes)) {
            Preference::updateOrCreate(
                [
                    'id_profile' => $profile->getKey(),
                    'type' => 'privacy',
                    'description' => 'contact_visibility',
                ],
                [
                    'visibility' => (bool) $attributes['contacto_publico'],
                    'color' => 'default',
                ]
            );
        }

        if (array_key_exists('rol', $attributes)) {
            $this->syncRole($attributes['rol']);
        }

        if (array_key_exists('password', $attributes) && filled($attributes['password'])) {
            $this->syncPassword($attributes['password']);
        }

        if (
            array_key_exists('proveedor', $attributes)
            && filled($attributes['proveedor'])
            && array_key_exists('proveedor_id', $attributes)
            && filled($attributes['proveedor_id'])
        ) {
            $this->syncProvider($attributes['proveedor'], $attributes['proveedor_id']);
        }

        if (array_key_exists('url_cv', $attributes) && filled($attributes['url_cv'])) {
            $this->syncCvUrl($attributes['url_cv']);
        }
    }

    public static function findByProvider(string $provider, string $providerUserId): ?self
    {
        $providerRecord = Provider::query()
            ->where('provider', trim(mb_strtolower($provider)))
            ->where('provider_user_id', $providerUserId)
            ->where('active', true)
            ->with('profile.userRole.user')
            ->first();

        return $providerRecord?->profile?->userRole?->user;
    }
    public function userRole()
    {
        return $this->hasOne(UserRole::class, 'id_user', 'id_user');
    }

    public function notificationSettings()
    {
        return $this->hasOne(NotificationPreference::class, 'id_user', 'id_user');
    }

    public function receivedNotifications()
    {
        return $this->hasMany(UserNotification::class, 'id_receiver', 'id_user');
    }

    public function sentNotifications()
    {
        return $this->hasMany(UserNotification::class, 'id_sender', 'id_user');
    }

    public function enabledChannels(string $category): array
    {
        $column = match ($category) {
            'social', 'activity' => 'activity_notifications',
            'portfolio' => 'portfolio_notifications',
            'offer' => 'offer_notifications',
            'support' => 'support_notifications',
            'platform', 'admin' => 'platform_notifications',
            'security' => 'security_notifications',
            default => null,
        };

        if ($column === null) {
            return [];
        }

        $settings = $this->notificationSettings()->firstOrCreate([
            'id_user' => $this->getKey(),
        ]);

        if ($settings->wasRecentlyCreated) {
            $settings->refresh();
        }

        return $settings->{$column} ? ['mail'] : [];
    }
}
