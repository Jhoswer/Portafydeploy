<?php

namespace App\Services;

use App\Models\ProfileVerificationRequest;
use App\Models\Usuario;
use App\Support\OfficialSchema;
use Illuminate\Http\UploadedFile;
use RuntimeException;

class ProfileVerificationService
{
    public function __construct(private readonly CloudinaryService $cloudinaryService) {}

    public function status(Usuario $usuario): array
    {
        $profile = OfficialSchema::ensureProfile($usuario);
        $request = ProfileVerificationRequest::query()
            ->where('id_profile', $profile->getKey())
            ->orderByDesc('id_verification_request')
            ->first();

        return $this->mapRequest($request);
    }

    public function submit(Usuario $usuario, array $payload): array
    {
        $profile = OfficialSchema::ensureProfile($usuario);

        $openRequest = ProfileVerificationRequest::query()
            ->where('id_profile', $profile->getKey())
            ->where('status', 'pending')
            ->exists();

        if ($openRequest) {
            throw new RuntimeException('Ya tienes una solicitud de verificacion pendiente.');
        }

        $front = $payload['document_front'] ?? null;
        $back = $payload['document_back'] ?? null;
        $pdf = $payload['document_pdf'] ?? null;

        if (! $pdf && (! $front || ! $back)) {
            throw new RuntimeException('Adjunta un PDF o ambas imagenes del documento.');
        }

        $request = ProfileVerificationRequest::create([
            'id_profile' => $profile->getKey(),
            'status' => 'pending',
            'document_front_url' => $front instanceof UploadedFile
                ? $this->cloudinaryService->uploadFile($front, 'portafolio/verificaciones', 'image')
                : null,
            'document_back_url' => $back instanceof UploadedFile
                ? $this->cloudinaryService->uploadFile($back, 'portafolio/verificaciones', 'image')
                : null,
            'document_pdf_url' => $pdf instanceof UploadedFile
                ? $this->cloudinaryService->uploadFile($pdf, 'portafolio/verificaciones', 'raw')
                : null,
            'submitted_at' => now(),
        ]);

        return [
            'message' => 'Solicitud de verificacion enviada.',
            'verification' => $this->mapRequest($request),
        ];
    }

    public function list(array $filters = []): array
    {
        $status = (string) ($filters['status'] ?? 'pending');
        $query = ProfileVerificationRequest::query()
            ->with(['profile.userRole.user'])
            ->orderByDesc('submitted_at')
            ->orderByDesc('id_verification_request');

        if (in_array($status, ['pending', 'approved', 'rejected'], true)) {
            $query->where('status', $status);
        }

        return [
            'items' => $query->limit(100)->get()->map(fn (ProfileVerificationRequest $request) => [
                ...$this->mapRequest($request),
                'profile' => [
                    'id' => (int) $request->profile?->getKey(),
                    'user_id' => $request->profile?->userRole?->user?->getKey(),
                    'name' => trim(collect([$request->profile?->name, $request->profile?->last_name])->filter()->implode(' ')),
                ],
                'documents' => [
                    'front' => $request->document_front_url,
                    'back' => $request->document_back_url,
                    'pdf' => $request->document_pdf_url,
                ],
            ])->values(),
        ];
    }

    public function review(ProfileVerificationRequest $request, Usuario $admin, string $status, ?string $reason = null): array
    {
        if (! in_array($status, ['approved', 'rejected'], true)) {
            throw new RuntimeException('Estado de revision no valido.');
        }

        if ($request->status !== 'pending') {
            throw new RuntimeException('Esta solicitud ya fue revisada.');
        }

        if ($status === 'rejected' && trim((string) $reason) === '') {
            throw new RuntimeException('Indica el motivo del rechazo.');
        }

        $adminProfile = OfficialSchema::ensureProfile($admin);
        $request->update([
            'status' => $status,
            'rejection_reason' => $status === 'rejected' ? mb_substr(trim((string) $reason), 0, 500) : null,
            'reviewed_at' => now(),
            'reviewed_by_profile' => $adminProfile->getKey(),
        ]);

        return [
            'message' => $status === 'approved'
                ? 'Solicitud de verificacion aprobada.'
                : 'Solicitud de verificacion rechazada.',
            'verification' => $this->mapRequest($request->fresh()),
        ];
    }

    private function mapRequest(?ProfileVerificationRequest $request): array
    {
        if (! $request) {
            return [
                'status' => 'none',
                'submitted_at' => null,
                'reviewed_at' => null,
                'rejection_reason' => '',
                'is_verified' => false,
            ];
        }

        return [
            'id' => (int) $request->getKey(),
            'status' => (string) $request->status,
            'submitted_at' => $request->submitted_at?->toISOString(),
            'reviewed_at' => $request->reviewed_at?->toISOString(),
            'rejection_reason' => (string) ($request->rejection_reason ?? ''),
            'is_verified' => $request->status === 'approved',
        ];
    }
}
