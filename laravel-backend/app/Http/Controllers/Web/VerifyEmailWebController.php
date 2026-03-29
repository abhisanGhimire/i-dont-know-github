<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;

class VerifyEmailWebController extends Controller
{
    public function __invoke(Request $request, string $id, string $hash)
    {
        $user = User::findOrFail($id);

        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            abort(403, 'Invalid verification link');
        }

        if ($user->hasVerifiedEmail()) {
            return redirect(config('setschool.frontend_url').'/email-verified.html');
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return redirect(config('setschool.frontend_url').'/email-verified.html');
    }
}
