<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReceiveDocumentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'received_documents' => 'required|array|min:1',
            'received_documents.*' => 'string|max:255',
            'receiver_remarks' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'received_documents.required' => 'List of received documents is required.',
            'received_documents.array' => 'Received documents must be an array.',
            'received_documents.min' => 'At least one document must be received.',
        ];
    }
}
