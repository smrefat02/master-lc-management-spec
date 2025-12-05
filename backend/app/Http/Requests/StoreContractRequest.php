<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContractRequest extends FormRequest
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
            // Contract number: IIC/AKCL/CON/YYYY/NN format
            'contract_no' => [
                'required',
                'string',
                'regex:/^IIC\/AKCL\/CON\/\d{4}\/\d{2}$/',
                'unique:contracts,contract_no',
            ],
            
            // Buyer (foreign key)
            'buyer_id' => [
                'required',
                'integer',
                'exists:buyers,id',
            ],
            
            // Contract date
            'contract_date' => [
                'required',
                'date',
            ],
            
            // Amendment date (optional, must be >= contract_date)
            'amendment_date' => [
                'nullable',
                'date',
                'after_or_equal:contract_date',
            ],
            
            // Total orders
            'total_orders' => [
                'required',
                'integer',
                'min:0',
            ],
            
            // Order quantity
            'order_quantity' => [
                'required',
                'integer',
                'min:0',
            ],
            
            // Total contract value (USD)
            'value_usd' => [
                'required',
                'numeric',
                'min:0',
            ],
            
            // B2B percentage (0-100)
            'b2b_percent' => [
                'required',
                'numeric',
                'min:0',
                'max:100',
            ],
            
            // Status
            'status' => [
                'required',
                'string',
                'in:draft,active,pending,completed,cancelled',
            ],
            
            // Remarks (optional)
            'remarks' => [
                'nullable',
                'string',
                'max:1000',
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
            'contract_no.regex' => 'Invalid contract number format. Must match: IIC/AKCL/CON/YYYY/NN',
            'contract_no.unique' => 'This contract number already exists.',
            
            'buyer_id.required' => 'Buyer is required.',
            'buyer_id.exists' => 'Selected buyer does not exist.',
            
            'contract_date.required' => 'Contract date is required.',
            'contract_date.date' => 'Contract date must be a valid date.',
            
            'amendment_date.date' => 'Amendment date must be a valid date.',
            'amendment_date.after_or_equal' => 'Amendment date must be equal to or later than contract date.',
            
            'total_orders.required' => 'Total orders is required.',
            'total_orders.integer' => 'Total orders must be a whole number.',
            'total_orders.min' => 'Total orders must be at least 0.',
            
            'order_quantity.required' => 'Order quantity is required.',
            'order_quantity.integer' => 'Order quantity must be a whole number.',
            'order_quantity.min' => 'Order quantity must be at least 0.',
            
            'value_usd.required' => 'Total contract value is required.',
            'value_usd.numeric' => 'Total contract value must be a number.',
            'value_usd.min' => 'Total contract value must be at least 0.',
            
            'b2b_percent.required' => 'B2B percentage is required.',
            'b2b_percent.numeric' => 'B2B percentage must be a number.',
            'b2b_percent.min' => 'B2B percentage must be between 0 and 100.',
            'b2b_percent.max' => 'B2B percentage must be between 0 and 100.',
            
            'status.required' => 'Status is required.',
            'status.in' => 'Invalid status. Must be one of: draft, active, pending, completed, cancelled.',
            
            'remarks.max' => 'Remarks cannot exceed 1000 characters.',
        ];
    }
}
