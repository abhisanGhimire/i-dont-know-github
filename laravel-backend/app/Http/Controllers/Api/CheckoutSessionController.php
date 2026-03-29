<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session;

class CheckoutSessionController extends Controller
{
    public function store(Request $request)
    {
        $secret = config('services.stripe.secret');
        if (! $secret) {
            return response()->json(['message' => 'Stripe is not configured on the server.'], 500);
        }

        Stripe::setApiKey($secret);

        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.name' => ['required', 'string', 'max:250'],
            'items.*.price' => ['required', 'numeric', 'min:0.5'],
            'items.*.code' => ['nullable', 'string', 'max:60'],
        ]);

        $user = $request->user();

        $lineItems = [];
        foreach ($validated['items'] as $item) {
            $unitAmount = (int) round(((float) $item['price']) * 100);
            if ($unitAmount < 50) {
                return response()->json(['message' => 'Each item must be at least $0.50 USD.'], 422);
            }

            $lineItems[] = [
                'quantity' => 1,
                'price_data' => [
                    'currency' => 'usd',
                    'unit_amount' => $unitAmount,
                    'product_data' => [
                        'name' => $item['name'],
                        'metadata' => [
                            'code' => $item['code'] ?? '',
                        ],
                    ],
                ],
            ];
        }

        $frontend = rtrim(config('setschool.frontend_url'), '/');

        $session = Session::create([
            'mode' => 'payment',
            'line_items' => $lineItems,
            'success_url' => $frontend.'/cart.html?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => $frontend.'/cart.html?canceled=1',
            'client_reference_id' => (string) $user->id,
            'customer_email' => $user->email,
            'metadata' => [
                'user_id' => (string) $user->id,
                'source' => 'setschool-static-site',
            ],
        ]);

        return response()->json(['url' => $session->url]);
    }
}
