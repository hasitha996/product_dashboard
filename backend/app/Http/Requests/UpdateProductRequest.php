<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product');

        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('pro_products', 'name')->ignore($productId),
            ],
            'category_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:pro_cactgory,id',
            ],
            'price' => [
                'sometimes',
                'required',
                'numeric',
                'min:0',
                'max:9999999999.99',
            ],
            'rating' => [
                'sometimes',
                'required',
                'numeric',
                'min:0',
                'max:5',
            ],
            'image' => [
                'sometimes',
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],
        ];
    }
}