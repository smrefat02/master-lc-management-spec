<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RejectLCRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rejection_reason' => 'required|string|min:10|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'rejection_reason.required' => 'Rejection reason is required.',
            'rejection_reason.min' => 'Rejection reason must be at least 10 characters.',
            'rejection_reason.max' => 'Rejection reason must not exceed 1000 characters.',
        ];
    }
}
