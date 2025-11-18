<?php

namespace App\Http\Controllers;

use App\Services\FluidPropertiesRepository;
use App\Services\PumpSimulationService;
use App\Services\SettingsRepository;
use Illuminate\Http\Request;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function __construct(
        private readonly PumpSimulationService $simulator,
        private readonly SettingsRepository $settings,
        private readonly FluidPropertiesRepository $fluids
    )
    {
    }

    public function __invoke(Request $request): View
    {
        $payload = $this->simulator->getPayload($request);

        return view('dashboard', [
            'pumpState' => $payload['state'],
            'metricsSeed' => $payload['metricsSeed'],
            'telemetry' => $payload['telemetry'] ?? [],
            'measurement' => $payload['measurement'] ?? null,
            'deviceMeta' => $payload['device'] ?? null,
            'justLoggedIn' => (bool) $request->session()->pull('just_logged_in', false),
            'esp32Config' => $esp32Config = $this->settings->getEsp32(),
            'fluidProperties' => $this->fluids->forDashboard(),
            'endpoints' => $this->buildEndpoints($esp32Config),
        ]);
    }

    private function buildEndpoints(array $esp32Config): array
    {
        $state = $esp32Config['http_state_endpoint'] ?? null;
        $toggle = $esp32Config['http_set_endpoint'] ?? null;
        $telemetry = $esp32Config['http_telemetry_endpoint'] ?? null;

        return [
            'state' => $state ?: route('pump.state'),
            'toggle' => $toggle ?: route('pump.toggle'),
            'telemetry' => $telemetry ?: route('api.telemetry.store'),
            'stream' => route('telemetry.stream'),
        ];
    }
}