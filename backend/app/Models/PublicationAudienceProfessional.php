<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PublicationAudienceProfessional extends Model
{
    protected $table = 'PUBLICATION_AUDIENCE_PROFESSIONAL';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $keyType = 'int';

    public $timestamps = false;

    protected $fillable = [
        'id_publication',
        'id_professional_area',
        'id_professional_career',
    ];

    public function publication()
    {
        return $this->belongsTo(Publication::class, 'id_publication', 'id_publication');
    }

    public function professionalArea()
    {
        return $this->belongsTo(ProfessionalArea::class, 'id_professional_area', 'id_professional_area');
    }

    public function professionalCareer()
    {
        return $this->belongsTo(ProfessionalCareer::class, 'id_professional_career', 'id_professional_career');
    }
}
