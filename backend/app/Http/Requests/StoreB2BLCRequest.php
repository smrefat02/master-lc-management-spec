<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreB2BLCRequest extends FormRequest
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
            'contract_id' => 'required|exists:contracts,id',
            'order_id' => 'required|exists:orders,id',
            'costing_detail_id' => 'required|integer',
            'pi_number' => 'required|string|unique:b2b_lcs,pi_number|max:255',
            'supplier' => 'required|string|min:2|max:255',
            'order_qty' => 'required|integer|min:1',
            'fob_value' => 'required|numeric|min:0',
            'order_value' => 'nullable|numeric|min:0',
            'post_pi_value' => 'required|numeric|min:0',
            'b2b_percent' => 'nullable|numeric|min:0|max:100',
            'director_command' => 'nullable|string|max:1000',
            'status' => 'nullable|in:draft,active,completed,cancelled',
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
            'contract_id.required' => 'Please select a contract.',
            'contract_id.exists' => 'The selected contract does not exist.',
            'order_id.required' => 'Please select an order.',
            'order_id.exists' => 'The selected order does not exist.',
            'pi_number.required' => 'PI Number is required.',
            'pi_number.unique' => 'This PI Number already exists.',
            'supplier.required' => 'Supplier name is required.',
            'supplier.min' => 'Supplier name must be at least 2 characters.',
            'order_qty.required' => 'Order quantity is required.',
            'order_qty.min' => 'Order quantity must be at least 1.',
            'fob_value.required' => 'FOB value is required.',
            'fob_value.min' => 'FOB value must be 0 or greater.',
            'post_pi_value.required' => 'Post PI value is required.',
            'post_pi_value.min' => 'Post PI value must be 0 or greater.',
        ];
    }
}
