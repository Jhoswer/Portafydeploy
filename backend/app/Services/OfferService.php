<?php

namespace App\Services;

use App\Models\Offer;
use App\Models\Profile;
use App\Models\Skill;
use App\Models\OfferDetail;
use App\Models\OfferAudienceProfessional;
use App\Support\CloudinaryUploader;
use Illuminate\Support\Facades\DB;

class OfferService
{
    /**
     * Crea una oferta, la publica en el feed y guarda el filtro profesional si aplica.
     *
     * @param array        $data           Datos validados del request
     * @param Profile      $profile        Perfil del reclutador
     * @param object|null  $bannerFile     Archivo de imagen opcional
     * @param array|null   $audienceFilters ['id_professional_area' => int, 'career' => string|null]
     */
    public function store(
        array $data,
        Profile $profile,
        ?object $bannerFile = null,
        ?array $audienceFilters = null
    ): Offer {
        $bannerUrl = null;
        if ($bannerFile) {
            $bannerUrl = CloudinaryUploader::upload($bannerFile, 'offers');
        }

        $idAudienceType = (int) ($data['id_audience_type'] ?? 1);

        return DB::transaction(function () use ($data, $profile, $bannerUrl, $idAudienceType, $audienceFilters) {

            // ── 1. Crear la oferta ────────────────────────────────────────
            $offer = Offer::create([
                'title'            => $data['title'],
                'description'      => $data['description']    ?? null,
                'type'             => $data['type']           ?? null,
                'modalidad'        => $data['modalidad']      ?? null,
                'ubicacion'        => $data['ubicacion']      ?? null,
                'salary_min'       => $data['salary_min']     ?? null,
                'salary_max'       => $data['salary_max']     ?? null,
                'currency'         => $data['currency']       ?? 'USD',
                'nivel'            => $data['nivel']          ?? null,
                'area'             => $data['area']           ?? null,
                'show_salary'      => $data['show_salary']    ?? true,
                'quota_quantity'   => $data['quota_quantity'] ?? null,
                'closed_at'        => $data['closed_at']      ?? null,
                'banner_url'       => $bannerUrl,
                'state'            => $data['state'],
                'id_profile'       => $profile->id_profile,
                'id_audience_type' => $idAudienceType,
            ]);

            // ── 2. Sincronizar skills ─────────────────────────────────────
            if (!empty($data['skills'])) {
                $this->syncSkills($offer, $data['skills']);
            }

            // ── 3. Crear la publicación en el feed con la audiencia correcta
            $publicationId = DB::table('PUBLICATION')->insertGetId([
                'description'      => $offer->title,
                'outstanding'      => false,
                'visibility'       => true,
                'state'            => 'published',
                'created_at'       => now(),
                'updated_at'       => now(),
                'id_profile'       => $profile->id_profile,
                'id_audience_type' => $idAudienceType,  // ← propagar audiencia
            ], 'id_publication');

            DB::table('PUBLICATION_DETAIL')->insert([
                'id_publication' => $publicationId,
                'id_offer'       => $offer->id_offer,
                'id_publicized'  => $profile->id_profile,
            ]);

            // ── 4. Si la audiencia es "profesional", guardar el filtro ────
            if ((int) $idAudienceType === 4 && !empty($audienceFilters)) {
                $this->syncAudienceProfessional($offer, $audienceFilters);
            }

            return $offer->load('skills');
        });
    }

