<?php

return [

    /*
    | Static site origin (no trailing slash). Used after email verification
    | and in Stripe Checkout return URLs if you build them from config.
    */
    'frontend_url' => rtrim(env('FRONTEND_URL', 'http://localhost'), '/'),

];
