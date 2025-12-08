<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContractRequest extends FormRequest
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
            // Contract number: required, regex format check
            // Note: No unique check since we're updating the same record
            'contract_no' => [
                'required',
                'string',
                'max:50',
                'regex:/^IIC\/AKCL\/CON\/\d{4}\/\d{2}$/',
            ],
            
            // Buyer reference
            'buyer_id' => [
                'required',
                'integer',
                'exists:buyers,id',
            ],
            
            // Contract dates
            'contract_date' => [
                'required',
                'date',
            ],
            
            'amendment_date' => [
                'required',
                'date',
                'after_or_equal:contract_date',
            ],
            
            // Order details
            'total_orders' => [
                'required',
                'integer',
                'min:0',
            ],
            
            'order_quantity' => [
                'required',
                'integer',
                'min:0',
            ],
            
            // Financial fields
            'value_usd' => [
                'required',
                'numeric',
                'min:0',
                'regex:/^\d+(\.\d{1,2})?$/', // Max 2 decimal places
            ],
            
            'b2b_percent' => [
                'required',
                'numeric',
                'min:0',
                'max:100',
                'regex:/^\d+(\.\d{1,2})?$/', // Max 2 decimal places
            ],
            
            // Status field
            'status' => [
                'required',
                'string',
                'in:draft,active,approved,pending,completed,cancelled',
            ],
            
            // Optional remarks
            'remarks' => [
                'nullable',
                'string',
            ],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'contract_no.required' => 'Contract number is required.',
            'contract_no.regex' => 'Contract number must match format: IIC/AKCL/CON/YYYY/NN',
            'buyer_id.required' => 'Buyer is required.',
            'buyer_id.exists' => 'Selected buyer does not exist.',
            'contract_date.required' => 'Contract date is required.',
            'amendment_date.required' => 'Amendment date is required.',
            'amendment_date.after_or_equal' => 'Amendment date must be on or after contract date.',
            'total_orders.required' => 'Total orders is required.',
            'total_orders.min' => 'Total orders must be at least 0.',
            'order_quantity.required' => 'Order quantity is required.',
            'order_quantity.min' => 'Order quantity must be at least 0.',
            'value_usd.required' => 'Value (USD) is required.',
            'value_usd.min' => 'Value (USD) must be at least 0.',
            'value_usd.regex' => 'Value (USD) must have at most 2 decimal places.',
            'b2b_percent.required' => 'B2B percentage is required.',
            'b2b_percent.min' => 'B2B percentage must be at least 0.',
            'b2b_percent.max' => 'B2B percentage cannot exceed 100.',
            'b2b_percent.regex' => 'B2B percentage must have at most 2 decimal places.',
            'status.required' => 'Status is required.',
            'status.in' => 'Status must be one of: draft, active, pending, completed, cancelled.',
        ];
    }
}
