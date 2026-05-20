<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserPermissionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*.id_permission' => ['required', 'integer', 'exists:PERMISSION,id_permission'],
            'permissions.*.active' => ['required', 'boolean'],
            'permissions.*.deadline' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'permissions.required' => 'Debes enviar los permisos a actualizar.',
            'permissions.array' => 'La lista de permisos no tiene un formato valido.',
            'permissions.min' => 'Debes enviar al menos un permiso.',
            'permissions.*.id_permission.required' => 'Cada permiso debe incluir su identificador.',
            'permissions.*.id_permission.exists' => 'Uno de los permisos no existe.',
            'permissions.*.active.required' => 'Cada permiso debe incluir su estado.',
            'permissions.*.active.boolean' => 'El estado del permiso debe ser verdadero o falso.',
            'permissions.*.deadline.date' => 'La fecha limite debe tener un formato valido.',
        ];
    }
}
