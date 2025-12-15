<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSupplierRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $supplierId = $this->route('supplier')->id;

        return [
            'name' => 'required|string|min:2|max:255',
            'code' => 'required|string|max:50|regex:/^SUP\d{4}$/|unique:suppliers,code,' . $supplierId,
            'contact_person' => 'nullable|string|max:255',
            'email' => 'nullable|email:rfc,dns|max:255|unique:suppliers,email,' . $supplierId,
            'phone' => 'nullable|string|max:50',
            'country' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'The supplier name is required.',
            'name.min' => 'The supplier name must be at least 2 characters.',
            'name.max' => 'The supplier name cannot exceed 255 characters.',
            'code.required' => 'The supplier code is required.',
            'code.regex' => 'The code format is invalid. Must be SUP followed by 4 digits (e.g., SUP0001).',
            'code.unique' => 'The code has already been taken.',
            'email.email' => 'The email must be a valid email address.',
            'email.unique' => 'The email has already been taken.',
            'status.required' => 'The status is required.',
            'status.in' => 'The status must be either active or inactive.',
        ];
    }
}
