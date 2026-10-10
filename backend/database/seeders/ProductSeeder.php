<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $defaultImage = 'products/default.png';

        $products = [
            [
                'name' => 'iPhone 16',
                'category' => 'Electronics',
                'price' => 250000,
                'rating' => 4.8,
            ],
            [
                'name' => 'Samsung Galaxy S25',
                'category' => 'Electronics',
                'price' => 280000,
                'rating' => 4.7,
            ],
            [
                'name' => 'Dell Laptop',
                'category' => 'Electronics',
                'price' => 320000,
                'rating' => 4.5,
            ],
            [
                'name' => 'Cotton T-Shirt',
                'category' => 'Clothing',
                'price' => 2500,
                'rating' => 4.2,
            ],
            [
                'name' => 'Laravel Programming Book',
                'category' => 'Books',
                'price' => 4500,
                'rating' => 4.6,
            ],
            [
                'name' => 'Coffee Maker',
                'category' => 'Home & Kitchen',
                'price' => 12000,
                'rating' => 4.3,
            ],
            [
                'name' => 'Football',
                'category' => 'Sports',
                'price' => 6500,
                'rating' => 4.4,
            ],
        ];

        foreach ($products as $item) {
            $category = Category::where(
                'name',
                $item['category']
            )->firstOrFail();

            Product::firstOrCreate(
                ['name' => $item['name']],
                [
                    'category_id' => $category->id,
                    'price' => $item['price'],
                    'rating' => $item['rating'],
                    'image' => $defaultImage,
                ]
            );
        }
    }
}