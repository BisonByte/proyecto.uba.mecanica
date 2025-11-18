<?php

namespace Tests\Feature;

use App\Models\Device;
use Database\Seeders\Esp32ProvisioningSeeder;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Tests\TestCase;

class DeviceRegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->ip());
        });
    }

    public function test_registers_new_device_with_hashed_token(): void
    {
        $payload = [
            'mac' => 'AA:BB:CC:DD:EE:FF',
            'name' => 'ESP32 Demo',
            'firmware' => 'v1.2.3',
            'ip' => '192.168.1.10',
            'connection_type' => 'http',
        ];

        $response = $this->postJson(route('api.devices.register'), $payload);

        $response->assertCreated()
            ->assertJsonStructure([
                'device_id',
                'token',
                'token_expires_at',
                'connection_type',
                'http' => ['state', 'set', 'telemetry', 'poll_seconds'],
            ]);

        $token = $response->json('token');

        $this->assertTrue(is_string($token) && Str::length($token) === 60);

        $device = Device::firstOrFail();
        $this->assertSame(hash('sha256', $token), $device->token);
        $this->assertNotNull($device->token_expires_at);
    }

    public function test_re_registration_rotates_token(): void
    {
        $payload = [
            'mac' => 'AA:AA:AA:AA:AA:01',
        ];

        $first = $this->postJson(route('api.devices.register'), $payload)->json('token');
        $second = $this->postJson(route('api.devices.register'), $payload)->json('token');

        $this->assertNotSame($first, $second);

        $device = Device::where('mac', 'AA:AA:AA:AA:AA:01')->firstOrFail();
        $this->assertSame(hash('sha256', $second), $device->token);
    }

    public function test_demo_device_is_seeded_when_auto_provision_is_enabled(): void
    {
        config()->set('device.esp32.enabled', true);
        config()->set('device.esp32.auto_provision', true);
        config()->set('device.esp32.demo_mac', 'AA:BB:CC:DD:EE:01');

        $this->seed(Esp32ProvisioningSeeder::class);

        $device = Device::first();

        $this->assertNotNull($device);
        $this->assertSame('AA:BB:CC:DD:EE:01', $device->mac);
        $this->assertSame(config('device.esp32.device_id'), $device->name);
        $this->assertSame(config('device.esp32.firmware_version'), $device->firmware);
        $this->assertSame(config('device.esp32.mqtt_topic'), $device->topic);
        $this->assertSame(config('device.esp32.activation_mode'), $device->connection_type);
        $this->assertFalse($device->should_run);
        $this->assertFalse($device->isTokenExpired());
        $this->assertNotNull($device->last_seen_at);
        $this->assertSame(64, strlen($device->token));
        $this->assertTrue(config('device.esp32.enabled'));
    }

    public function test_demo_device_is_not_seeded_when_auto_provision_is_disabled(): void
    {
        config()->set('device.esp32.enabled', true);
        config()->set('device.esp32.auto_provision', false);

        $this->seed(Esp32ProvisioningSeeder::class);

        $this->assertDatabaseCount('devices', 0);
    }
}
