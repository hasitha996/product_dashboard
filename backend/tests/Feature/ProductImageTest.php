<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductImageTest extends TestCase
{
    use RefreshDatabase;

    protected Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        Sanctum::actingAs(User::factory()->create());

        $this->category = Category::create([
            'name' => 'Electronics',
        ]);
    }

    public function test_product_can_be_created_with_image(): void
    {
        $image = UploadedFile::fake()->image('product.jpg');

        $response = $this->post('/api/products', [
            'name' => 'Image Product',
            'category_id' => $this->category->id,
            'price' => 1500,
            'rating' => 4.5,
            'image' => $image,
        ], [
            'Accept' => 'application/json',
        ]);

        $response->assertSuccessful();

        $product = Product::where(
            'name',
            'Image Product'
        )->firstOrFail();

        $this->assertNotNull($product->image);

        Storage::disk('public')->assertExists(
            $product->image
        );
    }

    public function test_product_can_be_created_without_image(): void
    {
        $response = $this->postJson('/api/products', [
            'name' => 'No Image Product',
            'category_id' => $this->category->id,
            'price' => 1500,
            'rating' => 4.5,
        ]);

        $response->assertSuccessful();

        $this->assertDatabaseHas('pro_products', [
            'name' => 'No Image Product',
        ]);
    }

    public function test_product_can_be_updated_with_multipart_method_spoofing(): void
    {
        $product = Product::create([
            'name' => 'Original Product',
            'category_id' => $this->category->id,
            'price' => 1500,
            'rating' => 3.5,
        ]);

        $response = $this->post('/api/products/' . $product->id, [
            '_method' => 'PUT',
            'name' => 'Updated Product',
            'category_id' => $this->category->id,
            'price' => 2200,
            'rating' => 4.8,
            'image' => UploadedFile::fake()->image('updated-product.jpg'),
        ], [
            'Accept' => 'application/json',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Updated Product')
            ->assertJsonPath('data.category_id', $this->category->id);

        $product->refresh();

        $this->assertSame('2200.00', $product->price);
        $this->assertSame('4.8', $product->rating);
        $this->assertNotNull($product->image);
        Storage::disk('public')->assertExists($product->image);
    }

    public function test_invalid_file_is_rejected_as_image(): void
    {
        $file = UploadedFile::fake()->create(
            'document.pdf',
            100,
            'application/pdf'
        );

        $response = $this->post('/api/products', [
            'name' => 'Invalid Image Product',
            'category_id' => $this->category->id,
            'price' => 1500,
            'rating' => 4.5,
            'image' => $file,
        ], [
            'Accept' => 'application/json',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['image']);
    }

    public function test_product_resource_returns_image_url(): void
    {
        $path = 'products/test-image.jpg';

        Storage::disk('public')->put($path, 'fake image content');

        $product = Product::create([
            'name' => 'Image URL Product',
            'category_id' => $this->category->id,
            'price' => 1500,
            'rating' => 4.5,
            'image' => $path,
        ]);

        $response = $this->getJson(
            '/api/products/' . $product->id
        );

        $response->assertOk()
            ->assertJsonPath(
                'data.image_url',
                Storage::disk('public')->url($path)
            );
    }
}