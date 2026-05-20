<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;

class NewFollowerNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly int    $actorId,
        public readonly string $actorName,
        public readonly string $actorAvatar,
    ) {}

    public function via(object $notifiable): array
    {
        return $notifiable->enabledChannels('social');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'         => 'follow',
            'actor_id'     => $this->actorId,
            'actor_name'   => $this->actorName,
            'actor_avatar' => $this->actorAvatar,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("{$this->actorName} comenzó a seguirte")
            ->line("{$this->actorName} ahora te sigue en PortaFy.")
            ->action('Ver perfil', url("/profile/{$this->actorId}"));
    }
}