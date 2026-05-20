<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfessionalCareer extends Model
{
    protected $table = 'PROFESSIONAL_CAREER';

    protected $primaryKey = 'id_professional_career';

    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = [
        'id_professional_area',
        'name',
        'description',
        'state',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relación: una carrera pertenece a un área
    public function professionalArea()
    {
        return $this->belongsTo(ProfessionalArea::class, 'id_professional_area', 'id_professional_area');
    }

    // Scope para filtrar solo activas
    public function scopeActive($query)
    {
        return $query->where('state', 'active');
    }
}
