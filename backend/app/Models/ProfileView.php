<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfileView extends Model
{
    protected $table = 'PROFILE_VIEW';

    protected $primaryKey = 'id_profile_view';

    protected $fillable = [
        'id_profile_owner',
        'id_viewer_profile',
        'viewed_at',
        'source',
    ];

    protected $casts = [
        'viewed_at' => 'datetime',
    ];

    public function owner()
    {
        return $this->belongsTo(Profile::class, 'id_profile_owner', 'id_profile');
    }

    public function viewer()
    {
        return $this->belongsTo(Profile::class, 'id_viewer_profile', 'id_profile');
    }
}
