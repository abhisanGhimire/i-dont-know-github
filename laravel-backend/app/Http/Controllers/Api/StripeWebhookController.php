<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $secret = config('services.stripe.webhook_secret');
        if (! $secret) {
            return response()->json(['message' => 'Webhook secret not configured'], 500);
        }

        Stripe::setApiKey(config('services.stripe.secret'));

        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');

        try {
            $event = Webhook::constructEvent($payload, $signature, $secret);
        } catch (\UnexpectedValueException $e) {
            return response()->json(['message' => 'Invalid payload'], 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;
            Log::info('setschool.checkout.completed', [
                'session_id' => $session->id,
                'client_reference_id' => $session->client_reference_id ?? null,
                'amount_total' => $session->amount_total ?? null,
            ]);
            // Extend: mark DB enrollment paid, send confirmation email, etc.
        }

        return response()->json(['received' => true]);
    }
}
