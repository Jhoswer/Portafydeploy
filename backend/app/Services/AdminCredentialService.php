<?php

namespace App\Services;

use App\Http\Requests\AdminCredentialUpdateRequest;
use App\Models\Credential;
use App\Models\Profile;
use Illuminate\Support\Facades\Hash;

class AdminCredentialService
{
    public function show(Profile $profile): array
    {
        return $this->format($profile->credential()->first());
    }

    public function update(AdminCredentialUpdateRequest $request, Profile $profile): array
    {
        $credential = $profile->credential()->firstOrNew([
            'id_profile' => $profile->getKey(),
        ]);

        if ($request->filled('password')) {
            $credential->old_password = $credential->exists ? $credential->password : null;
            $credential->password = Hash::make($request->input('password'));
        }

        if ($request->has('keyword')) {
            $credential->keyword = $request->input('keyword');
        }

        $credential->save();

        return $this->format($credential->refresh());
    }

    private function format(?Credential $credential): array
    {
        return [
            'has_password' => filled($credential?->password),
            'password_hash' => $credential?->password,
            'old_password_hash' => $credential?->old_password,
            'keyword' => $credential?->keyword ?? '',
        ];
    }
}
