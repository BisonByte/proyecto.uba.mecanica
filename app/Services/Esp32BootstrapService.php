<?php

namespace App\Services;

use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;

class Esp32BootstrapService
{
    public function __construct(private readonly DevicePumpService $devices)
    {
    }

    public function bootstrap(): void
    {
        if (! (bool) Arr::get(config('device.esp32', []), 'enabled')) {
            return;
        }

        $device = $this->devices->current();

        if (! $device) {
            return;
        }

        $now = Carbon::now();
        $changes = [];
        $shouldRun = (bool) $device->should_run;

        if ($device->last_seen_at === null) {
            $changes['last_seen_at'] = $now;
        }

        if ($device->should_run === null) {
            $changes['should_run'] = false;
            $shouldRun = false;
        }

        if ($device->reported_is_on === null || ($device->last_telemetry_at === null && $device->reported_is_on !== $shouldRun)) {
            $changes['reported_is_on'] = $shouldRun;
        }

        if (! empty($changes)) {
            $device->forceFill($changes)->save();
        }
    }
}
