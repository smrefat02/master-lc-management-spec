<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdviseLCRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'advising_bank_id' => 'required|exists:banks,id',
            'advising_bank_verification_status' => 'required|in:verified,rejected',
            'advisor_remarks' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'advising_bank_id.required' => 'Advising bank is required.',
            'advising_bank_id.exists' => 'Selected advising bank does not exist.',
            'advising_bank_verification_status.required' => 'Verification status is required.',
            'advising_bank_verification_status.in' => 'Verification status must be either verified or rejected.',
        ];
    }
}
