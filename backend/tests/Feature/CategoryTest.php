<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Sanctum::actingAs(User::factory()->create());
    }

    public function test_categories_endpoint_returns_success(): void
    {
        $response = $this->getJson('/api/categories');

        $response->assertOk();
    }

    public function test_categories_endpoint_returns_empty_list(): void
    {
        $response = $this->getJson('/api/categories');

        $response->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_categories_list_contains_category_data(): void
    {
        $category = Category::create([
            'name' => 'Electronics',
        ]);

        $response = $this->getJson('/api/categories');

        $response->assertOk()
            ->assertJsonFragment([
                'id' => $category->id,
                'name' => 'Electronics',
            ]);
    }

    public function test_user_can_view_single_category(): void
    {
        $category = Category::create([
            'name' => 'Electronics',
        ]);

        $response = $this->getJson(
            '/api/categories/' . $category->id
        );

        $response->assertOk()
            ->assertJsonFragment([
                'id' => $category->id,
                'name' => 'Electronics',
            ]);
    }

    public function test_missing_category_returns_404(): void
    {
        $response = $this->getJson('/api/categories/999999');

        $response->assertNotFound();
    }

    public function test_categories_endpoint_returns_json(): void
    {
        $response = $this->getJson('/api/categories');

        $response->assertHeader('Content-Type', 'application/json');
    }
}