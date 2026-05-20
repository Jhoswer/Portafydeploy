<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre'   => ['required', 'string', 'max:255'],
            'apellido' => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:USER,email'],
            'numero'   => ['nullable', 'integer'],
            'pais'     => ['required', 'string', 'max:255'],
            'ciudad'   => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required'      => 'El nombre es obligatorio.',
            'apellido.required'    => 'El apellido es obligatorio.',
            'email.required'       => 'El correo es obligatorio.',
            'email.email'          => 'El correo no tiene un formato valido.',
            'email.unique'         => 'El correo ya esta registrado.',
            'numero.integer'       => 'El numero debe ser entero.',
            'pais.required'        => 'El pais es obligatorio.',
            'ciudad.required'      => 'La ciudad es obligatoria.',
            'password.required'    => 'La contrasena es obligatoria.',
            'password.min'         => 'La contrasena debe tener al menos 8 caracteres.',
            'password.confirmed'   => 'Las contrasenas no coinciden.',
        ];
    }
}
