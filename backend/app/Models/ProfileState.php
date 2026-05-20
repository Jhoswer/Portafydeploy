<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfileState extends Model
{
    protected $table = 'PROFILE_STATE';

    protected $primaryKey = 'id_profile_state';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'state_profile',
        'last_connection',
        'start_date',
        'end_date',
        'id_profile',
    ];

    protected $casts = [
        'last_connection' => 'datetime',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    public function profile()
    {
        return $this->belongsTo(Profile::class, 'id_profile', 'id_profile');
    }
}
