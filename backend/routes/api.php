<?php

use App\Enums\TokenAbility;
use App\Http\Controllers\Api\Auth\AuthenticationController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

// Auth routes
Route::prefix('auth')->group(function () {

    // Public routes
    Route::post('/register', [
        AuthenticationController::class,
        'register',
    ]);

    Route::post('/login', [
        AuthenticationController::class,
        'login',
    ]);

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {

        Route::get('/logout', [
            AuthenticationController::class,
            'logout',
        ]);

        Route::get('/user', [
            AuthenticationController::class,
            'user',
        ]);

        // Refresh token route
        Route::get('/refresh_token', [
            AuthenticationController::class,
            'refreshToken',
        ])->middleware(
            'abilities:' . TokenAbility::ISSUE_ACCESS_TOKEN->value
        );
    });
});

// Product and Category CRUD routes
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('products', ProductController::class);
    Route::apiResource('categories', CategoryController::class);
});