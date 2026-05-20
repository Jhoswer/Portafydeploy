<?php

namespace App\Http\Controllers;

use App\Models\ProfileVerificationRequest;
use App\Services\ProfileVerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileVerificationController extends Controller
{
    public function __construct(private readonly ProfileVerificationService $verificationService) {}

    public function status(Request $request): JsonResponse
    {
        return response()->json($this->verificationService->status($request->user()));
    }

    public function submit(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'document_front' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
                'document_back' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
                'document_pdf' => ['nullable', 'file', 'mimes:pdf', 'max:6144'],
            ]);

            return response()->json($this->verificationService->submit($request->user(), [
                ...$validated,
                'document_front' => $request->file('document_front'),
                'document_back' => $request->file('document_back'),
                'document_pdf' => $request->file('document_pdf'),
            ]), 201);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function adminIndex(Request $request): JsonResponse
    {
        return response()->json($this->verificationService->list([
            'status' => (string) $request->query('status', 'pending'),
        ]));
    }

    public function approve(Request $request, ProfileVerificationRequest $verification): JsonResponse
    {
        try {
            return response()->json($this->verificationService->review($verification, $request->user(), 'approved'));
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function reject(Request $request, ProfileVerificationRequest $verification): JsonResponse
    {
        try {
            $validated = $request->validate([
                'reason' => ['required', 'string', 'min:5', 'max:500'],
            ]);

            return response()->json($this->verificationService->review(
                $verification,
                $request->user(),
                'rejected',
                $validated['reason']
            ));
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
