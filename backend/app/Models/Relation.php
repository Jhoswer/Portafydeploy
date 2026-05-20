<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Relation extends Model
{
    protected $table = 'RELATION';

    protected $primaryKey = 'id_relation';

    public $timestamps = false;

    protected $fillable = [
        'id_profile1',
        'id_profile2',
        'last_status_date',
        'state_relation',
        'state_profile1',
        'state_profile2',
    ];

    protected $casts = [
        'last_status_date' => 'datetime',
    ];

    public function follower()
    {
        return $this->belongsTo(Profile::class, 'id_profile1', 'id_profile');
    }

    public function followed()
    {
        return $this->belongsTo(Profile::class, 'id_profile2', 'id_profile');
    }
}
