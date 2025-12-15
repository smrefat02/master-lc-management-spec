<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VerifyDocumentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'verification_status' => 'required|in:approved,rejected',
            'discrepancies' => 'nullable|array',
            'discrepancies.*' => 'string|max:500',
            'verifier_remarks' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'verification_status.required' => 'Verification status is required.',
            'verification_status.in' => 'Verification status must be either approved or rejected.',
        ];
    }
}
