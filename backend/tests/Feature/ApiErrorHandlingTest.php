<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiErrorHandlingTest extends TestCase
{
    use RefreshDatabase;

    public function test_unknown_endpoint_returns_404(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->getJson('/api/unknown-endpoint');

        $response->assertNotFound();
    }

    public function test_wrong_http_method_returns_405(): void
    {
        // Register is assumed to support POST only.
        $response = $this->getJson('/api/auth/register');

        $response->assertStatus(405);
    }

    public function test_invalid_json_body_returns_client_error(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->call(
            'POST',
            '/api/products',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_ACCEPT' => 'application/json',
            ],
            '{"name":'
        );

        $this->assertContains(
            $response->getStatusCode(),
            [400, 422]
        );
    }

    public function test_validation_errors_are_returned_as_json(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->postJson('/api/products', [
            'name' => '',
            'category_id' => null,
            'price' => -100,
        ]);

        $response->assertUnprocessable()
            ->assertJsonStructure([
                'message',
                'errors',
            ]);
    }

    public function test_protected_endpoint_rejects_unauthenticated_user(): void
    {
        $response = $this->getJson('/api/products');

        $response->assertUnauthorized();
    }
}