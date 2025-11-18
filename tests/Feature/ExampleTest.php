<?php

namespace Tests\Feature;

use Database\Seeders\Esp32ProvisioningSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);

        config([
            'demo.credentials.username' => 'demo',
            'demo.credentials.password_hash' => \Illuminate\Support\Facades\Hash::make('demo'),
        ]);
    }

    public function test_home_redirects_to_login(): void
    {
        $response = $this->get('/');

        $response->assertRedirect(route('login'));
    }

    public function test_successful_demo_login_redirects_to_dashboard(): void
    {
        $response = $this->post('/login', [
            'username' => config('demo.credentials.username'),
            'password' => 'demo',
        ]);

        $response->assertRedirect(route('dashboard'));

        $this->followRedirects($response)
            ->assertSee('Centro de control IoT')
            ->assertSee('Resumen del ESP32')
            ->assertSee('Gestionar configuración');
    }

    public function test_dashboard_shows_esp32_badge_after_provisioning(): void
    {
        config([
            'device.esp32.enabled' => true,
            'device.esp32.auto_provision' => true,
        ]);

        $this->seed(Esp32ProvisioningSeeder::class);

        $response = $this->post('/login', [
            'username' => config('demo.credentials.username'),
            'password' => 'demo',
        ]);

        $this->followRedirects($response)
            ->assertSee('En línea')
            ->assertSee('ESP32 #', false);
    }
}
