<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\NotificationService;

class NotificationController extends Controller
{
    public function __construct(private NotificationService $service) {}

    // GET /api/notifications
    public function index(Request $request): JsonResponse
    {
        $result = $this->service->getForUser(
            $request->user(),
            (int) $request->query('page', 1)
        );

        return response()->json($result);
    }

    // GET /api/notifications/unread-count
    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json([
            'count' => $this->service->getUnreadCount($request->user()),
        ]);
    }

    // PATCH /api/notifications/{id}/read
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $this->service->markOneAsRead($request->user(), $id);

        return response()->json(['message' => 'Notificación marcada como leída.']);
    }

    // PATCH /api/notifications/read-all
    public function markAllAsRead(Request $request): JsonResponse
    {
        $this->service->markAllAsRead($request->user());

        return response()->json(['message' => 'Todas marcadas como leídas.']);
    }

    // GET /api/notification-preferences
    public function getPreferences(Request $request): JsonResponse
    {
        return response()->json(
            $this->service->getPreferences($request->user())
        );
    }

    // PUT /api/notification-preferences
    public function savePreferences(Request $request): JsonResponse
    {
        $request->validate([
            'activity_notifications' => 'boolean',
            'portfolio_notifications' => 'boolean',
            'offer_notifications' => 'boolean',
            'support_notifications' => 'boolean',
            'platform_notifications' => 'boolean',
            'security_notifications' => 'boolean',
            'social' => 'boolean',
            'admin' => 'boolean',
        ]);

        $this->service->savePreferences($request->user(), $request->all());

        return response()->json(['message' => 'Preferencias guardadas.']);
    }

    // POST /api/push-tokens
    public function storePushToken(Request $request): JsonResponse
    {
        $request->validate([
            'token'    => 'required|string',
            'platform' => 'in:web,android,ios',
        ]);

        $this->service->storePushToken(
            $request->user(),
            $request->token,
            $request->platform ?? 'web'
        );

        return response()->json(['message' => 'Token registrado.']);
    }
}
