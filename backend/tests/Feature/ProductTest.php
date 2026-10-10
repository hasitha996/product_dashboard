<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    protected Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        Sanctum::actingAs(User::factory()->create());

        $this->category = Category::create([
            'name' => 'Electronics',
        ]);
    }

    private function createProduct(
        string $name = 'Test Product',
        float $price = 1000,
        float $rating = 4.5
    ): Product {
        return Product::create([
            'name' => $name,
            'category_id' => $this->category->id,
            'price' => $price,
            'rating' => $rating,
            'image' => null,
        ]);
    }

    public function test_products_endpoint_returns_success(): void
    {
        $response = $this->getJson('/api/products');

        $response->assertOk();
    }

    public function test_user_can_create_product(): void
    {
        $response = $this->postJson('/api/products', [
            'name' => 'iPhone 16',
            'category_id' => $this->category->id,
            'price' => 250000,
            'rating' => 4.8,
        ]);

        $response->assertSuccessful();

        $this->assertDatabaseHas('pro_products', [
            'name' => 'iPhone 16',
            'category_id' => $this->category->id,
        ]);
    }

    public function test_product_creation_requires_name(): void
    {
        $response = $this->postJson('/api/products', [
            'category_id' => $this->category->id,
            'price' => 1000,
            'rating' => 4.5,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }

    public function test_product_creation_rejects_negative_price(): void
    {
        $response = $this->postJson('/api/products', [
            'name' => 'Invalid Product',
            'category_id' => $this->category->id,
            'price' => -100,
            'rating' => 4.5,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['price']);
    }

    public function test_product_creation_rejects_invalid_category(): void
    {
        $response = $this->postJson('/api/products', [
            'name' => 'Invalid Category Product',
            'category_id' => 999999,
            'price' => 1000,
            'rating' => 4.5,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['category_id']);
    }

    public function test_user_can_view_single_product(): void
    {
        $product = $this->createProduct();

        $response = $this->getJson(
            '/api/products/' . $product->id
        );

        $response->assertOk()
            ->assertJsonFragment([
                'name' => 'Test Product',
            ]);
    }

    public function test_missing_product_returns_404(): void
    {
        $response = $this->getJson('/api/products/999999');

        $response->assertNotFound();
    }

    public function test_user_can_update_product(): void
    {
        $product = $this->createProduct();

        $response = $this->putJson(
            '/api/products/' . $product->id,
            [
                'name' => 'Updated Product',
                'category_id' => $this->category->id,
                'price' => 2000,
                'rating' => 4.9,
            ]
        );

        $response->assertSuccessful();

        $this->assertDatabaseHas('pro_products', [
            'id' => $product->id,
            'name' => 'Updated Product',
        ]);
    }

    public function test_product_update_rejects_invalid_price(): void
    {
        $product = $this->createProduct();

        $response = $this->putJson(
            '/api/products/' . $product->id,
            [
                'name' => 'Updated Product',
                'category_id' => $this->category->id,
                'price' => -500,
                'rating' => 4.5,
            ]
        );

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['price']);
    }

    public function test_user_can_delete_product(): void
    {
        $product = $this->createProduct();

        $response = $this->deleteJson(
            '/api/products/' . $product->id
        );

        $response->assertSuccessful();

        $this->assertDatabaseMissing('pro_products', [
            'id' => $product->id,
        ]);
    }

    public function test_deleted_product_cannot_be_found(): void
    {
        $product = $this->createProduct();

        $this->deleteJson('/api/products/' . $product->id);

        $response = $this->getJson(
            '/api/products/' . $product->id
        );

        $response->assertNotFound();
    }

    public function test_products_can_be_searched_by_name(): void
    {
        $this->createProduct('iPhone 16');
        $this->createProduct('Samsung Galaxy');

        $response = $this->getJson(
            '/api/products?search=iPhone'
        );

        $response->assertOk()
            ->assertJsonFragment(['name' => 'iPhone 16'])
            ->assertJsonMissing(['name' => 'Samsung Galaxy']);
    }

    public function test_search_with_no_matches_returns_empty_data(): void
    {
        $response = $this->getJson(
            '/api/products?search=NoSuchProductXYZ'
        );

        $response->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_products_can_be_filtered_by_category(): void
    {
        $this->createProduct('Product A');

        $anotherCategory = Category::create([
            'name' => 'Books',
        ]);

        Product::create([
            'name' => 'Book A',
            'category_id' => $anotherCategory->id,
            'price' => 500,
            'rating' => 4.0,
            'image' => null,
        ]);

        $response = $this->getJson(
            '/api/products?category_id=' . $this->category->id
        );

        $response->assertOk()
            ->assertJsonFragment(['name' => 'Product A'])
            ->assertJsonMissing(['name' => 'Book A']);
    }

    public function test_products_can_be_filtered_by_min_price(): void
    {
        $this->createProduct('Cheap Product', 500);
        $this->createProduct('Expensive Product', 5000);

        $response = $this->getJson(
            '/api/products?min_price=1000'
        );

        $response->assertOk()
            ->assertJsonFragment(['name' => 'Expensive Product'])
            ->assertJsonMissing(['name' => 'Cheap Product']);
    }

    public function test_products_can_be_filtered_by_max_price(): void
    {
        $this->createProduct('Cheap Product', 500);
        $this->createProduct('Expensive Product', 5000);

        $response = $this->getJson(
            '/api/products?max_price=1000'
        );

        $response->assertOk()
            ->assertJsonFragment(['name' => 'Cheap Product'])
            ->assertJsonMissing(['name' => 'Expensive Product']);
    }

    public function test_min_price_cannot_exceed_max_price(): void
    {
        $response = $this->getJson(
            '/api/products?min_price=5000&max_price=1000'
        );

        $response->assertUnprocessable();
    }

    public function test_products_can_be_sorted_by_price_ascending(): void
    {
        $this->createProduct('Expensive Product', 5000);
        $this->createProduct('Cheap Product', 500);

        $response = $this->getJson(
            '/api/products?sort_by=price&sort_dir=asc'
        );

        $response->assertOk();

        $names = collect($response->json('data'))
            ->pluck('name')
            ->values()
            ->all();

        $this->assertSame(
            ['Cheap Product', 'Expensive Product'],
            $names
        );
    }

    public function test_invalid_sort_field_is_rejected(): void
    {
        $response = $this->getJson(
            '/api/products?sort_by=invalid'
        );

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['sort_by']);
    }

    public function test_products_support_pagination(): void
    {
        for ($i = 1; $i <= 12; $i++) {
            $this->createProduct('Product ' . $i, $i * 100);
        }

        $response = $this->getJson(
            '/api/products?per_page=5&page=1'
        );

        $response->assertOk()
            ->assertJsonCount(5, 'data');
    }

    public function test_invalid_per_page_is_rejected(): void
    {
        $response = $this->getJson(
            '/api/products?per_page=500'
        );

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['per_page']);
    }

    public function test_invalid_page_is_rejected(): void
    {
        $response = $this->getJson(
            '/api/products?page=0'
        );

        // Requires page => sometimes|integer|min:1
        // in IndexProductRequest.
        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['page']);
    }

    public function test_search_and_category_filters_work_together(): void
    {
        $this->createProduct('iPhone 16');

        $anotherCategory = Category::create([
            'name' => 'Books',
        ]);

        Product::create([
            'name' => 'iPhone Case',
            'category_id' => $anotherCategory->id,
            'price' => 1000,
            'rating' => 4.0,
            'image' => null,
        ]);

        $response = $this->getJson(
            '/api/products?search=iPhone&category_id='
            . $this->category->id
        );

        $response->assertOk()
            ->assertJsonFragment(['name' => 'iPhone 16'])
            ->assertJsonMissing(['name' => 'iPhone Case']);
    }

    public function test_products_endpoint_returns_json(): void
    {
        $response = $this->getJson('/api/products');

        $response->assertHeader('Content-Type', 'application/json');
    }
}