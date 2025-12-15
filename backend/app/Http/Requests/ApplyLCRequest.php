<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApplyLCRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'applicant_remarks' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'applicant_remarks.max' => 'Applicant remarks must not exceed 1000 characters.',
        ];
    }
}
