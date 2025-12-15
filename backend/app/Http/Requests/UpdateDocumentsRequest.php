<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDocumentsRequest extends FormRequest
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
            'documents_received_at' => [
                'nullable',
                'date',
            ],
            'documents_forwarded_to_bank_at' => [
                'nullable',
                'date',
                'after_or_equal:documents_received_at',
            ],
            'documents_verified_at' => [
                'nullable',
                'date',
                'after_or_equal:documents_forwarded_to_bank_at',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'documents_received_at.date' => 'The documents received date must be a valid date.',
            'documents_forwarded_to_bank_at.date' => 'The documents forwarded date must be a valid date.',
            'documents_forwarded_to_bank_at.after_or_equal' => 'The documents forwarded date must be on or after the received date.',
            'documents_verified_at.date' => 'The documents verified date must be a valid date.',
            'documents_verified_at.after_or_equal' => 'The documents verified date must be on or after the forwarded date.',
        ];
    }
}
