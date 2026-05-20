<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Offer extends Model
{
    protected $table = 'OFFER';
    protected $primaryKey = 'id_offer';

    protected $appends = ['real_state'];

    protected $fillable = [
        'title',
        'description',
        'type',
        'modalidad',
        'ubicacion',
        'salary_min',
        'salary_max',
        'currency',
        'nivel',
        'banner_url',
        'area',
        'show_salary',
        'quota_quantity',
        'closed_at',
        'state',
        'id_profile',
        'id_audience_type',
    ];

    protected $casts = [
        'show_salary'      => 'boolean',
        'closed_at'        => 'date',
        'salary_min'       => 'integer',
        'salary_max'       => 'integer',
        'id_audience_type' => 'integer',
    ];

    public function profile()
    {
        return $this->belongsTo(
            Profile::class,
            'id_profile',
            'id_profile'
        );
    }

    public function offerDetails()
    {
        return $this->hasMany(
            OfferDetail::class,
            'id_offer',
            'id_offer'
        );
    }

    public function skills()
    {
        return $this->hasManyThrough(
            Skill::class,
            OfferDetail::class,
            'id_offer',
            'id_skill',
            'id_offer',
            'id_skill'
        );
    }

    // Tipo de audiencia
    public function audienceType()
    {
        return $this->belongsTo(
            AudienceType::class,
            'id_audience_type',
            'id_audience_type'
        );
    }


    public function getRealStateAttribute()
    {
        if ($this->state === 'removed') {
            return 'removed';
        }

        if ($this->state === 'private') {
            return 'private';
        }

        if (
            $this->closed_at &&
            $this->closed_at->lt(today())
        ) {
            return 'closed';
        }

        return $this->state;
    }
}
