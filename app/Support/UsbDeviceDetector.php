<?php

namespace App\Support;

use Illuminate\Support\Str;

class UsbDeviceDetector
{
    /**
     * Detect available USB-to-serial interfaces where the ESP32 could be connected.
     *
     * @return array<int, array<string, mixed>>
     */
    public function detect(): array
    {
        $devices = [];

        foreach ($this->patternsForCurrentPlatform() as $pattern) {
            $matches = glob($pattern) ?: [];

            foreach ($matches as $devicePath) {
                $devices[] = [
                    'path' => $devicePath,
                    'hint' => $this->describeDevice($devicePath),
                ];
            }
        }

        if ($this->shouldAttemptWindowsDetection()) {
            $devices = array_merge($devices, $this->detectOnWindows());
        }

        return $this->uniqueDevices($devices);
    }

    /**
     * @return array<int, string>
     */
    private function patternsForCurrentPlatform(): array
    {
        return match (PHP_OS_FAMILY) {
            'Linux' => [
                '/dev/ttyUSB*',
                '/dev/ttyACM*',
            ],
            'BSD', 'Solaris' => [
                '/dev/cuaU*',
                '/dev/ttyU*',
            ],
            'Darwin' => [
                '/dev/cu.SLAB_USB*',
                '/dev/cu.usbserial*',
                '/dev/cu.usbmodem*',
            ],
            default => [],
        };
    }

    private function describeDevice(string $devicePath): ?string
    {
        if ($this->canRunCommand('udevadm')) {
            $command = sprintf('udevadm info -q property -n %s 2>/dev/null', escapeshellarg($devicePath));
            $output = @shell_exec($command);

            if ($output) {
                $vendor = $this->extractProperty($output, 'ID_VENDOR');
                $model = $this->extractProperty($output, 'ID_MODEL');

                if ($vendor || $model) {
                    return trim(sprintf('%s %s', $vendor ?? '', $model ?? ''));
                }
            }
        }

        if (Str::contains($devicePath, 'ttyUSB')) {
            return 'USB a serial (ttyUSB)';
        }

        if (Str::contains($devicePath, 'ttyACM')) {
            return 'CDC ACM (ttyACM)';
        }

        if (Str::contains($devicePath, 'usbmodem')) {
            return 'USB CDC (usbmodem)';
        }

        return null;
    }

    private function extractProperty(string $output, string $key): ?string
    {
        foreach (explode("\n", $output) as $line) {
            if (str_starts_with($line, $key . '=')) {
                return trim(substr($line, strlen($key) + 1));
            }
        }

        return null;
    }

    private function uniqueDevices(array $devices): array
    {
        $unique = [];
        $seen = [];

        foreach ($devices as $device) {
            if (! isset($device['path']) || isset($seen[$device['path']])) {
                continue;
            }

            $seen[$device['path']] = true;
            $unique[] = $device;
        }

        return $unique;
    }

    private function shouldAttemptWindowsDetection(): bool
    {
        return PHP_OS_FAMILY === 'Windows';
    }

    private function detectOnWindows(): array
    {
        $devices = [];
        $command = 'wmic path Win32_SerialPort where "PNPDeviceID like \'%USB%\'" get DeviceID,Name 2>NUL';
        $output = @shell_exec($command);

        if (! $output) {
            return $devices;
        }

        foreach (preg_split('/\R+/', trim($output)) as $line) {
            if (! Str::contains($line, 'COM')) {
                continue;
            }

            if (preg_match('/(COM\d+)/', $line, $match)) {
                $port = $match[1];
                $devices[] = [
                    'path' => $port,
                    'hint' => trim(Str::after($line, $port)) ?: null,
                ];
            }
        }

        return $devices;
    }

    private function canRunCommand(string $binary): bool
    {
        if (! function_exists('shell_exec')) {
            return false;
        }

        $result = @shell_exec(sprintf('command -v %s 2>/dev/null || which %s 2>/dev/null', escapeshellarg($binary), escapeshellarg($binary)));

        return is_string($result) && strlen(trim($result)) > 0;
    }
}

