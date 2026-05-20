<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;

class LikeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly int    $actorId,
        public readonly string $actorName,
        public readonly string $actorAvatar,
        public readonly int    $publicationId,    // id_publication de PUBLICATION
        public readonly string $preview = '',
    ) {}

    public function via(object $notifiable): array
    {
        return $notifiable->enabledChannels('social');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'           => 'like',
            'actor_id'       => $this->actorId,
            'actor_name'     => $this->actorName,
            'actor_avatar'   => $this->actorAvatar,
            'notifiable_id'  => $this->publicationId,
            'preview'        => $this->preview,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("{$this->actorName} reaccionó a tu publicación")
            ->line("{$this->actorName} le dio like a tu publicación.")
            ->action('Ver publicación', url("/feed/posts/{$this->publicationId}"));
    }
}