<?php

return [
    'esp32' => [
        'enabled' => filter_var(env('ESP32_ENABLED', false), FILTER_VALIDATE_BOOL),
        'auto_provision' => filter_var(env('ESP32_AUTO_PROVISION', false), FILTER_VALIDATE_BOOL),
        'device_id' => env('ESP32_DEVICE_ID', 'BB-ESP32-01'),
        'firmware_version' => env('ESP32_FIRMWARE_VERSION', '1.0.0'),
        'activation_mode' => env('ESP32_ACTIVATION_MODE', 'http'),
        'http_endpoint' => env('ESP32_HTTP_ENDPOINT', 'https://demo.api.bisonbyte.io/esp32/activate'),
        'mqtt_topic' => env('ESP32_MQTT_TOPIC', 'iot/bisonbyte/pump/control'),
        'activation_key' => env('ESP32_ACTIVATION_KEY', 'CLAVE-DEMO-1234'),
        'http_state_endpoint' => env('ESP32_HTTP_STATE_ENDPOINT', 'https://demo.api.bisonbyte.io/esp32/state'),
        'http_set_endpoint' => env('ESP32_HTTP_SET_ENDPOINT', 'https://demo.api.bisonbyte.io/esp32/set'),
        'http_telemetry_endpoint' => env('ESP32_HTTP_TELEMETRY_ENDPOINT', 'https://demo.api.bisonbyte.io/esp32/telemetry'),
        'http_poll_seconds' => (int) env('ESP32_HTTP_POLL_SECONDS', 2),
        'demo_mac' => env('ESP32_DEMO_MAC', 'AA:BB:CC:DD:EE:FF'),
        'wifi' => [
            'ssid' => env('ESP32_WIFI_SSID', 'BisonbyteDemo'),
            'password' => env('ESP32_WIFI_PASSWORD', 'BisonbyteSecret'),
            'security' => env('ESP32_WIFI_SECURITY', 'wpa2'),
            'static_ip' => env('ESP32_WIFI_STATIC_IP'),
            'gateway' => env('ESP32_WIFI_GATEWAY'),
            'dns' => env('ESP32_WIFI_DNS'),
            'fallback' => [
                'ssid' => env('ESP32_WIFI_FALLBACK_SSID'),
                'password' => env('ESP32_WIFI_FALLBACK_PASSWORD'),
            ],
        ],
        'usb' => [
            'preferred_port' => env('ESP32_USB_PREFERRED_PORT'),
            'auto_flash' => filter_var(env('ESP32_USB_AUTO_FLASH', false), FILTER_VALIDATE_BOOL),
        ],
    ],
];
