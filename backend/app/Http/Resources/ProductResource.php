<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'category' => [
                'id' => $this->category->id,
                'name' => $this->category->name,
            ],
            'category_id' => $this->category_id,
            'price' => $this->price,
            'rating' => $this->rating,
            'image_url' => $this->image
                ? Storage::disk('public')->url($this->image)
                : null,
            'created_at' => $this->created_at,
        ];
    }
}