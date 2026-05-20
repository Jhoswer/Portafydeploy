<?php

namespace App\Services;

use App\Models\ProfileState;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class SuspensionService
{
    public function searchUsers(string $query = ''): array
    {
        $query = preg_replace('/\s+/', ' ', trim($query));

        $builder = Usuario::query()
            ->select('USER.*')
            ->join('USER_ROLE as ur', 'ur.id_user', '=', 'USER.id_user')
            ->join('ROLE as r', 'r.id_role', '=', 'ur.id_role')
            ->join('PROFILE as p', 'p.id_user_rol', '=', 'ur.id_user_role')
            ->leftJoin('STATE_COUNTRY as sc', 'sc.id_state_country', '=', 'p.id_state_country');
            // PROFILE_STATE exists in the actual schema and stores the suspension status.

        $builder->leftJoin('PROFILE_STATE as ps', 'ps.id_profile', '=', 'p.id_profile');

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

        $users = $builder
            ->distinct()
            ->limit(30)
            ->get();

        return $users->map(fn (Usuario $user) => $this->formatSearchResult($user))->values()->all();
    }

    public function suspendUser(Usuario $actor, array $data): array
    {
        $this->assertSuperAdmin($actor);

        $target = Usuario::query()
            ->select('USER.*')
            ->with(['profile.jobTitle', 'profile.stateCountry', 'profile.profileState'])
            ->findOrFail((int) $data['user_id']);

        if (in_array(Str::lower((string) $target->rol), ['administrador', 'super administrador'], true)) {
            throw new RuntimeException('No se puede suspender a administradores ni super administradores.');
        }

        if ($target->isSuspended()) {
            throw new RuntimeException('El usuario ya se encuentra suspendido.');
        }

        $suspensionEndsAt = $data['tipo'] === 'temporal'
            ? $data['fecha_fin']
            : null;

        DB::transaction(function () use ($actor, $target, $data, $suspensionEndsAt) {
            $profile = $target->profileRecord();

            if (! $profile) {
                throw new RuntimeException('El usuario no tiene perfil asociado.');
            }

            ProfileState::updateOrCreate(
                ['id_profile' => $profile->getKey()],
                [
                    'state_profile' => 'suspended',
                    'start_date' => now(),
                    'end_date' => $suspensionEndsAt,
                    'last_connection' => $profile->profileState?->last_connection,
                ]
            );

            $userRoleId = DB::table('USER_ROLE')
                ->where('id_user', $actor->id_user)
                ->value('id_user_role');

            DB::table('LOG')->insert([
                'id_user_rol' => $userRoleId,
                'modified_table' => 'PROFILE_STATE',
                'modified_field' => 'suspension_reason',
                'previous_value' => null,
                'new_value' => $data['motivo'],
                'created_at' => now(),
                'type' => 'update',
            ]);
        });

        $target->refresh();
        $target->unsetRelation('profile');

        return [
            'usuario' => $this->formatSuspendedUser($target),
            'suspension' => [
                'tipo' => $data['tipo'],
                'motivo' => $data['motivo'],
                'fecha_fin' => $suspensionEndsAt,
                'suspendido_en' => now()->toDateTimeString(),
                'suspendido_por' => $actor->nombre.' '.$actor->apellido,
            ],
        ];
    }

    private function formatSearchResult(Usuario $user): array
    {
        $role = strtolower((string) $user->rol);
        $targetLocation = trim((string) $user->ubicacion);
        $canSuspend = ! in_array($role, ['administrador', 'super administrador'], true) && ! $user->isSuspended();
        $reason = $this->buildDisableReason($user);
        $profileState = $user->profileRecord()?->profileState;

        return [
            'id' => $user->id_user,
            'nombre' => $user->nombre,
            'apellido' => $user->apellido,
            'email' => $user->email,
            'rol' => $user->rol,
            'ubicacion' => $targetLocation ?: null,
            'foto_perfil' => $user->foto_perfil ?: null,
            'suspendido' => $user->isSuspended(),
            'suspension_status' => $user->suspension_status,
            'suspension_type' => $profileState?->end_date ? 'temporal' : ($profileState?->state_profile === 'suspended' ? 'permanente' : null),
            'suspension_reason' => null,
            'suspension_ends_at' => $profileState?->end_date,
            'can_suspend' => $canSuspend,
            'disable_reason' => $canSuspend ? null : $reason,
        ];
    }

    private function formatSuspendedUser(Usuario $user): array
    {
        return [
            'id' => $user->id_user,
            'nombre' => $user->nombre,
            'apellido' => $user->apellido,
            'email' => $user->email,
            'rol' => $user->rol,
            'ubicacion' => $user->ubicacion ?: null,
            'suspendido' => $user->isSuspended(),
            'suspension_status' => $user->suspension_status,
            'suspension_type' => $user->profileRecord()?->profileState?->end_date ? 'temporal' : 'permanente',
            'suspension_reason' => null,
            'suspension_ends_at' => $user->profileRecord()?->profileState?->end_date,
        ];
    }

    private function buildDisableReason(Usuario $user): string
    {
        $role = strtolower((string) $user->rol);

        if (in_array($role, ['administrador', 'super administrador'], true)) {
            return 'No se puede suspender a usuarios con rol administrativo.';
        }

        if ($user->isSuspended()) {
            return 'Este usuario ya tiene una suspension activa.';
        }

        return '';
    }

    private function assertSuperAdmin(Usuario $actor): void
    {
        if (strtolower((string) $actor->rol) !== 'super administrador') {
            throw new RuntimeException('Solo el super administrador puede suspender usuarios.');
        }
    }
}
