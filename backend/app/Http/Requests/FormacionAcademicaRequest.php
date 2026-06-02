<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FormacionAcademicaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $current = filter_var(
            $this->input('actualmente', $this->input('is_current', $this->input('isCurrent'))),
            FILTER_VALIDATE_BOOLEAN
        );

        $this->merge([
            'nivel_formacion' => $this->normalizeText($this->input('nivel_formacion', $this->input('tipo_formacion', $this->input('type')))),
            'institucion' => $this->normalizeText($this->input('institucion', $this->input('institution'))),
            'nombre_programa' => $this->normalizeText($this->input('nombre_programa', $this->input('nombre_carrera', $this->input('careerName')))),
            'fecha_inicio' => $this->input('fecha_inicio', $this->input('startDate')),
            'fecha_fin' => $current ? null : $this->input('fecha_fin', $this->input('endDate')),
            'actualmente' => $current,
            'remove_support_document' => filter_var(
                $this->input('remove_support_document', $this->input('removeSupportDocument', false)),
                FILTER_VALIDATE_BOOLEAN
            ),
        ]);

        if ($this->hasFile('respaldo')) {
            $this->files->set('support_document', $this->file('respaldo'));
        } elseif ($this->hasFile('support')) {
            $this->files->set('support_document', $this->file('support'));
        } elseif ($this->hasFile('supportDocument')) {
            $this->files->set('support_document', $this->file('supportDocument'));
        }
    }

    public function rules(): array
    {
        return [
            'nivel_formacion' => ['nullable', 'in:tecnico,tecnologo,licenciatura,ingenieria,maestria,doctorado,curso,diplomado,otro'],
            'institucion' => ['required', 'string', 'min:2', 'max:120', 'regex:/^[\pL\pN\s.,&()\'-]+$/u'],
            'nombre_programa' => ['required', 'string', 'min:2', 'max:140', 'regex:/^[\pL\pN\s.,:&()\/\'-]+$/u'],
            'fecha_inicio' => ['nullable', 'date'],
            'fecha_fin' => ['nullable', 'date', 'after_or_equal:fecha_inicio'],
            'actualmente' => ['nullable', 'boolean'],
            'remove_support_document' => ['nullable', 'boolean'],
            'support_document' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:6144'],
        ];
    }

    public function messages(): array
    {
        return [
            'institucion.regex' => 'La institucion contiene caracteres no validos.',
            'nombre_programa.regex' => 'El programa contiene caracteres no validos.',
            'fecha_fin.after_or_equal' => 'La fecha de fin no puede ser anterior a la fecha de inicio.',
            'support_document.file' => 'El respaldo debe ser un archivo valido.',
            'support_document.mimes' => 'El respaldo debe ser PDF o imagen JPG, PNG o WEBP.',
            'support_document.max' => 'El respaldo no debe superar 6 MB.',
        ];
    }

    public function persistenceData(): array
    {
        return $this->validated();
    }

    private function normalizeText(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        return preg_replace('/\s+/', ' ', trim($value));
    }
}
