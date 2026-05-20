<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class PostulationController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'id_offer'  => 'required|integer|exists:OFFER,id_offer',
            'reason'    => 'nullable|string|max:255',
            'id_cv'     => 'nullable|integer|exists:CV,id_cv',
        ]);

        $profile = DB::table('PROFILE')
            ->join('USER_ROLE', 'PROFILE.id_user_rol', '=', 'USER_ROLE.id_user_role')
            ->where('USER_ROLE.id_user', Auth::id())
            ->select('PROFILE.id_profile')
            ->first();

        if (!$profile) {
            return response()->json(['message' => 'Perfil no encontrado.'], 404);
        }

        $offer = DB::table('OFFER')
            ->where('id_offer', $request->id_offer)
            ->whereIn('state', ['open', 'visible'])
            ->first();

        if (!$offer) {
            return response()->json(['message' => 'La oferta no está disponible.'], 422);
        }

        $exists = DB::table('POSTULATION')
            ->where('id_offer', $request->id_offer)
            ->where('id_postulant', $profile->id_profile)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Ya te postulaste a esta oferta.'], 409);
        }

        $id = DB::table('POSTULATION')->insertGetId([
    'id_offer'     => $request->id_offer,
    'id_postulant' => $profile->id_profile,
    'id_cv'        => $request->id_cv,
    'reason'       => $request->reason,
    'state'        => 'new',
    'created_at'   => now(),
    'updated_at'   => now(),
], 'id_postulation');

        return response()->json([
            'message'        => 'Postulación registrada.',
            'id_postulation' => $id,
        ], 201);
    }

    public function index($id)
{
    $postulations = DB::table('POSTULATION as p')
        ->join('PROFILE as pr', 'p.id_postulant', '=', 'pr.id_profile')
        ->join('USER_ROLE as ur', 'pr.id_user_rol', '=', 'ur.id_user_role')
        ->join('USER as u', 'ur.id_user', '=', 'u.id_user')
        ->leftJoin('JOB_TITLE as jt', 'pr.id_job_title', '=', 'jt.id_job_title')
        ->leftJoin('INTERVIEW as i', 'p.id_postulation', '=', 'i.id_postulation')
        ->where('p.id_offer', $id)
        ->select(
            'p.id_postulation',
            'p.state',
            'p.reason',
            'p.created_at',
            'pr.id_profile',
            'pr.name',
            'pr.last_name',
            'pr.profile_photo',
            'pr.biography',
            'u.email',
            'jt.name as job_title',

            'i.id_interview',
            'i.type as interview_type',
            'i.link as interview_link',
            'i.address as interview_address',
            'i.interview_date',
            'i.interview_time'
        )
        ->orderBy('p.created_at', 'desc')
        ->get();

    return response()->json($postulations);
}

public function updateState(Request $request, $id)
{
    $request->validate([
        'state' => 'required|in:new,in_verification,in_interview,accepted,refused',
    ]);

    $updated = DB::table('POSTULATION')
        ->where('id_postulation', $id)
        ->update([
            'state'      => $request->state,
            'updated_at' => now(),
        ]);

    if (!$updated) {
        return response()->json(['message' => 'Postulación no encontrada.'], 404);
    }

    return response()->json(['message' => 'Estado actualizado.']);
}

// Postulante: retirar su propia postulación
public function destroy($id)
{
    $profile = DB::table('PROFILE')
        ->join('USER_ROLE', 'PROFILE.id_user_rol', '=', 'USER_ROLE.id_user_role')
        ->where('USER_ROLE.id_user', Auth::id())
        ->select('PROFILE.id_profile')
        ->first();

    if (!$profile) {
        return response()->json(['message' => 'Perfil no encontrado.'], 404);
    }

    $deleted = DB::table('POSTULATION')
        ->where('id_postulation', $id)
        ->where('id_postulant', $profile->id_profile)
        ->delete();

    if (!$deleted) {
        return response()->json(['message' => 'Postulación no encontrada o no autorizada.'], 404);
    }

    return response()->json(['message' => 'Postulación retirada.']);
}

public function myPostulations()
{
    $profile = DB::table('PROFILE')
        ->join('USER_ROLE', 'PROFILE.id_user_rol', '=', 'USER_ROLE.id_user_role')
        ->where('USER_ROLE.id_user', Auth::id())
        ->select('PROFILE.id_profile')
        ->first();

    if (!$profile) {
        return response()->json(['message' => 'Perfil no encontrado.'], 404);
    }

    $postulations = DB::table('POSTULATION as p')
        ->join('OFFER as o', 'p.id_offer', '=', 'o.id_offer')
        ->leftJoin('COMPANY as c', 'o.id_company', '=', 'c.id_company')
        ->where('p.id_postulant', $profile->id_profile)
        ->select(
            'p.id_postulation',
            'p.state',
            'p.reason',
            'p.created_at',
            'o.id_offer',
            'o.title as offer_title',
            'o.location as offer_location',
            'c.name as company_name',
            'c.logo as company_logo',
        )
        ->orderBy('p.created_at', 'desc')
        ->get();

    return response()->json($postulations);
}
public function storeInterview(Request $request, $id)
    {
        $request->validate([
            'type'           => 'required|in:virtual,presencial',
            'link'           => 'nullable|url|max:500',
            'address'        => 'nullable|string|max:255',
            'interview_date' => 'nullable|date',
            'interview_time' => 'nullable|date_format:H:i',
        ]);

        $postulation = DB::table('POSTULATION')
            ->where('id_postulation', $id)
            ->first();

        if (!$postulation) {
            return response()->json(['message' => 'Postulación no encontrada.'], 404);
        }

        // Actualizar o crear (una postulación = una entrevista)
        $existing = DB::table('INTERVIEW')
            ->where('id_postulation', $id)
            ->first();

        if ($existing) {
            DB::table('INTERVIEW')
                ->where('id_postulation', $id)
                ->update([
                    'type'           => $request->type,
                    'link'           => $request->link,
                    'address'        => $request->address,
                    'interview_date' => $request->interview_date,
                    'interview_time' => $request->interview_time,
                    'updated_at'     => now(),
                ]);
        } else {
            DB::table('INTERVIEW')->insert([
                'id_postulation' => $id,
                'type'           => $request->type,
                'link'           => $request->link,
                'address'        => $request->address,
                'interview_date' => $request->interview_date,
                'interview_time' => $request->interview_time,
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);
        }

        DB::table('POSTULATION')
            ->where('id_postulation', $id)
            ->update(['state' => 'in_interview', 'updated_at' => now()]);

        return response()->json(['message' => 'Entrevista agendada.'], 201);
    }
}
