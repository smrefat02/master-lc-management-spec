<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateB2BLCRequest extends FormRequest
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
        $b2blcId = $this->route('b2b_lc');
        
        return [
            'contract_id' => 'sometimes|exists:contracts,id',
            'order_id' => 'sometimes|exists:orders,id',
            'costing_detail_id' => 'sometimes|integer',
            'pi_number' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('b2b_lcs', 'pi_number')->ignore($b2blcId),
            ],
            'supplier' => 'sometimes|string|min:2|max:255',
            'order_qty' => 'sometimes|integer|min:1',
            'fob_value' => 'sometimes|numeric|min:0',
            'order_value' => 'sometimes|numeric|min:0',
            'post_pi_value' => 'sometimes|numeric|min:0',
            'b2b_percent' => 'sometimes|numeric|min:0|max:100',
            'director_command' => 'sometimes|nullable|string|max:1000',
            'status' => 'sometimes|in:draft,active,completed,cancelled',
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
            'pi_number.unique' => 'This PI Number already exists.',
            'supplier.min' => 'Supplier name must be at least 2 characters.',
            'order_qty.min' => 'Order quantity must be at least 1.',
            'fob_value.min' => 'FOB value must be 0 or greater.',
            'post_pi_value.min' => 'Post PI value must be 0 or greater.',
        ];
    }
}
