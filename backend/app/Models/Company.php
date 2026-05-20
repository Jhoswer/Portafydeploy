<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $table      = 'COMPANY';
    protected $primaryKey = 'id_company';

    protected $fillable = [

        'name', 'description', 'mission', 'vision',
        'logo_url', 'banner_url',
        'industry', 'city', 'id_country',
        'phone_prefix', 'phone', 'website', 'state',
        'founded_year',
        'size',
        'alcance',
        'personeria',
        'address',
        'schedule',
        'specialty',
        'segment',
        'services',
    ];

    public function recruiter()
    {
        return $this->hasOne(Profile::class, 'id_company', 'id_company');
    }
}
