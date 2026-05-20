<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AudienceType extends Model
{
    protected $table = 'AUDIENCE_TYPE';
    protected $primaryKey = 'id_audience_type';

    protected $fillable = [
        'code',
        'name',
        'description',
    ];
}
