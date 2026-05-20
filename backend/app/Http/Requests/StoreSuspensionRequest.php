<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSuspensionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'motivo' => $this->normalizeText($this->input('motivo')),
            'tipo' => $this->normalizeText($this->input('tipo')),
            'fecha_fin' => $this->normalizeText($this->input('fecha_fin')),
        ]);
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'integer', 'exists:USER,id_user'],
            'tipo' => ['required', 'string', 'in:temporal,permanente'],
            'motivo' => ['required', 'string', 'max:2000'],
            'fecha_fin' => ['nullable', 'date', 'required_if:tipo,temporal', 'after:today'],
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'Debes seleccionar un usuario.',
            'user_id.exists' => 'El usuario seleccionado no existe.',
            'tipo.required' => 'El tipo de suspension es obligatorio.',
            'tipo.in' => 'El tipo de suspension debe ser temporal o permanente.',
            'motivo.required' => 'El motivo es obligatorio.',
            'fecha_fin.required_if' => 'La fecha de fin es obligatoria para suspensiones temporales.',
            'fecha_fin.after' => 'La fecha de fin debe ser posterior a hoy.',
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
