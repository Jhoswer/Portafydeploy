<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Offer;
use App\Models\ProfessionalArea;
use App\Models\ProfessionalCareer;

/**
 * Modelo para la tabla OFFER_AUDIENCE_PROFESSIONAL.
 *
 * Guarda el filtro de audiencia profesional de una oferta:
 *  - id_professional_area   (requerido cuando id_audience_type = 4)
 *  - id_professional_career (opcional — si null, aplica a toda el área)
 */
class OfferAudienceProfessional extends Model
{
    protected $table      = 'OFFER_AUDIENCE_PROFESSIONAL';
    protected $primaryKey = 'id';

    public $timestamps = false;

    protected $fillable = [
        'id_offer',
        'id_professional_area',
        'id_professional_career',
    ];

    // ── Relaciones ────────────────────────────────────────────────────────────

    public function offer(): BelongsTo
    {
        return $this->belongsTo(Offer::class, 'id_offer', 'id_offer');
    }

    public function professionalArea(): BelongsTo
    {
        return $this->belongsTo(ProfessionalArea::class, 'id_professional_area', 'id_professional_area');
    }

    public function professionalCareer(): BelongsTo
    {
        return $this->belongsTo(ProfessionalCareer::class, 'id_professional_career', 'id_professional_career');
    }
}
