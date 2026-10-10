<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'token',
                'ac_expiration_time',
                'refresh_token',
                'rt_expiration_time',
                'user' => ['id', 'name', 'email'],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
        ]);

        $refreshResponse = $this->withToken(
            $response->json('refresh_token')
        )->getJson('/api/auth/refresh_token');

        $refreshResponse->assertOk()
            ->assertJsonStructure([
                'token',
                'ac_expiration_time',
            ]);

        $this->withToken($refreshResponse->json('token'))
            ->getJson('/api/auth/user')
            ->assertOk()
            ->assertJsonPath('user.email', 'test@example.com');
    }

    public function test_registration_requires_valid_fields(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => '',
            'email' => 'invalid-email',
            'password' => '',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors([
                'name',
                'email',
                'password',
            ]);
    }

    public function test_registration_rejects_duplicate_email(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Another User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertUnprocessable();
    }

    public function test_user_can_login(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => 'Password123!',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'Password123!',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'token',
                'ac_expiration_time',
                'refresh_token',
                'rt_expiration_time',
                'user' => ['id', 'name', 'email'],
            ]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => 'Password123!',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'WrongPassword123!',
        ]);

        $response->assertUnauthorized();
    }

    public function test_login_fails_for_unknown_email(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'unknown@example.com',
            'password' => 'Password123!',
        ]);

        $response->assertUnauthorized();
    }

    public function test_products_endpoint_requires_authentication(): void
    {
        $response = $this->getJson('/api/products');

        $response->assertUnauthorized();
    }

    public function test_invalid_bearer_token_is_rejected(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer invalid-token',
        ])->getJson('/api/products');

        $response->assertUnauthorized();
    }

    public function test_authenticated_user_can_access_products(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->getJson('/api/products');

        $response->assertOk();
    }

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/auth/logout');

        $response->assertSuccessful();
    }

    public function test_logout_revokes_the_current_refresh_token(): void
    {
        $user = User::factory()->create([
            'email' => 'logout@example.com',
            'password' => 'Password123!',
        ]);

        $login = $this->postJson('/api/auth/login', [
            'email' => 'logout@example.com',
            'password' => 'Password123!',
        ])->assertOk();

        $response = $this->withToken($login->json('token'))
            ->withHeader('X-Refresh-Token', $login->json('refresh_token'))
            ->getJson('/api/auth/logout');

        $response->assertOk();

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'name' => 'refresh_token',
        ]);

        $this->withToken($login->json('refresh_token'))
            ->getJson('/api/auth/refresh_token')
            ->assertForbidden();
    }
}
