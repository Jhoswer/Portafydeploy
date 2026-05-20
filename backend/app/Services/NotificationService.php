<?php

namespace App\Services;

use App\Models\NotificationPreference;
use App\Models\UserNotification;
use Illuminate\Contracts\Auth\Authenticatable;

class NotificationService
{
    private const SETTING_COLUMNS = [
        'activity_notifications',
        'portfolio_notifications',
        'offer_notifications',
        'support_notifications',
        'platform_notifications',
        'security_notifications',
    ];

    public function getForUser(Authenticatable $user, int $page = 1): array
    {
        $paginated = UserNotification::query()
            ->with('sender.profile')
            ->where('id_receiver', $user->getAuthIdentifier())
            ->orderByDesc('created_at')
            ->paginate(20, ['*'], 'page', $page);

        return [
            'data' => $paginated->map(function (UserNotification $notification) {
                $senderName = $notification->sender
                    ? trim($notification->sender->name . ' ' . $notification->sender->last_name)
                    : null;
                $senderAvatar = $notification->sender?->profile?->profile_photo ?? null;
                $referenceId = $notification->reference_id ? (int) $notification->reference_id : null;

                return [
                    'id' => (int) $notification->id_notification,
                    'id_receiver' => (int) $notification->id_receiver,
                    'id_sender' => $notification->id_sender ? (int) $notification->id_sender : null,
                    'sender_name' => $senderName,
                    'sender_avatar' => $senderAvatar,
                    'actor_id' => $notification->id_sender ? (int) $notification->id_sender : null,
                    'actor_name' => $senderName,
                    'actor_avatar' => $senderAvatar,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'is_read' => (bool) $notification->is_read,
                    'read_at' => $notification->is_read ? $notification->updated_at : null,
                    'reference_type' => $notification->reference_type,
                    'reference_id' => $referenceId,
                    'notifiable_id' => $referenceId,
                    'device' => $notification->device,
                    'location' => $notification->location,
                    'created_at' => $notification->created_at,
                    'data' => [
                        'type' => $notification->type,
                        'actor_id' => $notification->id_sender ? (int) $notification->id_sender : null,
                        'actor_name' => $senderName,
                        'actor_avatar' => $senderAvatar,
                        'notifiable_id' => $referenceId,
                        'reference_type' => $notification->reference_type,
                        'reference_id' => $referenceId,
                        'title' => $notification->title,
                        'message' => $notification->message,
                        'device' => $notification->device,
                        'location' => $notification->location,
                    ],
                ];
            })->values(),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'total' => $paginated->total(),
            ],
        ];
    }

    public function getUnreadCount(Authenticatable $user): int
    {
        return UserNotification::query()
            ->where('id_receiver', $user->getAuthIdentifier())
            ->where('is_read', false)
            ->count();
    }

    public function markOneAsRead(Authenticatable $user, string $id): void
    {
        UserNotification::query()
            ->where('id_receiver', $user->getAuthIdentifier())
            ->findOrFail($id)
            ->update(['is_read' => true]);
    }

    public function markAllAsRead(Authenticatable $user): void
    {
        UserNotification::query()
            ->where('id_receiver', $user->getAuthIdentifier())
            ->where('is_read', false)
            ->update(['is_read' => true]);
    }

    public function getPreferences(Authenticatable $user): array
    {
        $settings = $this->settingsFor($user);

        return collect(self::SETTING_COLUMNS)
            ->mapWithKeys(fn (string $column) => [$column => (bool) $settings->{$column}])
            ->all();
    }

    public function savePreferences(Authenticatable $user, array $prefs): void
    {
        $payload = [];

        foreach (self::SETTING_COLUMNS as $column) {
            if (array_key_exists($column, $prefs)) {
                $payload[$column] = (bool) $prefs[$column];
            }
        }

        if (array_key_exists('social', $prefs)) {
            $payload['activity_notifications'] = (bool) $prefs['social'];
        }

        if (array_key_exists('admin', $prefs)) {
            $payload['platform_notifications'] = (bool) $prefs['admin'];
        }

        unset($payload['security_notifications']);

        if ($payload !== []) {
            NotificationPreference::query()->updateOrCreate(
                ['id_user' => $user->getAuthIdentifier()],
                $payload
            );
        }
    }

    public function storePushToken(Authenticatable $user, string $token, string $platform = 'web'): void
    {
        // La tabla PUSH_TOKEN no esta incluida en el esquema oficial de notificaciones.
    }

    public function createActivity(
        Authenticatable $receiver,
        Authenticatable $sender,
        string $type,
        string $title,
        string $message,
        ?string $referenceType = null,
        ?int $referenceId = null,
        ?string $device = null,
        ?string $location = null,
    ): ?UserNotification {
        if (! $this->isEnabled($receiver, 'activity_notifications')) {
            return null;
        }

        return UserNotification::create([
            'id_receiver' => $receiver->getAuthIdentifier(),
            'id_sender' => $sender->getAuthIdentifier(),
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'device' => $device,
            'location' => $location,
        ]);
    }

    private function isEnabled(Authenticatable $user, string $column): bool
    {
        return (bool) $this->settingsFor($user)->{$column};
    }

    private function settingsFor(Authenticatable $user): NotificationPreference
    {
        $settings = NotificationPreference::query()->firstOrCreate([
            'id_user' => $user->getAuthIdentifier(),
        ]);

        return $settings->wasRecentlyCreated ? $settings->refresh() : $settings;
    }
}
