<?php

namespace App\Http\Controllers\Api\Auth;

use App\Enums\TokenAbility;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Validation\ValidationException;
use Throwable;

class AuthenticationController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(RegisterRequest $request)
    {
        try {
            $validated = $request->validated();

            $user = DB::transaction(function () use ($validated) {
                return User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                ]);
            });

            $accessExpiration = Carbon::now()->addMinutes(
                config('sanctum.ac_expiration')
            );

            $refreshExpiration = Carbon::now()->addMinutes(
                config('sanctum.rt_expiration')
            );

            $accessToken = $user->createToken(
                'access_token',
                [TokenAbility::ACCESS_API->value],
                $accessExpiration
            );

            $refreshToken = $user->createToken(
                'refresh_token',
                [TokenAbility::ISSUE_ACCESS_TOKEN->value],
                $refreshExpiration
            );

            return response()->json([
                'message' => 'Registration successful.',
                'user' => $user->only(['id', 'name', 'email']),
                'token' => $accessToken->plainTextToken,
                'token_type' => 'Bearer',
                'ac_expiration_time' => $accessExpiration,
                'refresh_token' => $refreshToken->plainTextToken,
                'rt_expiration_time' => $refreshExpiration,
            ], 201);
        } catch (ValidationException $e) {
            throw $e;
        } catch (QueryException $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to register user. The email may already be registered.',
            ], 409);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'An unexpected error occurred during registration.',
            ], 500);
        }
    }

    /**
     * Authenticate a user and issue access/refresh tokens.
     */
    public function login(LoginRequest $request)
    {
        try {
            $validated = $request->validated();

            $user = User::where('email', $validated['email'])->first();


            if (
                !$user ||
                !Hash::check($validated['password'], $user->password)
            ) {
                return response()->json([
                    'message' => 'Invalid email or password.',
                ], 401);
            }

            $accessExpiration = Carbon::now()->addMinutes(
                config('sanctum.ac_expiration')
            );

            $refreshExpiration = Carbon::now()->addMinutes(
                config('sanctum.rt_expiration')
            );

            $accessToken = $user->createToken(
                'access_token',
                [TokenAbility::ACCESS_API->value],
                $accessExpiration
            );

            $refreshToken = $user->createToken(
                'refresh_token',
                [TokenAbility::ISSUE_ACCESS_TOKEN->value],
                $refreshExpiration
            );

            return response()->json([
                'message' => 'Login successful.',
                'user' => $user->only(['id', 'name', 'email']),
                'token' => $accessToken->plainTextToken,
                'token_type' => 'Bearer',
                'ac_expiration_time' => $accessExpiration,
                'refresh_token' => $refreshToken->plainTextToken,
                'rt_expiration_time' => $refreshExpiration,
            ], 200);
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'An unexpected error occurred during login.',
            ], 500);
        }
    }

    /**
     * Logout the current authenticated token.
     */
    public function logout(Request $request)
    {
        try {
            $user = $request->user();
            $token = $user?->currentAccessToken();

            if (!$token || !method_exists($token, 'delete')) {
                return response()->json([
                    'message' => 'Unable to identify the current access token.',
                ], 401);
            }

            $token->delete();

            $refreshTokenValue = $request->header('X-Refresh-Token');

            if ($refreshTokenValue) {
                $refreshToken = PersonalAccessToken::findToken(
                    $refreshTokenValue
                );

                if (
                    $refreshToken
                    && $refreshToken->tokenable_id === $user->getKey()
                    && $refreshToken->tokenable_type === $user->getMorphClass()
                    && $refreshToken->can(
                        TokenAbility::ISSUE_ACCESS_TOKEN->value
                    )
                ) {
                    $refreshToken->delete();
                }
            }

            return response()->json([
                'message' => 'Logout successful.',
            ], 200);
        } catch (QueryException $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to log out.',
            ], 500);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'An unexpected error occurred during logout.',
            ], 500);
        }
    }

    /**
     * Get the authenticated user.
     */
    public function user(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'message' => 'Unauthenticated.',
                ], 401);
            }

            return response()->json([
                'user' => $user->only(['id', 'name', 'email']),
            ], 200);
        } catch (QueryException $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to retrieve the user.',
            ], 500);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'An unexpected error occurred.',
            ], 500);
        }
    }

    /**
     * Issue a new access token using an authorized refresh token.
     */
    public function refreshToken(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'message' => 'Unauthenticated.',
                ], 401);
            }

            $expiration = Carbon::now()->addMinutes(
                config('sanctum.ac_expiration')
            );

            $accessToken = $user->createToken(
                'access_token',
                [TokenAbility::ACCESS_API->value],
                $expiration
            );

            return response()->json([
                'message' => 'Access token generated successfully.',
                'token' => $accessToken->plainTextToken,
                'token_type' => 'Bearer',
                'ac_expiration_time' => $expiration,
            ], 200);
        } catch (QueryException $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to generate a new access token.',
            ], 500);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'An unexpected error occurred while generating the token.',
            ], 500);
        }
    }
}
