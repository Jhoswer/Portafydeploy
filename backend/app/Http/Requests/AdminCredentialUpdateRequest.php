<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdminCredentialUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'password' => is_string($this->input('password')) ? trim($this->input('password')) : $this->input('password'),
            'keyword' => is_string($this->input('keyword')) ? trim($this->input('keyword')) : $this->input('keyword'),
        ]);
    }

    public function rules(): array
    {
        return [
            'password' => ['nullable', 'string', 'min:8', 'max:255'],
            'keyword' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'password.min' => 'La nueva contrasena debe tener al menos 8 caracteres.',
            'keyword.max' => 'La palabra clave no debe superar 255 caracteres.',
        ];
    }
}
