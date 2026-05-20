<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnalyticEvent extends Model
{
    protected $table = 'ANALYTIC_EVENT';

    protected $primaryKey = 'id_analytic_event';

    protected $fillable = [
        'id_profile_owner',
        'id_actor_profile',
        'event_type',
        'target_type',
        'target_id',
        'metadata',
        'occurred_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'occurred_at' => 'datetime',
    ];
}
