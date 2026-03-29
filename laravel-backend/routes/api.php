<?php

use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\VerificationNotificationController;
use App\Http\Controllers\Api\CartCheckoutSessionController;
use App\Http\Controllers\Api\CheckoutSessionController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\StripeWebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/contact', [ContactController::class, 'store'])
    ->middleware('throttle:12,1');

Route::post('/checkout/cart-session', [CartCheckoutSessionController::class, 'store'])
    ->middleware('throttle:12,1');

Route::post('/webhooks/stripe', [StripeWebhookController::class, 'handle'])
    ->middleware('throttle:120,1');

Route::post('/register', [RegisterController::class, 'store'])
    ->middleware('throttle:6,1');

Route::post('/login', [LoginController::class, 'store'])
    ->middleware('throttle:12,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [LogoutController::class, 'destroy']);

    Route::post('/email/verification-notification', [VerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1');

    Route::post('/checkout/session', [CheckoutSessionController::class, 'store'])
        ->middleware(['verified', 'throttle:12,1']);
});
