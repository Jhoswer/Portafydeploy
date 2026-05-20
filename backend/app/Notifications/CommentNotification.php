<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;

class CommentNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly int    $actorId,
        public readonly string $actorName,
        public readonly string $actorAvatar,
        public readonly int    $commentId,        // id_comment de COMMENT
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
            'type'          => 'comment',
            'actor_id'      => $this->actorId,
            'actor_name'    => $this->actorName,
            'actor_avatar'  => $this->actorAvatar,
            'comment_id'    => $this->commentId,
            'post_id'       => $this->publicationId,
            'preview'       => $this->preview,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("{$this->actorName} comentó tu publicación")
            ->line("{$this->actorName} comentó: \"{$this->preview}\"")
            ->action('Ver comentario', url("/feed/posts/{$this->publicationId}#comment-{$this->commentId}"));
    }
}