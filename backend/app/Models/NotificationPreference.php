<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationPreference extends Model
{
    protected $table = 'NOTIFICATION_SETTINGS';

    protected $primaryKey = 'id_notification_settings';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'id_user',
        'activity_notifications',
        'portfolio_notifications',
        'offer_notifications',
        'support_notifications',
        'platform_notifications',
        'security_notifications',
    ];

    protected $casts = [
        'activity_notifications' => 'boolean',
        'portfolio_notifications' => 'boolean',
        'offer_notifications' => 'boolean',
        'support_notifications' => 'boolean',
        'platform_notifications' => 'boolean',
        'security_notifications' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(Usuario::class, 'id_user', 'id_user');
    }
}
