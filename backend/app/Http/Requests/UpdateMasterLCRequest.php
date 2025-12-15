<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMasterLCRequest extends FormRequest
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
        $id = $this->route('id');

        return [
            // Basic Information
            'contract_id' => 'nullable|exists:contracts,id',
            'order_id' => 'nullable|exists:orders,id',
            'lc_number' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('master_lcs', 'lc_number')->ignore($id),
            ],
            'lc_number_mode' => 'sometimes|in:auto,manual',
            'issue_date' => 'sometimes|required|date|before_or_equal:today',
            'expiry_date' => 'sometimes|required|date|after:issue_date',

            // Financial
            'amount' => 'sometimes|required|numeric|min:0.01',
            'currency' => 'sometimes|required|in:USD,EUR,GBP',
            'exchange_rate' => 'nullable|numeric|min:0',
            'converted_amount' => 'nullable|numeric|min:0',

            // Buyer Information (JSON)
            'buyer_info' => 'sometimes|required|array',
            'buyer_info.name' => 'sometimes|required|string|max:255',
            'buyer_info.address' => 'sometimes|required|string|max:500',
            'buyer_info.country' => 'sometimes|required|string|max:100',
            'buyer_info.contact_person' => 'nullable|string|max:255',

            // Beneficiary Information (JSON)
            'beneficiary_info' => 'sometimes|required|array',
            'beneficiary_info.bank_id' => 'sometimes|required|integer',
            'beneficiary_info.bank_name' => 'sometimes|required|string|max:255',

            // Bank Information (JSON)
            'bank_info' => 'sometimes|required|array',
            'bank_info.account_number' => 'sometimes|required|string|max:50',
            'bank_info.swift_code' => 'sometimes|required|string|max:20',
            'bank_info.branch' => 'nullable|string|max:255',

            // Documents
            'required_documents' => 'nullable|array',
            'required_documents.*' => 'string|max:255',

            // Terms
            'terms_and_conditions' => 'nullable|string|max:5000',
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
            'lc_number.unique' => 'This LC Number already exists.',
            'issue_date.before_or_equal' => 'Issue date cannot be in the future.',
            'expiry_date.after' => 'Expiry date must be after issue date.',
            'amount.min' => 'Amount must be greater than 0.',
            'currency.in' => 'Currency must be USD, EUR, or GBP.',
            'buyer_info.name.required' => 'Buyer name is required.',
            'buyer_info.address.required' => 'Buyer address is required.',
            'buyer_info.country.required' => 'Buyer country is required.',
            'bank_info.account_number.required' => 'Bank account number is required.',
            'bank_info.swift_code.required' => 'SWIFT code is required.',
        ];
    }
}
