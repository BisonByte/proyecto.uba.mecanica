<?php

namespace App\Providers;

use App\Services\Esp32BootstrapService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use Throwable;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(Esp32BootstrapService $esp32Bootstrap): void
    {
        // Global API limiter used by the 'api' middleware group
        RateLimiter::for('api', function (Request $request) {
            // 60 requests per minute per IP (or per user if available)
            $key = $request->user()?->id ? ('user:'.$request->user()->id) : ('ip:'.$request->ip());
            return Limit::perMinute(60)->by($key);
        });

        RateLimiter::for('telemetry', function (Request $request) {
            $deviceId = (int) ($request->input('device_id') ?? $request->route('device_id'));

            if ($deviceId > 0) {
                return Limit::perMinute(60)->by('device:' . $deviceId);
            }

            return Limit::perMinute(30)->by($request->ip());
        });

        RateLimiter::for('device-registration', function (Request $request) {
            $mac = strtolower((string) $request->input('mac'));

            if ($mac !== '') {
                return Limit::perMinute(6)->by('registration-mac:' . $mac);
            }

            return Limit::perMinute(3)->by($request->ip());
        });

        RateLimiter::for('demo-login', function (Request $request) {
            $username = strtolower((string) $request->input('username'));

            return Limit::perMinute(5)->by($request->ip() . '|' . $username);
        });

        if ($this->shouldRunEsp32Bootstrap()) {
            Cache::remember('esp32-bootstrap-ran', now()->addMinutes(5), function () use ($esp32Bootstrap) {
                $esp32Bootstrap->bootstrap();

                return true;
            });
        }
    }

    private function shouldRunEsp32Bootstrap(): bool
    {
        if (app()->runningInConsole() && ! app()->runningUnitTests()) {
            return false;
        }

        try {
            return Schema::hasTable('cache');
        } catch (Throwable) {
            return false;
        }
    }
}
