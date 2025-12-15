<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IssueLCRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'issuing_bank_id' => 'required|exists:banks,id',
            'issuing_bank_reference_no' => 'required|string|max:100',
            'issuing_bank_issue_date' => 'required|date',
            'advising_bank_id' => 'nullable|exists:banks,id',
            'issuer_remarks' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'issuing_bank_id.required' => 'Issuing bank is required.',
            'issuing_bank_id.exists' => 'Selected issuing bank does not exist.',
            'issuing_bank_reference_no.required' => 'Bank reference number is required.',
            'issuing_bank_issue_date.required' => 'Issue date is required.',
            'advising_bank_id.exists' => 'Selected advising bank does not exist.',
        ];
    }
}
