@extends('layouts.app')

@section('title', 'Documentación rápida')

@section('content')
    @push('head')
        <style>
            @media (prefers-reduced-motion: no-preference) {
                [data-reveal] { opacity: 0; transform: translateY(12px); transition: opacity .4s ease, transform .4s ease; }
                [data-reveal].is-visible { opacity: 1; transform: none; }
            }
            .doc-card { transition: transform .25s ease, box-shadow .25s ease; }
            .doc-card:hover { transform: translateY(-2px); }
        </style>
    @endpush

    <a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-xl focus:bg-cyan-600 focus:px-4 focus:py-2 focus:text-white">
        Saltar al contenido principal
    </a>

    <div class="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div class="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-12 lg:py-12">
            <header class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <nav aria-label="Migas" class="text-sm text-white/60">
                    <ol class="flex items-center gap-2">
                        <li><a class="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500" href="/">Inicio</a></li>
                        <li aria-hidden="true" class="text-white/30">/</li>
                        <li class="text-white">Documentación</li>
                    </ol>
                </nav>
                <div class="flex flex-wrap items-center gap-2">
                    <button id="printPage" type="button" class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 backdrop-blur transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500">
                        Imprimir / PDF
                    </button>
                    <a href="#overview" class="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 backdrop-blur transition hover:bg-cyan-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500">
                        Ir al inicio
                    </a>
                    <button data-cmdk-open type="button" class="rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/10 px-3 py-2 text-xs font-semibold text-fuchsia-100 backdrop-blur transition hover:border-fuchsia-300/60 hover:bg-fuchsia-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500">
                        Paleta de comandos <span class="ml-2 hidden rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/70 sm:inline-block">Ctrl/⌘ + K</span>
                    </button>
                </div>
            </header>

            <div class="flex flex-col gap-10 lg:flex-row lg:items-start">
                <aside class="w-full rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur lg:sticky lg:top-8 lg:w-64" aria-label="Índice de la página">
                    <p class="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">Índice</p>
                    <nav class="mt-4 space-y-1 text-sm text-white/70" id="toc">
                        <a class="block rounded-2xl px-4 py-2 transition hover:bg-cyan-500/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500" href="#overview">Visión general</a>
                        <a class="block rounded-2xl px-4 py-2 transition hover:bg-cyan-500/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500" href="#setup">Arranque rápido</a>
                        <a class="block rounded-2xl px-4 py-2 transition hover:bg-cyan-500/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500" href="#dashboard">Uso diario</a>
                        <a class="block rounded-2xl px-4 py-2 transition hover:bg-cyan-500/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500" href="#esp32">Integración ESP32</a>
                        <a class="block rounded-2xl px-4 py-2 transition hover:bg-cyan-500/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500" href="#api">API esencial</a>
                        <a class="block rounded-2xl px-4 py-2 transition hover:bg-cyan-500/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500" href="#faq">Preguntas frecuentes</a>
                    </nav>
                </aside>

                <main id="main" class="flex-1 space-y-16">
                    <section id="overview" class="rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur" data-reveal>
                        <span class="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-100">Manual</span>
                        <h1 class="mt-6 text-4xl font-semibold tracking-tight">Panel IoT para sistema de bombeo</h1>
                        <p class="mt-4 text-base text-white/70">
                            Este documento explica cómo levantar el panel, cómo operarlo a diario y cómo vincular un ESP32 sin pasos complicados.
                            Todo el flujo se basa en los controladores de Laravel ubicados en <code>routes/web.php</code> y <code>routes/api.php</code>.
                        </p>
                        <dl class="mt-8 grid gap-6 sm:grid-cols-2">
                            <div class="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6">
                                <dt class="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Qué incluye</dt>
                                <dd class="mt-2 text-sm text-emerald-50">Dashboard animado (<code>resources/views/dashboard.blade.php</code>), simulación de bomba y stream SSE para telemetría real.</dd>
                            </div>
                            <div class="rounded-2xl border border-indigo-500/40 bg-indigo-500/10 p-6">
                                <dt class="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200">A quién va dirigido</dt>
                                <dd class="mt-2 text-sm text-indigo-50">Integradores IoT, personal de mantenimiento y desarrolladores que necesitan conectar un ESP32 sin rehacer la interfaz.</dd>
                            </div>
                        </dl>
                    </section>

                    <section id="setup" class="rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur" data-reveal>
                        <h2 class="text-3xl font-semibold tracking-tight">Arranque rápido (10 minutos)</h2>
                        <ol class="mt-6 space-y-3 text-sm text-white/80">
                            <li><strong>Clona y prepara entorno.</strong> Copia <code>.env.example</code> a <code>.env</code>, luego ejecuta <code>composer install</code> y <code>npm install</code>.</li>
                            <li><strong>Genera la APP_KEY.</strong> Ejecuta <code>php artisan key:generate</code>.</li>
                            <li><strong>Migra la base.</strong> Corre <code>php artisan migrate --seed</code> para crear tablas y un usuario de prueba (ver <code>database/seeders/DatabaseSeeder.php</code>).</li>
                            <li><strong>Arranca servicios.</strong> En dos terminales lanza <code>npm run dev</code> y <code>php artisan serve</code>. El panel queda disponible en <code>http://localhost:8000</code>.</li>
                            <li><strong>Inicia sesión.</strong> Usa las credenciales almacenadas en <code>config/demo.php</code> (por defecto <code>demo / demo</code>). Puedes cambiarlas desde <em>Configuración → Demo</em>, que persiste en <code>storage/app/settings.json</code> gracias a <code>App\Services\SettingsRepository</code>.</li>
                        </ol>
                        <p class="mt-6 text-sm text-white/60">¿Compilación para producción? Ejecuta <code>npm run build</code> y <code>php artisan optimize</code> antes de desplegar.</p>
                    </section>

                    <section id="dashboard" class="rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur" data-reveal>
                        <h2 class="text-3xl font-semibold tracking-tight">Uso diario del panel</h2>
                        <div class="mt-6 grid gap-6 lg:grid-cols-2">
                            <article class="doc-card rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-6">
                                <h3 class="text-lg font-semibold text-cyan-100">Dashboard</h3>
                                <ul class="mt-3 space-y-2 text-sm text-cyan-50/90">
                                    <li>• Switch ON/OFF sincronizado con el backend (`App\Http\Controllers\PumpSimulationController`).</li>
                                    <li>• Widgets que muestran voltaje, corriente, UPS y temperatura; se actualizan por SSE (`resources/js/dashboard.js`).</li>
                                    <li>• Tarjetas hidráulicas calculadas por `App\Jobs\ProcessTelemetry` cuando llega telemetría real.</li>
                                </ul>
                            </article>
                            <article class="doc-card rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6">
                                <h3 class="text-lg font-semibold text-emerald-100">Configuración</h3>
                                <ul class="mt-3 space-y-2 text-sm text-emerald-50/90">
                                    <li>• En <em>/settings</em> ajusta WiFi, endpoints y modo de activación del ESP32 (`resources/views/settings/edit.blade.php`).</li>
                                    <li>• El formulario escribe en `storage/app/settings.json`; se combina con `config/device.php`.</li>
                                    <li>• También puedes actualizar el fluido de proceso y ver un resumen de dispositivos registrados.</li>
                                </ul>
                            </article>
                        </div>
                    </section>

                    <section id="esp32" class="rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur" data-reveal>
                        <h2 class="text-3xl font-semibold tracking-tight">Integración ESP32 en 4 pasos</h2>
                        <p class="mt-4 text-sm text-white/70">Sigue este camino para conectar el hardware sin complicaciones. Todos los endpoints están definidos en <code>routes/api.php</code>.</p>
                        <div class="mt-8 space-y-6">
                            <div class="rounded-2xl border border-white/10 bg-white/10 p-6">
                                <h3 class="text-lg font-semibold">1. Preparar el panel</h3>
                                <p class="mt-2 text-sm text-white/70">Activa <code>ESP32_ENABLED=true</code> en <code>.env</code> y ejecuta <code>php artisan config:clear</code>. Desde la vista de configuración confirma que el estado cambió a “Listo”.</p>
                                <p class="mt-2 text-sm text-white/50">Esta bandera alimenta <code>config/device.php</code> y se muestra en la UI mediante `App\Services\SettingsRepository`.</p>
                            </div>
                            <div class="rounded-2xl border border-white/10 bg-white/10 p-6">
                                <h3 class="text-lg font-semibold">2. Registrar el dispositivo</h3>
                                <p class="mt-2 text-sm text-white/70">Haz un <code>POST /api/devices/register</code> con la MAC y un nombre. `App\Http\Controllers\Api\DeviceRegistrationController` generará el token y devolverá los endpoints listos para tu firmware.</p>
                                <pre class="mt-4 overflow-x-auto rounded-2xl bg-black/50 p-4 text-xs text-white/80"><code>curl -X POST https://tu-panel/api/devices/register \
  -H "Content-Type: application/json" \
  -d '{"mac":"AA:BB:CC:DD:EE:FF","name":"ESP32 bomba","connection_type":"http"}'</code></pre>
                            </div>
                            <div class="rounded-2xl border border-white/10 bg-white/10 p-6">
                                <h3 class="text-lg font-semibold">3. Polling del estado</h3>
                                <p class="mt-2 text-sm text-white/70">Consulta <code>GET /api/pump/state?device_id={id}</code> enviando <code>Authorization: Bearer &lt;token&gt;</code>. El middleware `App\Http\Middleware\EnsureDeviceTokenIsValid` valida el acceso y `App\Http\Controllers\Api\PumpStateController` responde con <code>command</code> (<code>on</code> / <code>off</code>).</p>
                                <pre class="mt-4 overflow-x-auto rounded-2xl bg-black/50 p-4 text-xs text-white/80"><code>curl "https://tu-panel/api/pump/state?device_id=1" \
  -H "Authorization: Bearer $TOKEN"</code></pre>
                            </div>
                            <div class="rounded-2xl border border-white/10 bg-white/10 p-6">
                                <h3 class="text-lg font-semibold">4. Enviar telemetría</h3>
                                <p class="mt-2 text-sm text-white/70">Envía lecturas básicas con <code>POST /api/telemetry</code>. El controlador `App\Http\Controllers\Api\TelemetryController` valida y despacha <code>App\Jobs\ProcessTelemetry</code>, que calcula hidráulica y actualiza el dashboard en vivo (`resources/js/dashboard.js`).</p>
                                <pre class="mt-4 overflow-x-auto rounded-2xl bg-black/50 p-4 text-xs text-white/80"><code>curl -X POST https://tu-panel/api/telemetry \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"device_id":1,"telemetry":{"voltage":220.4,"current":3.6,"is_on":true}}'</code></pre>
                                <p class="mt-4 text-xs text-white/50">Consejo: si todavía no tienes firmware, ejecuta estos comandos manualmente para probar el flujo.</p>
                            </div>
                        </div>
                        <p class="mt-6 text-sm text-white/60">Preferencias WiFi, token y modo MQTT se editan desde el panel y se guardan en <code>storage/app/settings.json</code>.</p>
                    </section>

                    <section id="api" class="rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur" data-reveal>
                        <h2 class="text-3xl font-semibold tracking-tight">API esencial</h2>
                        <div class="mt-6 overflow-hidden rounded-2xl border border-white/10">
                            <table class="min-w-full divide-y divide-white/10 text-left text-sm text-white/80">
                                <thead class="bg-white/5 text-xs uppercase tracking-wide text-white/60">
                                    <tr>
                                        <th class="px-4 py-3">Método</th>
                                        <th class="px-4 py-3">Ruta</th>
                                        <th class="px-4 py-3">Controlador</th>
                                        <th class="px-4 py-3">Descripción</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-white/5">
                                    <tr>
                                        <td class="px-4 py-3 font-mono">POST</td>
                                        <td class="px-4 py-3 font-mono">/api/devices/register</td>
                                        <td class="px-4 py-3">DeviceRegistrationController</td>
                                        <td class="px-4 py-3">Registra/actualiza la MAC, genera token y responde con endpoints personalizados.</td>
                                    </tr>
                                    <tr>
                                        <td class="px-4 py-3 font-mono">GET</td>
                                        <td class="px-4 py-3 font-mono">/api/pump/state</td>
                                        <td class="px-4 py-3">PumpStateController</td>
                                        <td class="px-4 py-3">Devuelve <code>should_run</code> y el comando actual para el relé.</td>
                                    </tr>
                                    <tr>
                                        <td class="px-4 py-3 font-mono">POST</td>
                                        <td class="px-4 py-3 font-mono">/api/pump/set</td>
                                        <td class="px-4 py-3">PumpSetController</td>
                                        <td class="px-4 py-3">Permite a un administrador forzar ON/OFF desde el panel (requiere `auth:sanctum`).</td>
                                    </tr>
                                    <tr>
                                        <td class="px-4 py-3 font-mono">POST</td>
                                        <td class="px-4 py-3 font-mono">/api/telemetry</td>
                                        <td class="px-4 py-3">TelemetryController</td>
                                        <td class="px-4 py-3">Recibe lecturas (voltaje, corriente, flujo, etc.) y las procesa en segundo plano.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p class="mt-4 text-xs text-white/60">Todas las rutas comparten el middleware `api` y las de dispositivos aplican `App\Http\Middleware\EnsureDeviceTokenIsValid`.</p>
                    </section>

                    <section id="faq" class="rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur" data-reveal>
                        <h2 class="text-3xl font-semibold tracking-tight">Preguntas frecuentes</h2>
                        <dl class="mt-6 space-y-4 text-sm text-white/75">
                            <div>
                                <dt class="font-semibold text-white">¿Qué pasa si pierdo el archivo <code>vendor/</code>?</dt>
                                <dd class="mt-1 text-white/70">Ejecuta <code>composer install</code>. Laravel necesita <code>vendor/autoload.php</code> para cualquier comando de Artisan.</dd>
                            </div>
                            <div>
                                <dt class="font-semibold text-white">¿Puedo operar sin ESP32 conectado?</dt>
                                <dd class="mt-1 text-white/70">Sí. El simulador (`App\Http\Controllers\PumpSimulationController`) genera lecturas ficticias hasta que el ESP32 envía telemetría real.</dd>
                            </div>
                            <div>
                                <dt class="font-semibold text-white">¿Dónde cambio la red WiFi del módulo?</dt>
                                <dd class="mt-1 text-white/70">En <em>Configuración → ESP32</em>. El formulario escribe en <code>storage/app/settings.json</code> y el firmware puede leerlo cuando se registra.</dd>
                            </div>
                        </dl>
                    </section>
                </main>
            </div>
        </div>
    </div>
@endsection
