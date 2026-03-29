<?php

use App\Http\Controllers\Web\VerifyEmailWebController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web routes
|--------------------------------------------------------------------------
|
| Email verification links in the notification point here (absolute URL
| using APP_URL). After success, user is redirected to the static site.
|
*/

Route::get('/email/verify/{id}/{hash}', VerifyEmailWebController::class)
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');
