<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class IndexProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
            ],

            'category_id' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:pro_cactgory,id',
            ],

            'min_price' => [
                'sometimes',
                'nullable',
                'numeric',
                'min:0',
            ],

            'max_price' => [
                'sometimes',
                'nullable',
                'numeric',
                'min:0',
            ],

            'sort_by' => [
                'sometimes',
                'nullable',
                Rule::in([
                    'name',
                    'price',
                    'rating',
                    'created_at',
                ]),
            ],

            'sort_dir' => [
                'sometimes',
                'nullable',
                Rule::in([
                    'asc',
                    'desc',
                ]),
            ],

            'per_page' => [
                'sometimes',
                'integer',
                'min:1',
                'max:100',
            ],

            'page' => [
                'sometimes',
                'integer',
                'min:1',
            ],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->sometimes(
            'max_price',
            'gte:min_price',
            fn () => $this->filled('min_price')
        );
    }
}