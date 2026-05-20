<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;

class EventNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly int    $eventId,
        public readonly string $eventTitle,
        public readonly string $eventDate,
        public readonly int    $organizerId,
        public readonly string $organizerName,
    ) {}

    public function via(object $notifiable): array
    {
        return $notifiable->enabledChannels('portfolio');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'           => 'event',
            'event_id'       => $this->eventId,
            'event_title'    => $this->eventTitle,
            'event_date'     => $this->eventDate,
            'organizer_id'   => $this->organizerId,
            'organizer_name' => $this->organizerName,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Nuevo evento: {$this->eventTitle}")
            ->line("{$this->organizerName} publicó un nuevo evento: {$this->eventTitle}")
            ->action('Ver evento', url("/events/{$this->eventId}"));
    }
}