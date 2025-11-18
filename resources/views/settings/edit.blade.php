@extends('layouts.app')

@section('title', 'Configuración del sistema')

@section('content')
    @php
        $esp32Enabled = (bool) ($esp32['enabled'] ?? false);
        $activationMode = strtoupper($esp32['activation_mode'] ?? 'HTTP');
        $activationTag = $esp32Enabled ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/40 bg-amber-500/10 text-amber-200';
        $wifiConfig = $esp32['wifi'] ?? [];
        $usbConfig = $esp32['usb'] ?? [];
        $usbConnected = $usbStatus['connected'] ?? false;
        $usbDevices = $usbStatus['devices'] ?? [];
        $usbBadge = $usbConnected ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/40 bg-amber-500/10 text-amber-200';
        $usbStatusLabel = $usbConnected ? 'ESP32 detectado' : 'Esperando USB';
        $appUrlValue = $appUrl ?? config('app.url');
        $queueConnection = config('queue.default');
    @endphp

    <div class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header class="mb-10 flex flex-wrap items-center justify-between gap-4">
            <div>
                <p class="text-xs font-semibold uppercase tracking-[0.4em] text-cyan-200">Centro de configuración</p>
                <h1 class="mt-2 text-3xl font-semibold tracking-tight text-white">Ajustes del ESP32 y acceso demo</h1>
                <p class="mt-2 max-w-2xl text-sm text-white/70">
                    Actualiza las credenciales del panel de demostración y los parámetros de conexión hacia el módulo ESP32. 
                    Los cambios se almacenan en el servidor y se aplican inmediatamente al dashboard principal.
                </p>
            </div>
            <a
                href="{{ route('dashboard') }}"
                class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/80 transition hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-100"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 10.707a1 1 0 01-1.414 0L11 6.414V17a1 1 0 11-2 0V6.414L4.707 10.707a1 1 0 01-1.414-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 010 1.414z" clip-rule="evenodd" /></svg>
                Volver al dashboard
            </a>
        </header>

        @if ($status)
            <div class="mb-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-5 text-sm text-emerald-100 shadow-lg shadow-emerald-500/20">
                {{ $status }}
            </div>
        @endif

        @if ($errors->any())
            <div class="mb-6 rounded-3xl border border-rose-500/30 bg-rose-500/10 px-6 py-5 text-sm text-rose-100 shadow-lg shadow-rose-500/20">
                {{ __('Revisa los campos marcados e intenta nuevamente.') }}
            </div>
        @endif

        <div class="mb-8 grid gap-4 sm:grid-cols-2">
            <article class="rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-6 text-sm text-cyan-100 shadow-lg shadow-cyan-500/20">
                <div class="flex items-center justify-between gap-3">
                    <div>
                        <p class="text-xs uppercase tracking-[0.35em] text-cyan-200/70">App URL</p>
                        <p class="mt-2 text-base font-semibold text-cyan-100">{{ $appUrlValue ?: '—' }}</p>
                    </div>
                    @if ($appUrlValue)
                        <button
                            type="button"
                            class="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-100 transition hover:bg-cyan-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                            data-copy-value="{{ $appUrlValue }}"
                            data-copy-label="URL copiada"
                        >
                            Copiar
                        </button>
                    @endif
                </div>
                <p class="mt-4 text-xs text-cyan-100/70">
                    Asegúrate de que coincida con el host expuesto al ESP32. Actualiza <code>.env</code> si cambias dominio o puerto.
                </p>
            </article>
            <article class="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-sm text-emerald-100 shadow-lg shadow-emerald-500/20">
                <div class="flex flex-col gap-2">
                    <p class="text-xs uppercase tracking-[0.35em] text-emerald-200/70">Estado del hardware</p>
                    <div class="flex items-center gap-3">
                        <span class="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-100">
                            <span class="h-1.5 w-1.5 rounded-full {{ $esp32Enabled ? 'bg-emerald-300 animate-pulse' : 'bg-amber-300' }}"></span>
                            {{ $esp32Enabled ? 'ESP32_ENABLED=TRUE' : 'ESP32_ENABLED=FALSE' }}
                        </span>
                        <span class="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">
                            Cola: {{ strtoupper($queueConnection) }}
                        </span>
                    </div>
                </div>
                <p class="mt-4 text-xs text-emerald-100/70">
                    Activa el hardware solo cuando el dispositivo esté provisionado. La cola usa la conexión definida en <code>.env</code> (<code>QUEUE_CONNECTION={{ strtoupper($queueConnection) }}</code>).
                </p>
            </article>
        </div>

        <div class="grid gap-8 lg:grid-cols-2">
            <section class="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs uppercase tracking-widest text-white/50">Configuración</p>
                        <h2 class="text-2xl font-semibold text-white">Configuración ESP32</h2>
                        <p class="mt-2 text-sm text-white/60">
                            Define cómo Laravel se comunica con el módulo de control. Activa el hardware cuando esté listo para recibir los comandos ON/OFF.
                        </p>
                    </div>
                    <span class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] {{ $activationTag }}">
                        <span class="h-1.5 w-1.5 rounded-full {{ $esp32Enabled ? 'bg-emerald-300 animate-pulse' : 'bg-amber-300' }}"></span>
                        {{ $esp32Enabled ? 'Activo' : 'Pendiente' }}
                    </span>
                </div>

                <form action="{{ route('settings.esp32.update') }}" method="POST" class="mt-6 space-y-5">
                    @csrf
                    @method('PUT')

                    <div class="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <label for="esp32-enabled" class="text-sm font-semibold text-white">Hardware habilitado</label>
                        <div class="flex items-center gap-3">
                            <span class="text-xs uppercase tracking-[0.3em] text-white/60">{{ $esp32Enabled ? 'Sí' : 'No' }}</span>
                            <label class="relative inline-flex cursor-pointer items-center">
                                <input type="checkbox" id="esp32-enabled" name="enabled" value="1" class="peer sr-only" {{ $esp32Enabled ? 'checked' : '' }}>
                                <div class="h-6 w-11 rounded-full bg-white/10 transition peer-checked:bg-emerald-400/70"></div>
                                <div class="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"></div>
                            </label>
                        </div>
                    </div>

                    <div class="grid gap-4 text-sm text-white/70 sm:grid-cols-2">
                        <div>
                            <label for="device_id" class="text-xs uppercase tracking-widest text-white/50">Identificador</label>
                            <div class="mt-2 flex items-center gap-2">
                                <input
                                    id="device_id"
                                    name="device_id"
                                    type="text"
                                    value="{{ old('device_id', $esp32['device_id'] ?? '') }}"
                                    required
                                    class="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                                >
                                @if ($esp32['device_id'] ?? false)
                                    <button
                                        type="button"
                                        class="inline-flex shrink-0 items-center gap-1 rounded-2xl border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-100 transition hover:bg-cyan-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                                        data-copy-value="{{ $esp32['device_id'] }}"
                                        data-copy-label="ID copiado"
                                    >
                                        Copiar
                                    </button>
                                @endif
                            </div>
                        </div>
                        <div>
                            <label for="firmware_version" class="text-xs uppercase tracking-widest text-white/50">Firmware</label>
                            <input
                                id="firmware_version"
                                name="firmware_version"
                                type="text"
                                value="{{ old('firmware_version', $esp32['firmware_version'] ?? '') }}"
                                required
                                class="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                            >
                        </div>
                        <div>
                            <label for="activation_mode" class="text-xs uppercase tracking-widest text-white/50">Modo de activación</label>
                            <select
                                id="activation_mode"
                                name="activation_mode"
                                class="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                            >
                                <option value="http" {{ ($esp32['activation_mode'] ?? '') === 'http' ? 'selected' : '' }}>HTTP</option>
                                <option value="mqtt" {{ ($esp32['activation_mode'] ?? '') === 'mqtt' ? 'selected' : '' }}>MQTT</option>
                            </select>
                        </div>
                        <div>
                            <label for="activation_key" class="text-xs uppercase tracking-widest text-white/50">Clave de activación</label>
                            <input
                                id="activation_key"
                                name="activation_key"
                                type="text"
                                value="{{ old('activation_key', $esp32['activation_key'] ?? '') }}"
                                required
                                class="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                            >
                        </div>
                        <div class="sm:col-span-2">
                            <label for="http_endpoint" class="text-xs uppercase tracking-widest text-white/50">HTTP Endpoint</label>
                            <input
                                id="http_endpoint"
                                name="http_endpoint"
                                type="url"
                                value="{{ old('http_endpoint', $esp32['http_endpoint'] ?? '') }}"
                                placeholder="https://api.ejemplo.com/esp32/activate"
                                class="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                            >
                        </div>
                        <div class="sm:col-span-2">
                            <label for="mqtt_topic" class="text-xs uppercase tracking-widest text-white/50">Tópico MQTT</label>
                            <input
                                id="mqtt_topic"
                                name="mqtt_topic"
                                type="text"
                                value="{{ old('mqtt_topic', $esp32['mqtt_topic'] ?? '') }}"
                                placeholder="iot/bisonbyte/pump/control"
                                class="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                            >
                        </div>
                    </div>

                    <div class="space-y-6">
                        <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div class="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p class="text-xs uppercase tracking-widest text-white/50">Conexión Wi-Fi</p>
                                    <h3 class="mt-1 text-lg font-semibold text-white">Credenciales de red</h3>
                                    <p class="mt-2 text-xs text-white/60">
                                        El ESP32 se conecta en modo estación usando esta configuración. Mantenla actualizada para evitar desconexiones en campo.
                                    </p>
                                </div>
                                <span class="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/60">
                                    STA
                                </span>
                            </div>

                            <div class="mt-4 grid gap-4 text-sm text-white/70 sm:grid-cols-2">
                                <div>
                                    <label for="wifi_ssid" class="text-xs uppercase tracking-widest text-white/50">SSID principal</label>
                                    <input
                                        id="wifi_ssid"
                                        name="wifi_ssid"
                                        type="text"
                                        value="{{ old('wifi_ssid', $wifiConfig['ssid'] ?? '') }}"
                                        required
                                        placeholder="Red industrial"
                                        class="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                                    >
                                </div>
                                <div>
                                    <label for="wifi_password" class="text-xs uppercase tracking-widest text-white/50">Contraseña</label>
                                    <input
                                        id="wifi_password"
                                        name="wifi_password"
                                        type="password"
                                        value="{{ old('wifi_password', $wifiConfig['password'] ?? '') }}"
                                        required
                                        placeholder="••••••••"
                                        class="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                                    >
                                </div>
                                <div>
                                    <label for="wifi_security" class="text-xs uppercase tracking-widest text-white/50">Seguridad</label>
                                    <select
                                        id="wifi_security"
                                        name="wifi_security"
                                        class="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                                    >
                                        @foreach (['wpa3' => 'WPA3-Personal', 'wpa2' => 'WPA2-Personal', 'wep' => 'WEP', 'open' => 'Red abierta'] as $value => $label)
                                            <option value="{{ $value }}" {{ (old('wifi_security', $wifiConfig['security'] ?? 'wpa2')) === $value ? 'selected' : '' }}>
                                                {{ $label }}
                                            </option>
                                        @endforeach
                                    </select>
                                </div>
                                <div>
                                    <label for="wifi_static_ip" class="text-xs uppercase tracking-widest text-white/50">IP fija (opcional)</label>
                                    <input
                                        id="wifi_static_ip"
                                        name="wifi_static_ip"
                                        type="text"
                                        inputmode="decimal"
                                        value="{{ old('wifi_static_ip', $wifiConfig['static_ip'] ?? '') }}"
                                        placeholder="192.168.1.50"
                                        class="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                                    >
                                </div>
                                <div>
                                    <label for="wifi_gateway" class="text-xs uppercase tracking-widest text-white/50">Gateway</label>
                                    <input
                                        id="wifi_gateway"
                                        name="wifi_gateway"
                                        type="text"
                                        inputmode="decimal"
                                        value="{{ old('wifi_gateway', $wifiConfig['gateway'] ?? '') }}"
                                        placeholder="192.168.1.1"
                                        class="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                                    >
                                </div>
                                <div>
                                    <label for="wifi_dns" class="text-xs uppercase tracking-widest text-white/50">DNS</label>
                                    <input
                                        id="wifi_dns"
                                        name="wifi_dns"
                                        type="text"
                                        inputmode="decimal"
                                        value="{{ old('wifi_dns', $wifiConfig['dns'] ?? '') }}"
                                        placeholder="8.8.8.8"
                                        class="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                                    >
                                </div>
                            </div>

                            <div class="mt-4 grid gap-4 text-sm text-white/70 sm:grid-cols-2">
                                <div>
                                    <label for="wifi_fallback_ssid" class="text-xs uppercase tracking-widest text-white/50">SSID de respaldo</label>
                                    <input
                                        id="wifi_fallback_ssid"
                                        name="wifi_fallback_ssid"
                                        type="text"
                                        value="{{ old('wifi_fallback_ssid', data_get($wifiConfig, 'fallback.ssid')) }}"
                                        placeholder="Red de emergencia"
                                        class="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                                    >
                                </div>
                                <div>
                                    <label for="wifi_fallback_password" class="text-xs uppercase tracking-widest text-white/50">Contraseña de respaldo</label>
                                    <input
                                        id="wifi_fallback_password"
                                        name="wifi_fallback_password"
                                        type="password"
                                        value="{{ old('wifi_fallback_password', data_get($wifiConfig, 'fallback.password')) }}"
                                        placeholder="••••••••"
                                        class="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                                    >
                                </div>
                            </div>
                        </div>

                        <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div class="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p class="text-xs uppercase tracking-widest text-white/50">Modo USB asistido</p>
                                    <h3 class="mt-1 text-lg font-semibold text-white">Conexión directa</h3>
                                    <p class="mt-2 text-xs text-white/60">
                                        Al detectar un puerto USB disponible, el panel guía el provisioning del módulo y facilita actualizaciones por cable.
                                    </p>
                                </div>
                                <span class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] {{ $usbBadge }}">
                                    <span class="h-1.5 w-1.5 rounded-full {{ $usbConnected ? 'bg-emerald-300 animate-pulse' : 'bg-amber-300' }}"></span>
                                    {{ $usbStatusLabel }}
                                </span>
                            </div>

                            <div class="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/70">
                                @if ($usbConnected)
                                    <p class="text-white/70">Puertos detectados:</p>
                                    <ul class="mt-3 space-y-2">
                                        @foreach ($usbDevices as $device)
                                            <li class="flex flex-col gap-1 rounded-xl border border-white/5 bg-white/5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                                                <span class="font-mono text-sm text-cyan-100">{{ $device['path'] }}</span>
                                                @if ($hint = data_get($device, 'hint'))
                                                    <span class="text-xs text-white/60">{{ $hint }}</span>
                                                @endif
                                            </li>
                                        @endforeach
                                    </ul>
                                @else
                                    <p class="text-white/60">
                                        No se detectaron puertos USB activos. Conecta el ESP32 mediante un cable de datos y espera unos segundos.
                                    </p>
                                @endif
                            </div>

                            <div class="mt-4 grid gap-4 text-sm text-white/70 sm:grid-cols-2">
                                <div>
                                    <label for="usb_preferred_port" class="text-xs uppercase tracking-widest text-white/50">Puerto preferido</label>
                                    <input
                                        id="usb_preferred_port"
                                        name="usb_preferred_port"
                                        type="text"
                                        value="{{ old('usb_preferred_port', $usbConfig['preferred_port'] ?? '') }}"
                                        placeholder="/dev/ttyUSB0"
                                        class="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                                    >
                                </div>
                                <div class="flex items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                    <input
                                        id="usb_auto_flash"
                                        name="usb_auto_flash"
                                        type="checkbox"
                                        value="1"
                                        class="h-5 w-5 rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-cyan-400"
                                        {{ old('usb_auto_flash', $usbConfig['auto_flash'] ?? false) ? 'checked' : '' }}
                                    >
                                    <label for="usb_auto_flash" class="ml-3 text-xs uppercase tracking-widest text-white/50">
                                        Preparar para flasheo automático
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        class="w-full rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:from-emerald-300 hover:via-cyan-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
                    >
                        Guardar configuración del ESP32
                    </button>
                </form>
            </section>

            <section class="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs uppercase tracking-widest text-white/50">Acceso al panel</p>
                        <h2 class="text-2xl font-semibold text-white">Credenciales de demostración</h2>
                        <p class="mt-2 text-sm text-white/60">
                            Define las credenciales que se usarán para ingresar al panel. Cambia estos valores después de cada demostración.
                        </p>
                    </div>
                    <span class="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">Demo</span>
                </div>

                <form action="{{ route('settings.demo.update') }}" method="POST" class="mt-6 space-y-5">
                    @csrf
                    @method('PUT')

                    <div>
                        <label for="demo-username" class="text-xs uppercase tracking-widest text-white/50">Usuario</label>
                        <input
                            id="demo-username"
                            name="username"
                            type="text"
                            value="{{ old('username', $demo['username'] ?? '') }}"
                            required
                            class="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                        >
                    </div>
                    <div>
                        <label for="demo-password" class="text-xs uppercase tracking-widest text-white/50">Contraseña</label>
                        <input
                            id="demo-password"
                            name="password"
                            type="password"
                            value="{{ old('password') }}"
                            autocomplete="new-password"
                            placeholder="••••••••"
                            class="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                        >
                        <p class="mt-2 text-xs text-white/50">Deja este campo vacío para conservar la contraseña actual.</p>
                    </div>

                    <button
                        type="submit"
                        class="w-full rounded-2xl bg-gradient-to-r from-indigo-400 via-blue-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-300 hover:via-blue-400 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-indigo-300/60"
                    >
                        Guardar credenciales de demo
                    </button>
                </form>

                <div class="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                    Consejo: comparte estas credenciales solo durante presentaciones controladas. Para la versión final, conecta el panel a un sistema de usuarios real.
                </div>
            </section>

            <section class="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur lg:col-span-2">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs uppercase tracking-widest text-white/50">Dispositivos registrados</p>
                        <h2 class="text-2xl font-semibold text-white">ESP32 detectados</h2>
                        <p class="mt-2 text-sm text-white/60">
                            Cada módulo se auto-registra la primera vez que inicia. El listado se actualiza automáticamente cuando un nuevo dispositivo envía su MAC.
                        </p>
                    </div>
                </div>

                <div class="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    @if ($devices->isEmpty())
                        <div class="px-6 py-8 text-center text-sm text-white/60">
                            Aún no hay dispositivos registrados. Enciende tu ESP32 para que se registre automáticamente.
                        </div>
                    @else
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-white/5 text-sm text-white/80">
                                <thead>
                                    <tr>
                                        <th class="px-6 py-3 text-left font-semibold uppercase tracking-widest text-white/50">ID</th>
                                        <th class="px-6 py-3 text-left font-semibold uppercase tracking-widest text-white/50">MAC</th>
                                        <th class="px-6 py-3 text-left font-semibold uppercase tracking-widest text-white/50">Nombre</th>
                                        <th class="px-6 py-3 text-left font-semibold uppercase tracking-widest text-white/50">Firmware</th>
                                        <th class="px-6 py-3 text-left font-semibold uppercase tracking-widest text-white/50">IP reportada</th>
                                        <th class="px-6 py-3 text-left font-semibold uppercase tracking-widest text-white/50">Tópico</th>
                                        <th class="px-6 py-3 text-left font-semibold uppercase tracking-widest text-white/50">Token</th>
                                        <th class="px-6 py-3 text-left font-semibold uppercase tracking-widest text-white/50">Tipo</th>
                                        <th class="px-6 py-3 text-left font-semibold uppercase tracking-widest text-white/50">Cmd</th>
                                        <th class="px-6 py-3 text-left font-semibold uppercase tracking-widest text-white/50">Estado</th>
                                        <th class="px-6 py-3 text-left font-semibold uppercase tracking-widest text-white/50">Último ping</th>
                                        <th class="px-6 py-3 text-left font-semibold uppercase tracking-widest text-white/50">Última telemetría</th>
                                        <th class="px-6 py-3 text-left font-semibold uppercase tracking-widest text-white/50">Registrado</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-white/5">
                                    @foreach ($devices as $device)
                                        <tr class="hover:bg-white/5">
                                            <td class="px-6 py-4 font-semibold text-white/80">#{{ $device->id }}</td>
                                            <td class="px-6 py-4 font-mono text-xs text-cyan-200">{{ $device->mac }}</td>
                                            <td class="px-6 py-4">{{ $device->name ?? '—' }}</td>
                                            <td class="px-6 py-4">{{ $device->firmware ?? '—' }}</td>
                                            <td class="px-6 py-4">{{ $device->ip ?? '—' }}</td>
                                            <td class="px-6 py-4 text-xs text-white/70">{{ $device->topic ?? '—' }}</td>
                                            <td class="px-6 py-4">
                                                @if ($device->token)
                                                    @php
                                                        $tokenPreview = strlen($device->token) > 12
                                                            ? substr($device->token, 0, 4) . '…' . substr($device->token, -4)
                                                            : $device->token;
                                                    @endphp
                                                    <div class="flex items-center gap-2">
                                                        <span class="font-mono text-xs text-white/70">{{ $tokenPreview }}</span>
                                                        <button
                                                            type="button"
                                                            class="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
                                                            data-copy-value="{{ $device->token }}"
                                                            data-copy-label="Token copiado"
                                                        >
                                                            Copiar
                                                        </button>
                                                    </div>
                                                @else
                                                    <span class="text-xs text-white/50">—</span>
                                                @endif
                                            </td>
                                            <td class="px-6 py-4 text-xs uppercase tracking-widest text-white/60">{{ strtoupper($device->connection_type ?? 'HTTP') }}</td>
                                            <td class="px-6 py-4 text-xs font-semibold {{ $device->should_run ? 'text-emerald-300' : 'text-slate-300' }}">
                                                {{ $device->should_run ? 'ON' : 'OFF' }}
                                            </td>
                                            <td class="px-6 py-4 text-xs font-semibold {{ $device->reported_is_on === null ? 'text-white/50' : ($device->reported_is_on ? 'text-emerald-200' : 'text-rose-200') }}">
                                                {{ $device->reported_is_on === null ? '—' : ($device->reported_is_on ? 'ON' : 'OFF') }}
                                            </td>
                                            <td class="px-6 py-4 text-xs text-white/60">
                                                {{ optional($device->last_seen_at)->diffForHumans() ?? '—' }}
                                            </td>
                                            <td class="px-6 py-4 text-xs text-white/60">
                                                {{ optional($device->last_telemetry_at)->diffForHumans() ?? '—' }}
                                            </td>
                                            <td class="px-6 py-4 text-xs text-white/60">
                                                {{ optional($device->created_at)->format('d/m/Y H:i') }}
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @endif
                </div>
            </section>
        </div>
    </div>
@endsection

@push('scripts')
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const copyButtons = document.querySelectorAll('[data-copy-value]');

            const writeToClipboard = async (value) => {
                try {
                    await navigator.clipboard.writeText(value);
                    return true;
                } catch (error) {
                    console.error('Clipboard error', error);
                    return false;
                }
            };

            copyButtons.forEach((btn) => {
                btn.dataset.originalLabel = btn.dataset.originalLabel || btn.textContent.trim();

                btn.addEventListener('click', async () => {
                    const value = btn.dataset.copyValue;
                    if (!value) {
                        return;
                    }

                    const ok = await writeToClipboard(value);
                    if (!ok) {
                        return;
                    }

                    const successLabel = btn.dataset.copyLabel || 'Copiado';
                    btn.textContent = successLabel;
                    btn.disabled = true;

                    setTimeout(() => {
                        btn.textContent = btn.dataset.originalLabel;
                        btn.disabled = false;
                    }, 1600);
                });
            });
        });
    </script>
@endpush
