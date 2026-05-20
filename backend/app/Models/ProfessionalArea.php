<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfessionalArea extends Model
{
    protected $table = 'PROFESSIONAL_AREA';

    protected $primaryKey = 'id_professional_area';

    public $incrementing = false; // GENERATED ALWAYS AS IDENTITY (no es autoincrement estándar)

    protected $keyType = 'int';

    protected $fillable = [
        'name',
        'description',
        'state',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relación: un área tiene muchas carreras
    public function professionalCareers()
    {
        return $this->hasMany(ProfessionalCareer::class, 'id_professional_area', 'id_professional_area');
    }

    // Scope para filtrar solo activas
    public function scopeActive($query)
    {
        return $query->where('state', 'active');
    }
}
