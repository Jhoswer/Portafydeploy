<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfileVerificationRequest extends Model
{
    protected $table = 'PROFILE_VERIFICATION_REQUEST';

    protected $primaryKey = 'id_verification_request';

    protected $fillable = [
        'id_profile',
        'status',
        'document_front_url',
        'document_back_url',
        'document_pdf_url',
        'rejection_reason',
        'submitted_at',
        'reviewed_at',
        'reviewed_by_profile',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    public function profile()
    {
        return $this->belongsTo(Profile::class, 'id_profile', 'id_profile');
    }
}
