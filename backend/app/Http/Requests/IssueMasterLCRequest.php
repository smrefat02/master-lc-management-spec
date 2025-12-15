<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IssueMasterLCRequest extends FormRequest
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
        return [
            'issuing_bank_id' => [
                'required',
                'exists:banks,id',
            ],
            'issuing_bank_reference_no' => [
                'required',
                'string',
                'max:100',
            ],
            'issuing_bank_issue_date' => [
                'required',
                'date',
                'after_or_equal:' . $this->route('masterLc')->issue_date->format('Y-m-d'),
                'before_or_equal:today',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'issuing_bank_id.required' => 'The issuing bank is required.',
            'issuing_bank_id.exists' => 'The selected issuing bank does not exist.',
            'issuing_bank_reference_no.required' => 'The bank reference number is required.',
            'issuing_bank_reference_no.max' => 'The bank reference number must not exceed 100 characters.',
            'issuing_bank_issue_date.required' => 'The bank issue date is required.',
            'issuing_bank_issue_date.after_or_equal' => 'The bank issue date must be on or after the LC issue date.',
            'issuing_bank_issue_date.before_or_equal' => 'The bank issue date cannot be in the future.',
        ];
    }
}
