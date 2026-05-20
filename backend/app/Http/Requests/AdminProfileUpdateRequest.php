<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdminProfileUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => $this->normalizeText($this->input('name')),
            'last_name' => $this->normalizeText($this->input('last_name')),
            'biography' => $this->normalizeText($this->input('biography')),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'biography' => ['nullable', 'string', 'max:255'],
            'birthdate' => ['nullable', 'date'],
            'completed_profile' => ['nullable', 'boolean'],
            'profile_photo' => ['nullable', 'image', 'max:2048'],
            'cover_photo' => ['nullable', 'image', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre es obligatorio.',
            'last_name.required' => 'El apellido es obligatorio.',
            'profile_photo.image' => 'La foto de perfil debe ser una imagen valida.',
            'profile_photo.max' => 'La foto de perfil supera el limite actual de 2 MB del servidor.',
            'cover_photo.image' => 'La foto de portada debe ser una imagen valida.',
            'cover_photo.max' => 'La foto de portada supera el limite actual de 2 MB del servidor.',
        ];
    }

    private function normalizeText(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        return preg_replace('/\s+/', ' ', trim($value));
    }
}
