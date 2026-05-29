<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class SetLogUserContext
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        $userRoleId = null;

        if ($user instanceof Usuario) {
            $profile = $user->profileRecord();

            $userRoleId = $profile?->id_user_rol
                ?? $user->primaryUserRole()?->getKey();

            if ($userRoleId !== null) {
                DB::selectOne(
                    "select set_config('app.current_user_rol', ?, false) as value",
                    [(string) $userRoleId]
                );
            }
        }

        try {
            return $next($request);
        } finally {
            if ($userRoleId !== null) {
                DB::selectOne(
                    "select set_config('app.current_user_rol', '', false) as value"
                );
            }
        }
    }
}
