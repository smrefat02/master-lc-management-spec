<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ShipGoodsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'shipment_id' => 'nullable|exists:shipments,id',
            'shipping_date' => 'required|date',
            'carrier' => 'required|string|max:255',
            'vessel_name' => 'nullable|string|max:255',
            'bill_of_lading_no' => 'required|string|max:100',
            'port_of_loading' => 'nullable|string|max:255',
            'port_of_discharge' => 'nullable|string|max:255',
            'shipper_remarks' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'shipping_date.required' => 'Shipping date is required.',
            'carrier.required' => 'Carrier information is required.',
            'bill_of_lading_no.required' => 'Bill of lading number is required.',
        ];
    }
}