    /**
     * Actualiza una oferta, sincroniza la audiencia de la publicación y el filtro profesional.
     *
     * @param Offer        $offer
     * @param array        $data
     * @param object|null  $bannerFile
     * @param array|null   $audienceFilters ['id_professional_area' => int, 'career' => string|null]
     */
    public function update(
        Offer $offer,
        array $data,
        ?object $bannerFile = null,
        ?array $audienceFilters = null
    ): Offer {
        if ($bannerFile) {
            $data['banner_url'] = CloudinaryUploader::upload($bannerFile, 'offers');
        }

        $offer->update(array_filter([
            'title'            => $data['title']          ?? $offer->title,
            'description'      => $data['description']    ?? $offer->description,
            'type'             => $data['type']           ?? $offer->type,
            'modalidad'        => $data['modalidad']      ?? $offer->modalidad,
            'ubicacion'        => $data['ubicacion']      ?? $offer->ubicacion,
            'salary_min'       => $data['salary_min']     ?? $offer->salary_min,
            'salary_max'       => $data['salary_max']     ?? $offer->salary_max,
            'currency'         => $data['currency']       ?? $offer->currency,
            'nivel'            => $data['nivel']          ?? $offer->nivel,
            'area'             => $data['area']           ?? $offer->area,
            'show_salary'      => $data['show_salary']    ?? $offer->show_salary,
            'quota_quantity'   => $data['quota_quantity'] ?? $offer->quota_quantity,
            'closed_at'        => $data['closed_at']      ?? $offer->closed_at,
            'banner_url'       => $data['banner_url']     ?? $offer->banner_url,
            'state'            => $data['state']          ?? $offer->state,
            'id_audience_type' => $data['id_audience_type'] ?? $offer->id_audience_type,
        ], fn($v) => $v !== null));

        if (isset($data['skills'])) {
            $this->syncSkills($offer, $data['skills']);
        }

        // ── Sincronizar id_audience_type en la PUBLICATION relacionada ───
        $newAudienceType = $offer->fresh()->id_audience_type;

        DB::table('PUBLICATION')
            ->whereExists(function ($q) use ($offer) {
                $q->from('PUBLICATION_DETAIL')
                  ->whereColumn('PUBLICATION_DETAIL.id_publication', 'PUBLICATION.id_publication')
                  ->where('PUBLICATION_DETAIL.id_offer', $offer->id_offer);
            })
            ->update([
                'id_audience_type' => $newAudienceType,
                'updated_at'       => now(),
            ]);

        // ── Sincronizar filtro de audiencia profesional ──────────────────
        if ((int) $newAudienceType === 4 && !empty($audienceFilters)) {
            $this->syncAudienceProfessional($offer, $audienceFilters);
        } elseif ((int) $newAudienceType !== 4) {
            // Si ya no es tipo profesional, limpiar registros anteriores
            OfferAudienceProfessional::where('id_offer', $offer->id_offer)->delete();
        }

        return $offer->fresh('skills');
    }

    /**
     * Soft-delete: marca la oferta como "removed".
     */
    public function destroy(Offer $offer): void
    {
        $offer->update(['state' => 'removed']);
    }

    /**
     * Cierra automáticamente las ofertas cuya fecha límite ya pasó.
     */
    public function closeExpiredOffers(): void
    {
        Offer::whereIn('state', ['open', 'visible'])
            ->whereNotNull('closed_at')
            ->whereDate('closed_at', '<', today())
            ->update(['state' => 'closed']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Métodos privados
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Sincroniza las skills de una oferta (elimina las anteriores y crea las nuevas).
     */
    private function syncSkills(Offer $offer, array $skillNames): void
    {
        OfferDetail::where('id_offer', $offer->id_offer)->delete();

        foreach ($skillNames as $name) {
            $skill = Skill::firstOrCreate(
                ['name' => trim($name)],
                ['state' => 'activate', 'type' => 'hard']
            );

            OfferDetail::create([
                'id_offer' => $offer->id_offer,
                'id_skill' => $skill->id_skill,
            ]);
        }
    }

    /**
     * Guarda (o actualiza) el filtro profesional de una oferta.
     *
     * Los filtros vienen como:
     *   [
     *     'id_professional_area'  => int,       // requerido cuando audiencia = 4
     *     'career'                => string|null // nombre de la carrera (opcional)
     *   ]
     *
     * Como el frontend envía el nombre de la carrera (no el ID), se busca el
     * id_professional_career correspondiente en PROFESSIONAL_CAREER por nombre.
     */
    private function syncAudienceProfessional(Offer $offer, array $filters): void
{
    $idArea = $filters['id_professional_area'] ?? null;

    if (!$idArea) {
        return;
    }

    // Buscar el id de la carrera por nombre dentro del área indicada
    $idCareer = null;
    if (!empty($filters['career'])) {
        $career = DB::table('PROFESSIONAL_CAREER')
            ->where('id_professional_area', $idArea)
            ->whereRaw('LOWER(name) = LOWER(?)', [trim($filters['career'])])
            ->first();

        $idCareer = $career?->id_professional_career ?? null;
    }

    // Reemplazar el registro en OFFER_AUDIENCE_PROFESSIONAL
    OfferAudienceProfessional::where('id_offer', $offer->id_offer)->delete();
    OfferAudienceProfessional::create([
        'id_offer'               => $offer->id_offer,
        'id_professional_area'   => $idArea,
        'id_professional_career' => $idCareer,
    ]);

    // ── Sincronizar también en PUBLICATION_AUDIENCE_PROFESSIONAL ────────
    // Obtener el id_publication vinculado a esta oferta
    $publicationId = DB::table('PUBLICATION_DETAIL')
        ->where('id_offer', $offer->id_offer)
        ->value('id_publication');

    if ($publicationId) {
        DB::table('PUBLICATION_AUDIENCE_PROFESSIONAL')
            ->where('id_publication', $publicationId)
            ->delete();

        DB::table('PUBLICATION_AUDIENCE_PROFESSIONAL')->insert([
            'id_publication'         => $publicationId,
            'id_professional_area'   => $idArea,
            'id_professional_career' => $idCareer,
            'created_at'             => now(),
        ]);
    }
}
}
