<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CalendarEventController extends Controller
{
    private const ADMIN_ROLE_IDS = [5, 6];

    private function isAdmin(): bool
    {
        $userId = auth()->id();
        return DB::table('USER_ROLE')
            ->where('id_user', $userId)
            ->whereIn('id_role', self::ADMIN_ROLE_IDS)
            ->exists();
    }

    public function index(Request $request)
    {
        // CAMBIO: admins ven todos, usuarios ven solo los suyos
        if ($this->isAdmin()) {
            $events = DB::table('EVENT')
                ->orderBy('date')
                ->orderBy('time')
                ->get();
        } else {
            // CAMBIO: id_profile = id_user directamente
            $userId = auth()->id();
            $events = DB::table('EVENT')
                ->where('id_profile', $userId)
                ->orderBy('date')
                ->orderBy('time')
                ->get();
        }

        return response()->json($events);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_calendar' => 'nullable|integer',
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'date'        => 'required|date',
            'time'        => 'nullable|date_format:H:i',
            'priority'    => 'nullable|string|max:50',
            'tag'         => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // CAMBIO: id_profile se obtiene del token, no del body
        $userId = auth()->id();

        $id = DB::table('EVENT')->insertGetId([
            'id_profile'  => $userId,
            'id_calendar' => $request->id_calendar,
            'title'       => $request->title,
            'description' => $request->description,
            'date'        => $request->date,
            'time'        => $request->time,
            'priority'    => $request->priority ?? 'normal',
            'tag'         => $request->tag,
            'created_at'  => now(),
            'updated_at'  => now(),
        ], 'id_event');

        $event = DB::table('EVENT')->where('id_event', $id)->first();

        return response()->json($event, 201);
    }
}