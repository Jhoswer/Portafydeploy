<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserNotification extends Model
{
    protected $table = 'NOTIFICATION';

    protected $primaryKey = 'id_notification';

    public $incrementing = true;

    protected $keyType = 'int';

    const UPDATED_AT = null;

    protected $fillable = [
        'id_receiver',
        'id_sender',
        'type',
        'title',
        'message',
        'is_read',
        'reference_type',
        'reference_id',
        'device',
        'location',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function receiver()
    {
        return $this->belongsTo(Usuario::class, 'id_receiver', 'id_user');
    }

    public function sender()
    {
        return $this->belongsTo(Usuario::class, 'id_sender', 'id_user');
    }
}
