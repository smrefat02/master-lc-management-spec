<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMasterLCRequest extends FormRequest
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
            // Basic Information
            'contract_id' => 'nullable|exists:contracts,id',
            'order_id' => 'nullable|exists:orders,id',
            'lc_number' => 'required|string|unique:master_lcs,lc_number|max:50',
            'lc_number_mode' => 'required|in:auto,manual',
            'issue_date' => 'required|date|before_or_equal:today',
            'expiry_date' => 'required|date|after:issue_date',

            // Financial
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|in:USD,EUR,GBP',
            'exchange_rate' => 'nullable|numeric|min:0',
            'converted_amount' => 'nullable|numeric|min:0',

            // Buyer Information (JSON)
            'buyer_info' => 'required|array',
            'buyer_info.name' => 'required|string|max:255',
            'buyer_info.address' => 'required|string|max:500',
            'buyer_info.country' => 'required|string|max:100',
            'buyer_info.contact_person' => 'nullable|string|max:255',

            // Beneficiary Information (JSON)
            'beneficiary_info' => 'required|array',
            'beneficiary_info.bank_id' => 'required|integer',
            'beneficiary_info.bank_name' => 'required|string|max:255',

            // Bank Information (JSON)
            'bank_info' => 'required|array',
            'bank_info.account_number' => 'required|string|max:50',
            'bank_info.swift_code' => 'required|string|max:20',
            'bank_info.branch' => 'nullable|string|max:255',

            // Documents
            'required_documents' => 'nullable|array',
            'required_documents.*' => 'string|max:255',

            // Terms
            'terms_and_conditions' => 'nullable|string|max:5000',

            // Status
            'status' => 'nullable|in:draft,submitted,reviewed,approved,active,expired,cancelled',
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
            'contract_id.exists' => 'The selected contract does not exist.',
            'order_id.exists' => 'The selected order does not exist.',
            'lc_number.required' => 'LC Number is required.',
            'lc_number.unique' => 'This LC Number already exists.',
            'lc_number.max' => 'LC Number cannot exceed 50 characters.',
            'lc_number_mode.required' => 'LC Number mode is required.',
            'lc_number_mode.in' => 'LC Number mode must be auto or manual.',
            'issue_date.required' => 'Issue date is required.',
            'issue_date.before_or_equal' => 'Issue date cannot be in the future.',
            'expiry_date.required' => 'Expiry date is required.',
            'expiry_date.after' => 'Expiry date must be after issue date.',
            'amount.required' => 'Amount is required.',
            'amount.min' => 'Amount must be greater than 0.',
            'currency.required' => 'Currency is required.',
            'currency.in' => 'Currency must be USD, EUR, or GBP.',
            'buyer_info.required' => 'Buyer information is required.',
            'buyer_info.name.required' => 'Buyer name is required.',
            'buyer_info.address.required' => 'Buyer address is required.',
            'buyer_info.country.required' => 'Buyer country is required.',
            'beneficiary_info.required' => 'Beneficiary information is required.',
            'beneficiary_info.bank_id.required' => 'Beneficiary bank is required.',
            'beneficiary_info.bank_name.required' => 'Beneficiary bank name is required.',
            'bank_info.required' => 'Bank information is required.',
            'bank_info.account_number.required' => 'Bank account number is required.',
            'bank_info.swift_code.required' => 'SWIFT code is required.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Ensure at least one of contract_id or order_id is provided
        if (!$this->contract_id && !$this->order_id) {
            // Will be caught by custom validation
        }
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // At least one of contract_id or order_id should be provided
            if (!$this->contract_id && !$this->order_id) {
                $validator->errors()->add('contract_id', 'Either contract or order must be selected.');
            }
        });
    }
}
