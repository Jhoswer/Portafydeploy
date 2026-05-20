<?php

namespace App\Services;

use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AgregarAdminService
{
    private const DEFAULT_REGION = 'Por defecto';

    /**
     * @param  array $data  Datos validados:
     *                      { nombre, apellido, email, numero?, pais, ciudad, password }
     * @return array        Datos del admin creado para la respuesta JSON
     * @throws \Exception   Si el email ya existe o falla algun paso
     */
    public function crearAdministrador(array $data): array
    {
        $pais = trim((string) ($data['pais'] ?? ''));
        $ciudad = trim((string) ($data['ciudad'] ?? ''));
        $ubicacion = $pais === self::DEFAULT_REGION && $ciudad === self::DEFAULT_REGION
            ? self::DEFAULT_REGION
            : trim(sprintf('%s, %s', $ciudad, $pais), ' ,');

        $usuario = Usuario::create([
            'name'      => $data['nombre'],
            'last_name' => $data['apellido'],
            'email'     => $data['email'],
            'number'    => $data['numero'] ?? null,
        ]);

        $usuario->syncRole('administrador');

        $usuario->syncProfileData([
            'nombre'    => $data['nombre'],
            'apellido'  => $data['apellido'],
            'ubicacion' => $ubicacion,
        ]);

        $usuario->syncPassword(Hash::make($data['password']));

        $usuario->refresh();
        $usuario->unsetRelation('profile');

        Log::info('Administrador creado', [
            'id_user'   => $usuario->id_user,
            'email'     => $usuario->email,
            'ubicacion' => $ubicacion,
        ]);

        return [
            'id_user'   => $usuario->id_user,
            'nombre'    => $usuario->nombre,
            'apellido'  => $usuario->apellido,
            'email'     => $usuario->email,
            'rol'       => $usuario->rol,
            'ubicacion' => $usuario->ubicacion,
        ];
    }
}
