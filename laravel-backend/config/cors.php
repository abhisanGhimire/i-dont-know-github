<?php

return [

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter([
        env('FRONTEND_URL'),
        // Allow local static file testing, e.g. file:// is not allowed by browsers for CORS.
        // For `php artisan serve` on same machine you may add http://127.0.0.1:5500 etc.
    ]),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
