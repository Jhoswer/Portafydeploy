<?php

namespace App\Http\Controllers;

use App\Models\FormacionAcademica;
use App\Support\AdminDocumentResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdminEducationVerificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $status = (string) $request->query('status', 'pending');
        $query = FormacionAcademica::query()
            ->with(['university', 'career', 'profile.userRole.user'])
            ->whereNotNull('support_document_url')
            ->orderByDesc('updated_at')
            ->orderByDesc('id_university_career');

        if (in_array($status, ['pending', 'approved', 'rejected'], true)) {
            $query->where('support_status', $status);
        }

        return response()->json([
            'items' => $query->limit(100)->get()->map(fn (FormacionAcademica $formacion) => $this->map($formacion))->values(),
        ]);
    }

    public function approve(Request $request, FormacionAcademica $formacion): JsonResponse
    {
        return response()->json($this->review($formacion, 'approved'));
    }

    public function reject(Request $request, FormacionAcademica $formacion): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        return response()->json($this->review($formacion, 'rejected', $validated['reason']));
    }

    public function document(FormacionAcademica $formacion)
    {
        abort_unless((bool) $formacion->support_document_url, 404, 'Documento no encontrado.');

        return AdminDocumentResponse::inline(
            $formacion->support_document_url,
            'respaldo-formacion-' . $formacion->getKey() . '.' . $this->extension($formacion->support_document_url),
            $this->mime($formacion->support_document_url)
        );
    }

    private function review(FormacionAcademica $formacion, string $status, ?string $reason = null): array
    {
        if (! in_array($status, ['approved', 'rejected'], true)) {
            abort(422, 'Estado de revision no valido.');
        }

        if (! $formacion->support_document_url) {
            abort(422, 'La formacion no tiene respaldo adjunto.');
        }

        if ($formacion->support_status !== 'pending') {
            abort(422, 'Esta solicitud ya fue revisada.');
        }

        $formacion->update([
            'support_status' => $status,
            'support_reviewed_at' => now(),
            'support_rejection_reason' => $status === 'rejected' ? mb_substr(trim((string) $reason), 0, 500) : null,
        ]);

        $this->forgetProfileCache($formacion);

        return [
            'message' => $status === 'approved'
                ? 'Respaldo de formacion aprobado.'
                : 'Respaldo de formacion rechazado.',
            'verification' => $this->map($formacion->fresh(['university', 'career', 'profile.userRole.user'])),
        ];
    }

    private function map(FormacionAcademica $formacion): array
    {
        $profile = $formacion->profile;
        $user = $profile?->userRole?->user;

        return [
            'id' => (int) $formacion->getKey(),
            'kind' => 'education',
            'status' => (string) ($formacion->support_status ?: 'pending'),
            'submitted_at' => $formacion->updated_at?->toISOString(),
            'reviewed_at' => $formacion->support_reviewed_at?->toISOString(),
            'rejection_reason' => (string) ($formacion->support_rejection_reason ?? ''),
            'profile' => [
                'id' => (int) $profile?->getKey(),
                'user_id' => $user?->getKey(),
                'name' => trim(collect([$profile?->name, $profile?->last_name])->filter()->implode(' ')),
            ],
            'education' => [
                'program' => $formacion->nombre_programa,
                'institution' => $formacion->institucion,
                'level' => $formacion->nivel_formacion,
            ],
            'documents' => [
                'support' => $formacion->support_document_url,
                'support_preview' => url('/api/admin/education-verifications/' . $formacion->getKey() . '/document'),
            ],
        ];
    }

    private function forgetProfileCache(FormacionAcademica $formacion): void
    {
        $userId = (int) ($formacion->profile?->userRole?->user?->getKey() ?? 0);

        if (! $userId) {
            return;
        }

        Cache::forget("profile.{$userId}.show");
        Cache::forget("profile.{$userId}.overview");
    }

    private function extension(string $source): string
    {
        $extension = strtolower(pathinfo(parse_url($source, PHP_URL_PATH) ?: $source, PATHINFO_EXTENSION));

        return in_array($extension, ['pdf', 'jpg', 'jpeg', 'png', 'webp'], true) ? $extension : 'pdf';
    }

    private function mime(string $source): string
    {
        return match ($this->extension($source)) {
            'jpg', 'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'webp' => 'image/webp',
            default => 'application/pdf',
        };
    }
}
