<?php

namespace Database\Seeders;

use App\Models\Device;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class Esp32ProvisioningSeeder extends Seeder
{
    public function run(): void
    {
        $config = config('device.esp32');

        if (! Arr::get($config, 'enabled') || ! Arr::get($config, 'auto_provision')) {
            return;
        }

        $mac = Str::upper(Arr::get($config, 'demo_mac', 'AA:BB:CC:DD:EE:FF'));
        $connectionType = Arr::get($config, 'activation_mode', 'http');

        $device = Device::firstOrNew(['mac' => $mac]);

        $plainToken = null;

        if (! $device->exists || empty($device->token)) {
            $plainToken = Str::random(60);
            $device->token = hash('sha256', $plainToken);
            $device->token_expires_at = now()->addDay();
        } elseif ($device->isTokenExpired()) {
            $device->token_expires_at = now()->addDay();
        }

        $device->fill([
            'name' => Arr::get($config, 'device_id', 'ESP32 Demo'),
            'firmware' => Arr::get($config, 'firmware_version'),
            'topic' => Arr::get($config, 'mqtt_topic'),
            'connection_type' => $connectionType,
            'should_run' => false,
            'reported_is_on' => false,
            'last_seen_at' => now(),
        ]);

        $device->save();

        if ($plainToken && isset($this->command)) {
            $this->command->info(sprintf('ESP32 demo token: %s', $plainToken));
        }
    }
}
