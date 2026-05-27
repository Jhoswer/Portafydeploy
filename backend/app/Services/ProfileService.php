<?php

namespace App\Services;

use App\Http\Requests\ProfileRequest;
use App\Http\Requests\AdminProfileUpdateRequest;
use App\Models\Experience;
use App\Models\FormacionAcademica;
use App\Models\Habilidad;
use App\Models\Publication;
use App\Models\PublicationComment;
use App\Models\Profile;
use App\Models\Proyecto;
use App\Models\Social;
use App\Models\Usuario;
use App\Models\ProfileVerificationRequest;
use App\Models\ProfileView;
use App\Support\OfficialSchema;
use Illuminate\Support\Facades\Cache;
use RuntimeException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ProfileService
{
    private array $tableCache = [];

    private array $columnCache = [];

    public function __construct(private readonly PublicAssetUrlService $assetUrlService) {}

    public function show(Usuario $usuario): array
    {
        return Cache::remember(
            $this->profileCacheKey($usuario->id, 'show'),
            now()->addSeconds(20),
            function () use ($usuario) {
                $socials = Social::forUser($usuario->id)->get()->keyBy('plataforma');
                $profileRecord = $usuario->profileRecord() ?: OfficialSchema::ensureProfile($usuario);
                $engagement = app(ProfileEngagementService::class)->summary($profileRecord, $profileRecord);
                $verification = ProfileVerificationRequest::query()
                    ->where('id_profile', $profileRecord->getKey())
                    ->orderByDesc('id_verification_request')
                    ->first();
                $cvUrl = $usuario->currentCvRecord()?->cv_url ?? '';
                $contactPublic = $usuario->contacto_publico;

                return [
                    'profile_id'            => (int) $profileRecord->getKey(),
                    'user_id'               => (int) $usuario->getKey(),
                    'nombre'               => (string) ($profileRecord->name ?? $usuario->getRawOriginal('name') ?? ''),
                    'apellido'             => (string) ($profileRecord->last_name ?? $usuario->getRawOriginal('last_name') ?? ''),
                    'email'                => (string) ($usuario->email ?? ''),
                    'rol'                  => $usuario->rol,
                    'active_permissions'   => $usuario->activePermissions(),
                    'profesion'            => (string) ($profileRecord->jobTitle?->name ?? ''),
                    'biografia'            => (string) ($profileRecord->biography ?? ''),
                    'ubicacion'            => (string) ($profileRecord->stateCountry?->name ?? ''),
                    'fecha_nacimiento'     => $profileRecord->birthdate,
                    'foto_perfil'          => (string) ($profileRecord->profile_photo ?? ''),
                    'foto_perfil_url'      => $this->assetUrlService->fromStoragePath($profileRecord->profile_photo),
                    'foto_portada'         => (string) ($profileRecord->cover_photo ?? ''),
                    'foto_portada_url'     => $this->assetUrlService->fromStoragePath($profileRecord->cover_photo),
                    'url_cv'               => $cvUrl,
                    'perfil_completado'    => (bool) $profileRecord->completed_profile,
                    'contacto_publico'     => $contactPublic,
                    'visibilidad_contacto' => $contactPublic ? 'public' : 'private',
                    'github'               => $socials->get('github')?->url ?? '',
                    'linkedin'             => $socials->get('linkedin')?->url ?? '',
                    'metrics'              => [
                        ...$engagement,
                        'profile_views' => ProfileView::where('id_profile_owner', $profileRecord->getKey())->count(),
                    ],
                    'verification'         => [
                        'status' => $verification?->status ?? 'none',
                        'is_verified' => $verification?->status === 'approved',
                        'rejection_reason' => $verification?->rejection_reason ?? '',
                    ],
                ];
            }
        );
    }

    public function overview(Usuario $usuario): array
    {
        return Cache::remember(
            $this->profileCacheKey($usuario->id, 'overview'),
            now()->addSeconds(20),
            function () use ($usuario) {
                $profile     = $this->show($usuario);
                $skills      = Habilidad::forUser($usuario->id)->orderByDesc('id_skill_profile')->get()->values();
                $experiences = Experience::forUser($usuario->id)->orderByDesc('start_date')->orderByDesc('id_experience')->get()->values();
                $projects    = Proyecto::forUser($usuario->id)->orderByDesc('id_project')->get()->values();
                $socials     = Social::forUser($usuario->id)->orderByDesc('id_social_networks')->get()->values();
                $education   = FormacionAcademica::forUser($usuario->id)
                    ->orderByDesc('start_date')
                    ->orderByDesc('id_university_career')
                    ->get()
                    ->values();

                return [
                    'profile' => $profile,
                    'skills' => $skills,
                    'experience' => $experiences,
                    'projects' => $projects,
                    'socials' => [
                        'cv_url' => $profile['url_cv'],
                        'links' => $socials,
                    ],
                    'profilePosts' => $this->overviewPosts($usuario),
                    'formacion' => $education,
                ];
            }
        );
    }

    private function overviewPosts(Usuario $usuario): array
    {
        return Publication::published()
            ->whereHas('profile.userRole', fn ($query) => $query->where('id_user', $usuario->id))
            ->with([
                'profile' => fn ($query) => $query->withCount(['followerRelations', 'followingRelations']),
                'profile.userRole.user',
                'profile.jobTitle',
                'profile.verificationRequests',
                'detail.project.skills',
                'detail.experience',
                'latestComment.commentator.userRole.user',
                'latestComment.commentator.verificationRequests',
            ])
            ->withCount([
                'comments as comments_count',
                'reactions as likes_count',
                'saves as saves_count',
            ])
            ->latest('created_at')
            ->limit(30)
            ->get()
            ->map(fn (Publication $publication) => $this->overviewPost($publication))
            ->values()
            ->all();
    }

    private function overviewPost(Publication $publication): array
    {
        $detail = $publication->detail;
        $project = $detail?->project;
        $experience = $detail?->experience;
        $profile = $publication->profile ?: $project?->profile ?: $experience?->profile;
        $user = $profile?->userRole?->user;
        $authorName = trim(($profile?->name ?? $user?->nombre ?? '') . ' ' . ($profile?->last_name ?? $user?->apellido ?? ''));
        $authorName = $authorName !== '' ? $authorName : 'Usuario Portafy';
        $comments = $publication->latestComment ? collect([$publication->latestComment]) : collect();

        return [
            'id' => 'publication-' . $publication->getKey(),
            'publicationId' => (int) $publication->getKey(),
            'type' => 'portfolio',
            'sourceType' => $project ? 'project' : ($experience ? 'experience' : 'profile'),
            'projectId' => $project?->id,
            'experienceId' => $experience?->id,
            'author' => [
                'id' => $user?->id,
                'name' => $authorName,
                'title' => $profile?->jobTitle?->name ?: 'Profesional Portafy',
                'avatar' => $this->assetUrlService->fromStoragePath($profile?->profile_photo),
                'isVerified' => $this->profileIsVerified($profile),
                'followersCount' => (int) ($profile?->follower_relations_count ?? $profile?->followerRelations()->count() ?? 0),
                'followingCount' => (int) ($profile?->following_relations_count ?? $profile?->followingRelations()->count() ?? 0),
                'isFollowing' => false,
            ],
            'content' => $publication->description ?: $this->defaultPostContent($project, $experience),
            'visibility' => (bool) $publication->visibility,
            'ownedByMe' => false,
            'project' => $project ? [
                'title' => $project->titulo,
                'description' => $project->descripcion,
                'status' => $project->estado,
                'repoUrl' => $project->url_repositorio,
                'demoUrl' => $project->url_demo,
            ] : null,
            'experience' => $experience ? [
                'title' => $experience->title,
                'company' => $experience->company,
                'type' => $experience->type,
                'typeLabel' => $experience->type_label,
                'description' => $experience->descripcion,
                'startDate' => $experience->fecha_inicio,
                'endDate' => $experience->fecha_fin,
                'isCurrent' => $experience->actualmente,
            ] : null,
            'image' => $this->assetUrlService->fromStoragePath($project?->imagen),
            'likes' => (int) ($publication->likes_count ?? 0),
            'commentsCount' => (int) ($publication->comments_count ?? 0),
            'saves' => (int) ($publication->saves_count ?? 0),
            'likedByMe' => false,
            'savedByMe' => false,
            'tags' => $project?->skills?->pluck('name')->values()->all() ?? [],
            'posted' => $publication->created_at?->diffForHumans() ?? '',
            'createdAt' => $publication->created_at?->toISOString(),
            'comments' => $comments->map(fn (PublicationComment $comment) => [
                'id' => (int) $comment->getKey(),
                'text' => $comment->comment,
                'author' => trim(($comment->commentator?->name ?? '') . ' ' . ($comment->commentator?->last_name ?? '')) ?: 'Usuario Portafy',
                'authorAvatar' => $this->assetUrlService->fromStoragePath($comment->commentator?->profile_photo),
                'authorId' => $comment->commentator?->userRole?->user?->id ?? null,
                'authorIsVerified' => $this->profileIsVerified($comment->commentator),
                'posted' => $comment->created_at?->diffForHumans() ?? '',
            ])->values(),
        ];
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

    private function defaultPostContent(?Proyecto $project, ?Experience $experience): string
    {
        if ($project) {
            return 'Comparti el proyecto ' . $project->titulo . ' desde mi portafolio.';
        }

        if ($experience) {
            $headline = trim(implode(' en ', array_filter([$experience->title, $experience->company])));
            return $headline !== ''
                ? 'Comparti mi experiencia: ' . $headline . '.'
                : 'Comparti una experiencia profesional de mi perfil.';
        }

        return 'Comparti una actualizacion de mi perfil profesional.';
    }

    public function storeOrUpdate(ProfileRequest $request): Usuario
    {
        $usuario = $request->user();
        $data = $this->extractGeneralProfileData($request);

        if ($data !== []) {
            $usuario->syncProfileData($data);
        }

        $this->syncSocialLinks($request, $usuario);
        $this->forgetProfileCache($usuario->id);

        return $usuario->fresh();
    }

    public function completar(ProfileRequest $request): void
    {
        $usuario = $request->user();
        $data = [];

        if ($request->filled('biografia')) {
            $data['biografia'] = $request->input('biografia');
        }

        if ($request->filled('ubicacion')) {
            $data['ubicacion'] = $request->input('ubicacion');
        }

        if ($request->hasFile('foto_perfil')) {
            $data['foto_perfil'] = $this->uploadProfileImage(
                $request,
                'foto_perfil',
                'portafolio/fotos_perfil',
                $usuario->foto_perfil
            );
        }

        $data['perfil_completado'] = 1;

        $usuario->syncProfileData($data);
        $this->forgetProfileCache($usuario->id);
    }

    public function crearPerfilProfesional(ProfileRequest $request): Usuario
    {
        $usuario = $request->user();

        if (! $usuario->perfil_completado) {
            throw new RuntimeException('Primero debe completar su perfil basico');
        }

        $data = $this->extractGeneralProfileData($request);

        if ($data !== []) {
            $usuario->syncProfileData($data);
        }

        $this->syncSocialLinks($request, $usuario);
        $this->forgetProfileCache($usuario->id);

        return $usuario->fresh();
    }

    public function adminShowProfile(Profile $profile): array
    {
        return $this->formatAdminProfile($profile->refresh());
    }

    public function adminUpdateProfile(AdminProfileUpdateRequest $request, Profile $profile): array
    {
        $data = $request->safe()->only([
            'name',
            'last_name',
            'biography',
            'birthdate',
            'completed_profile',
        ]);

        if ($request->hasFile('profile_photo')) {
            $data['profile_photo'] = $this->uploadAdminProfileImage(
                $request,
                'profile_photo',
                'portafolio/fotos_perfil',
                $profile->profile_photo
            );
        }

        if ($request->hasFile('cover_photo')) {
            $data['cover_photo'] = $this->uploadAdminProfileImage(
                $request,
                'cover_photo',
                'portafolio/fotos_portada',
                $profile->cover_photo
            );
        }

        $profile->fill($data);
        $profile->save();

        $userId = $profile->userRole?->id_user;
        if ($userId) {
            $this->forgetProfileCache((int) $userId);
        }

        return $this->formatAdminProfile($profile->refresh());
    }

    private function extractGeneralProfileData(ProfileRequest $request): array
    {
        $data = [];

        foreach (['nombre', 'apellido'] as $field) {
            if ($request->filled($field)) {
                $data[$field] = $request->input($field);
            }
        }

        foreach (['profesion', 'biografia', 'ubicacion', 'fecha_nacimiento'] as $field) {
            if ($request->has($field)) {
                $data[$field] = $request->input($field);
            }
        }

        if ($request->has('visibilidad_contacto')) {
            $data['contacto_publico'] = $request->input('visibilidad_contacto') !== 'private';
        }

        if ($request->has('contacto_publico')) {
            $data['contacto_publico'] = $request->boolean('contacto_publico');
        }

        if ($request->hasFile('foto_perfil')) {
            $data['foto_perfil'] = $this->uploadProfileImage(
                $request,
                'foto_perfil',
                'portafolio/fotos_perfil',
                $request->user()->foto_perfil
            );
        }

        if ($request->hasFile('foto_portada')) {
            $data['foto_portada'] = $this->uploadProfileImage(
                $request,
                'foto_portada',
                'portafolio/fotos_portada',
                $request->user()->foto_portada
            );
        }

        return $data;
    }

    private function uploadProfileImage(ProfileRequest $request, string $field, string $folder, ?string $previousUrl = null): string
    {
        $cloudinaryService = app(CloudinaryService::class);
        $uploadedUrl = $cloudinaryService->upload($request->file($field), $folder);

        if ($previousUrl && $previousUrl !== $uploadedUrl) {
            $cloudinaryService->delete($previousUrl);
        }

        return $uploadedUrl;
    }

    private function uploadAdminProfileImage(AdminProfileUpdateRequest $request, string $field, string $folder, ?string $previousUrl = null): string
    {
        $cloudinaryService = app(CloudinaryService::class);
        $uploadedUrl = $cloudinaryService->upload($request->file($field), $folder);

        if ($previousUrl && $previousUrl !== $uploadedUrl) {
            $cloudinaryService->delete($previousUrl);
        }

        return $uploadedUrl;
    }

    private function formatAdminProfile(Profile $profile): array
    {
        return [
            'id_profile' => (int) $profile->getKey(),
            'name' => (string) ($profile->name ?? ''),
            'last_name' => (string) ($profile->last_name ?? ''),
            'biography' => $profile->biography,
            'birthdate' => $profile->birthdate?->format('Y-m-d'),
            'profile_photo' => $this->assetUrlService->fromStoragePath($profile->profile_photo),
            'cover_photo' => $this->assetUrlService->fromStoragePath($profile->cover_photo),
            'completed_profile' => (int) ($profile->completed_profile ?? 0),
            'id_state_country' => $profile->id_state_country,
            'id_job_title' => $profile->id_job_title,
            'id_user_rol' => $profile->id_user_rol,
            'id_company' => $profile->id_company,
        ];
    }

    private function syncSocialLinks(ProfileRequest $request, Usuario $usuario): void
    {
        $profile = OfficialSchema::ensureProfile($usuario);

        foreach (['github', 'linkedin'] as $platformName) {
            if (! $request->filled($platformName)) {
                continue;
            }

            $platform = OfficialSchema::ensurePlatform($platformName);

            Social::updateOrCreate(
                [
                    'id_profile' => $profile->getKey(),
                    'id_platform' => $platform->getKey(),
                ],
                [
                    'url' => $request->input($platformName),
                    'public' => true,
                ]
            );
        }
    }

    private function getLegacyProfile(int $usuarioId): ?object
    {
        return DB::table('perfiles_usuarios')
            ->where('user_id', $usuarioId)
            ->first();
    }

    private function syncLegacyProfile(Usuario $usuario, array $overrides = []): void
    {
        if (! $this->hasTable('perfiles_usuarios')) {
            return;
        }

        $legacyProfile = $this->getLegacyProfile($usuario->id);

        $payload = [
            'nombre' => $overrides['nombre'] ?? $usuario->nombre,
            'apellido' => $overrides['apellido'] ?? $usuario->apellido,
            'ubicacion' => $overrides['ubicacion'] ?? $usuario->ubicacion,
            'fecha_nacimiento' => $overrides['fecha_nacimiento'] ?? $usuario->fecha_nacimiento,
            'foto_perfil' => $overrides['foto_perfil'] ?? $usuario->foto_perfil,
            'updated_at' => now(),
        ];

        if ($this->hasColumn('perfiles_usuarios', 'profesion')) {
            $payload['profesion'] = $overrides['profesion'] ?? $this->resolveProfession($usuario, $legacyProfile);
        }

        if ($legacyProfile) {
            DB::table('perfiles_usuarios')
                ->where('user_id', $usuario->id)
                ->update($payload);

            return;
        }

        DB::table('perfiles_usuarios')->insert([
            'user_id' => $usuario->id,
            'created_at' => now(),
            ...$payload,
        ]);
    }

    private function hasTable(string $table): bool
    {
        if (! array_key_exists($table, $this->tableCache)) {
            $this->tableCache[$table] = Cache::rememberForever(
                "schema.table.{$table}",
                static fn() => Schema::hasTable($table)
            );
        }

        return $this->tableCache[$table];
    }

    private function hasColumn(string $table, string $column): bool
    {
        $cacheKey = "{$table}.{$column}";

        if (! array_key_exists($cacheKey, $this->columnCache)) {
            $this->columnCache[$cacheKey] = Cache::rememberForever(
                "schema.column.{$cacheKey}",
                fn() => $this->hasTable($table) && Schema::hasColumn($table, $column)
            );
        }

        return $this->columnCache[$cacheKey];
    }

    private function resolveProfession(Usuario $usuario, ?object $legacyProfile): string
    {
        $usuarioProfesion = trim((string) ($usuario->profesion ?? ''));

        if ($usuarioProfesion !== '') {
            return $usuarioProfesion;
        }

        return trim((string) ($legacyProfile->profesion ?? ''));
    }

    private function profileCacheKey(int $userId, string $suffix): string
    {
        return "profile.{$userId}.{$suffix}";
    }

    private function forgetProfileCache(int $userId): void
    {
        Cache::forget($this->profileCacheKey($userId, 'show'));
        Cache::forget($this->profileCacheKey($userId, 'overview'));
    }
}
