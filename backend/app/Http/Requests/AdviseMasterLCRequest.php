<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdviseMasterLCRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'advising_bank_id' => [
                'required',
                'exists:banks,id',
            ],
            'advising_bank_confirmation_status' => [
                'required',
                'in:pending,verified,rejected',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'advising_bank_id.required' => 'The advising bank is required.',
            'advising_bank_id.exists' => 'The selected advising bank does not exist.',
            'advising_bank_confirmation_status.required' => 'The confirmation status is required.',
            'advising_bank_confirmation_status.in' => 'The confirmation status must be pending, verified, or rejected.',
        ];
    }
}
