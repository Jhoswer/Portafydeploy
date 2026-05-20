<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SkillProfile extends Model
{
    protected $table = 'SKILL_PROFILE';

    protected $primaryKey = 'id_skill_profile';

    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'id_skill',
        'id_profile',
        'level',
        'visibility',
    ];

    protected $casts = [
        'visibility' => 'boolean',
    ];

    public function skill()
    {
        return $this->belongsTo(Skill::class, 'id_skill', 'id_skill');
    }

    public function profile()
    {
        return $this->belongsTo(Profile::class, 'id_profile', 'id_profile');
    }
}