<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:255', 'unique:pro_products,name'],
            'category_id' => ['required', 'integer', 'exists:pro_cactgory,id'],
            'price'       => ['required', 'numeric', 'min:0', 'max:9999999999.99'],
            'rating'      => ['sometimes', 'numeric', 'min:0', 'max:5'],
            'image'       => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'        => 'Product name is required.',
            'name.unique'          => 'This product name already exists.',
            'category_id.required' => 'Please select a category.',
            'category_id.exists'   => 'The selected category does not exist.',
            'price.required'       => 'Product price is required.',
            'price.numeric'        => 'Price must be a valid number.',
            'rating.min'           => 'Rating must be at least 0.',
            'rating.max'           => 'Rating cannot exceed 5.',
            'image.image'          => 'The uploaded file must be an image.',
            'image.max'            => 'Image size cannot exceed 2 MB.',
        ];
    }
}