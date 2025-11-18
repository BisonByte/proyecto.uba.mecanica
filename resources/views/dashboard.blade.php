@extends('layouts.app')

@section('title', 'Control IoT • Dashboard')

@push('head')
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.6/dist/chart.umd.min.js" defer></script>
@endpush

@section('content')
    @php
        $isOn = $pumpState['isOn'];
        $statusOn = 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-200';
        $statusOff = 'border border-rose-500/30 bg-rose-500/10 text-rose-200';
        $toggleBase = 'group relative flex h-28 w-28 items-center justify-center rounded-full text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-white/20 shadow-lg btn-pump';
        $toggleOn = 'btn-pump--on bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 text-emerald-50 shadow-emerald-500/40';
        $toggleOff = 'btn-pump--off bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white/90 shadow-slate-900/40';
        $esp32Enabled = (bool) ($esp32Config['enabled'] ?? false);
        $activationMode = strtoupper($esp32Config['activation_mode'] ?? 'http');
        $activationTag = $esp32Enabled ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/40 bg-amber-500/10 text-amber-200';
        $fluidSelection = $fluidProperties['selected'] ?? [];
        $fluidSelectedKey = $fluidProperties['selected_key'] ?? null;
        $fluidCatalog = $fluidProperties['catalog'] ?? [];
        $fluidAlternatives = $fluidProperties['alternatives'] ?? [];
        $fluidSummaryProperties = array_slice($fluidSelection['properties'] ?? [], 0, 2);

    @endphp

    <div
        id="dashboard-app"
        data-state="@json($pumpState)"
        data-metrics="@json($metricsSeed)"
        data-telemetry="@json($telemetry)"
        data-measurement="@json($measurement)"
        data-device="@json($deviceMeta)"
        data-endpoints='@json($endpoints)'
        data-hydraulic-url="{{ route('hydraulic.designer.root') }}"
        class="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        @if (session('fluid_status'))
            <div class="mb-6 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 px-6 py-5 text-sm text-cyan-100 shadow-lg shadow-cyan-500/20">
                {{ session('fluid_status') }}
            </div>
        @endif

        <header class="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:mb-12">
            <div class="space-y-3 lg:flex-1">
                <div class="flex items-center gap-3">
                    <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/10 via-blue-500/10 to-indigo-500/10 text-cyan-200">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M11.5 2a1 1 0 00-.8.4l-8 10A1 1 0 003.5 14h7.7l-1.6 6.4a1 1 0 001.8.8l8-10A1 1 0 0018.5 9h-7.7l1.6-6.4A1 1 0 0011.5 2z" /></svg>
                    </div>
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-[0.4em] text-cyan-200">proyecto bisonbyte</p>
                        <h1 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Centro de control IoT</h1>
                    </div>
                </div>
                <p class="max-w-xl text-sm text-white/70">
                    Monitoriza en tiempo real el estado de la bomba usando telemetría HTTP enviada por el ESP32.
                    El panel sincroniza comandos y lectura de datos sin necesidad de refrescar la página.
                </p>
            </div>

            <div class="flex w-full flex-col gap-4 self-stretch lg:w-auto lg:max-w-md">
                <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                    <a
                        href="{{ route('fluid.calculator') }}"
                        class="inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-emerald-100 transition hover:border-emerald-400/60 hover:bg-emerald-500/20 sm:w-auto sm:justify-start"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm0 2h8v2H6V4zm0 4h2v2H6V8zm0 4h2v2H6v-2zm4-4h4v2h-4V8zm0 4h4v2h-4v-2z"/></svg>
                        Calculadora de fluidos
                    </a>
                    <a
                        href="{{ route('hydraulic.designer.root') }}"
                        class="inline-flex w-full items-center justify-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-indigo-100 transition hover:border-indigo-400/60 hover:bg-indigo-500/20 sm:w-auto sm:justify-start"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 3a1 1 0 011-1h10a1 1 0 011 1v3h-2V4H6v12h8v-2h2v3a1 1 0 01-1 1H5a1 1 0 01-1-1V3zm5.293 7.293a1 1 0 011.414 0L12 11.586V9a1 1 0 112 0v5a1 1 0 01-1 1H8a1 1 0 110-2h3.586l-1.293-1.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                        Diseñador hidráulico
                    </a>
                    <a
                        href="{{ route('settings.edit') }}"
                        class="inline-flex w-full items-center justify-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-cyan-100 transition hover:border-cyan-400/60 hover:bg-cyan-500/20 sm:w-auto sm:justify-start"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M11.983 1.272a1 1 0 00-1.966 0l-.208 1.248a7.032 7.032 0 00-1.538.889l-1.15-.459a1 1 0 00-1.115.324L4.12 5.16a1 1 0 00.004 1.23l.796.98a6.99 6.99 0 000 1.26l-.796.98a1 1 0 00-.003 1.23l1.89 2.036a1 1 0 001.114.324l1.15-.459c.482.36 1 .662 1.538.889l.208 1.248a1 1 0 001.966 0l.208-1.248a7.046 7.046 0 001.538-.889l1.15.459a1 1 0 001.114-.324l1.89-2.036a1 1 0 00-.003-1.23l-.796-.98a6.99 6.99 0 000-1.26l.796-.98a1 1 0 00.004-1.23l-1.89-2.036a1 1 0 00-1.115-.324l-1.15.459a7.046 7.046 0 00-1.538-.889l-.208-1.248zM10 12a2 2 0 110-4 2 2 0 010 4z" /></svg>
                        Configuración
                    </a>
                    <a
                        href="{{ route('documentation') }}"
                        class="inline-flex w-full items-center justify-center gap-2 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-fuchsia-100 transition hover:border-fuchsia-300/60 hover:bg-fuchsia-500/20 sm:w-auto sm:justify-start"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4 3.5A1.5 1.5 0 015.5 2h9A1.5 1.5 0 0116 3.5v13a.5.5 0 01-.757.429L10 13.381l-5.243 3.548A.5.5 0 014 16.5v-13z" clip-rule="evenodd" />
                        </svg>
                        Documentación
                    </a>
                </div>
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <span
                        data-device-badge
                        class="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center text-xs font-medium text-white/70 sm:w-auto sm:text-right"
                    >
                        @if ($deviceMeta)
                            <span class="mr-2 inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-100">
                                <span class="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                                En línea
                            </span>
                            ESP32 #{{ $deviceMeta['id'] }} • {{ $deviceMeta['lastSeenAt'] ? \Illuminate\Support\Carbon::parse($deviceMeta['lastSeenAt'])->diffForHumans() : 'registrado' }}
                        @else
                            Esperando registro del ESP32
                        @endif
                    </span>
                    <form action="{{ route('logout') }}" method="POST" class="w-full sm:ml-4 sm:w-auto">
                        @csrf
                        <button
                            type="submit"
                            class="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/80 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-200 sm:w-auto"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 4.5A1.5 1.5 0 014.5 3h5A1.5 1.5 0 0111 4.5v1a.5.5 0 01-1 0v-1a.5.5 0 00-.5-.5h-5a.5.5 0 00-.5.5v11a.5.5 0 00.5.5h5a.5.5 0 00.5-.5v-1a.5.5 0 011 0v1A1.5 1.5 0 019.5 17h-5A1.5 1.5 0 013 15.5v-11zM13.854 6.146a.5.5 0 10-.708.708L14.293 8H8.5a.5.5 0 000 1h5.793l-1.147 1.146a.5.5 0 10.708.708l2-2a.5.5 0 000-.708l-2-2z" clip-rule="evenodd" /></svg>
                            Salir
                        </button>
                    </form>
                </div>
            </div>
        </header>

        @if ($justLoggedIn)
            <div class="mb-8 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 px-6 py-5 text-sm text-cyan-100 shadow-lg shadow-cyan-500/20">
                ¡Bienvenido al demo! Todos los datos visibles están generados por el simulador de Laravel. La versión
                productiva podrá direccionar comandos al ESP32 mediante API REST o MQTT.
            </div>
        @endif

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <aside class="lg:col-span-3 space-y-5">
                <div class="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <h2 class="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">Sistema</h2>
                    <div class="mt-4 space-y-3 text-sm text-white/70">
                        <p class="flex items-center justify-between">
                            <span class="text-white/60">Identificador</span>
                            <span class="font-semibold text-white">BB-PUMP-01</span>
                        </p>
                        <p class="flex items-center justify-between">
                            <span class="text-white/60">Modo demo</span>
                            <span class="flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-xs font-medium text-cyan-200">
                                <span class="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse"></span>
                                Activo
                            </span>
                        </p>
                        <p class="flex items-center justify-between">
                            <span class="text-white/60">Último despliegue</span>
                            <span class="font-semibold text-white">{{ now()->format('d/m/Y') }}</span>
                        </p>
                    </div>
                </div>

                <div class="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <h2 class="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">Conectividad</h2>
                    <ul class="mt-4 space-y-3 text-sm text-white/70">
                        <li class="flex items-start gap-3">
                            <div class="mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-200">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2.166 10.63a.75.75 0 001.06.104 6.5 6.5 0 018.548 0 .75.75 0 00.955-1.164 8 8 0 00-10.53 0 .75.75 0 00-.104 1.06zm2.143 2.572a.75.75 0 001.055-.11 3.5 3.5 0 014.272-.71.75.75 0 10.73-1.318 5 5 0 00-6.102 1.014.75.75 0 00.044 1.124zm2.06 2.328a1.75 1.75 0 112.472 0 1.75 1.75 0 01-2.471 0z" /></svg>
                            </div>
                            <div>
                                <p class="font-semibold text-white">WiFi segura con ESP32</p>
                                <p class="text-xs text-white/60">El firmware recibirá las órdenes desde esta misma vista a través de HTTP o MQTT.</p>
                            </div>
                        </li>
                        <li class="flex items-start gap-3">
                            <div class="mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-200">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 00-1 1v1H7a2 2 0 00-2 2v9.382a1.5 1.5 0 102 0V12h6v3.382a1.5 1.5 0 102 0V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H9V3a1 1 0 00-1-1z" /></svg>
                            </div>
                            <div>
                                <p class="font-semibold text-white">Relé industrial 30A</p>
                                <p class="text-xs text-white/60">Canal preparado para manejar cargas de hasta 3HP con paro de emergencia.</p>
                            </div>
                        </li>
                    </ul>
                </div>

                <div class="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <h2 class="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">Siguiente fase</h2>
                    <ul class="mt-4 space-y-2 text-sm text-white/70">
                        <li class="flex items-center gap-2">
                            <span class="h-1.5 w-1.5 rounded-full bg-white/30"></span>
                            Integración de sensores de presión y caudal.
                        </li>
                        <li class="flex items-center gap-2">
                            <span class="h-1.5 w-1.5 rounded-full bg-white/30"></span>
                            Alertas automáticas por WhatsApp y correo.
                        </li>
                        <li class="flex items-center gap-2">
                            <span class="h-1.5 w-1.5 rounded-full bg-white/30"></span>
                            Históricos con reportes descargables en PDF.
                        </li>
                    </ul>
                </div>
            </aside>

            <section class="space-y-8">
                <div class="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    <div class="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                        <div class="flex items-start justify-between gap-4">
                            <div>
                                <p class="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">Estado general</p>
                                <h2 class="mt-2 text-2xl font-semibold text-white">Control principal</h2>
                            </div>
                            <span
                                data-pump-status
                                data-on-class="{{ $statusOn }}"
                                data-off-class="{{ $statusOff }}"
                                class="inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide {{ $isOn ? $statusOn : $statusOff }}"
                            >
                                <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
                                <span data-pump-status-text>{{ $pumpState['statusLabel'] }}</span>
                            </span>
                        </div>
                        <p class="mt-4 text-sm text-white/60" data-pump-description>
                            {{
                                $isOn
                                    ? 'La bomba está energizada y el sistema distribuye el caudal programado. Supervisa las métricas para validar operación segura.'
                                    : 'La bomba se encuentra apagada. Puedes iniciar el ciclo en cualquier momento y el sistema empezará a transmitir telemetría.'
                            }}
                        </p>
                        <div class="mt-8 flex flex-col gap-6 xl:flex-row xl:items-center">
                            <button
                                type="button"
                                data-pump-toggle
                                data-on-class="{{ $toggleOn }}"
                                data-off-class="{{ $toggleOff }}"
                                aria-pressed="{{ $isOn ? 'true' : 'false' }}"
                                class="{{ $toggleBase }} {{ $isOn ? $toggleOn : $toggleOff }}"
                            >
                                <span class="absolute inset-0 -z-10 rounded-full border border-white/10 blur-xl transition group-hover:border-white/30"></span>
                                <span class="text-center text-base font-semibold">
                                    <span data-pump-toggle-label>{{ $isOn ? 'Apagar bomba' : 'Encender bomba' }}</span>
                                </span>
                            </button>
                            <div class="grid gap-4 text-sm text-white/70 sm:grid-cols-2 xl:grid-cols-1">
                                <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                    <p class="text-xs uppercase tracking-widest text-white/50">Último cambio</p>
                                    <p class="mt-1 text-sm font-semibold text-white" data-last-changed>{{ $pumpState['lastChangedHuman'] }}</p>
                                </div>
                                <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                    <p class="text-xs uppercase tracking-widest text-white/50">Tiempo operativo</p>
                                    <p class="mt-1 text-sm font-semibold text-white" data-runtime>{{ $pumpState['totalRuntimeFormatted'] }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="lg:col-span-12 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                        <p class="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">Diagnóstico</p>
                        <h2 class="mt-2 text-2xl font-semibold text-white">Resumen del simulador</h2>
                        <div class="mt-6 space-y-5 text-sm text-white/70">
                            <div class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                <div>
                                    <p class="text-xs uppercase tracking-widest text-white/50">Modo de operación</p>
                                    <p class="text-sm font-semibold text-white">Simulación controlada</p>
                                </div>
                                <span class="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1 text-xs font-medium text-cyan-200">100% software</span>
                            </div>
                            
                            <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                                <p class="text-xs uppercase tracking-widest text-white/50">Notas</p>
                                <ul class="mt-2 space-y-1">
                                    <li>• Los comandos ON/OFF ya envían el evento al simulador de sesión.</li>
                                    <li>• Las métricas de voltaje, corriente y UPS se actualizan cada pocos segundos.</li>
                                    <li>• Preparado para conectar con endpoints REST o MQTT sin refactor mayor.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                        <div class="flex items-start justify-between gap-4">
                            <div>
                                <p class="text-xs uppercase tracking-[0.4em] text-white/60">Fluido operativo</p>
                                <h2 class="mt-2 text-2xl font-semibold text-white">{{ $fluidSelection['name'] ?? 'Sin selección' }}</h2>
                                <p class="mt-2 text-sm text-white/60">
                                    {{ $fluidSelection['description'] ?? 'Selecciona un fluido para visualizar densidad, viscosidad y ventanas de operación.' }}
                                </p>
                            </div>
                            @if (! empty($fluidSelection['status']))
                                <span class="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-100">
                                    {{ $fluidSelection['status'] }}
                                </span>
                            @endif
                        </div>
                        <dl class="mt-6 grid gap-3 text-sm text-white/70 sm:grid-cols-2">
                            @forelse($fluidSummaryProperties as $property)
                                <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                    <dt class="text-xs uppercase tracking-widest text-white/50">{{ $property['label'] ?? 'Propiedad' }}</dt>
                                    <dd class="mt-1 font-semibold text-white">{{ $property['value'] ?? '---' }}</dd>
                                </div>
                            @empty
                                <div class="sm:col-span-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
                                    {{ __('No hay propiedades registradas para este fluido.') }}
                                </div>
                            @endforelse
                        </dl>
                        <div class="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
                            <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                <span class="h-1.5 w-1.5 rounded-full bg-emerald-300"></span>
                                Gestión centralizada de fluidos
                            </span>
                            <button
                                type="button"
                                data-fluid-open
                                aria-controls="fluid-panel"
                                aria-haspopup="dialog"
                                aria-expanded="false"
                                class="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-cyan-100 transition hover:border-cyan-400/60 hover:bg-cyan-500/20"
                            >
                                Configurar fluido
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l5 5a.999.999 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 11H3a1 1 0 110-2h10.586l-3.293-3.293a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                    <h2 class="text-2xl font-semibold text-white">Visualización de la Bomba</h2>
                    <div class="mt-6 w-full">
                        <div class="aspect-w-16 aspect-h-9 rounded-lg bg-slate-900/50">
                            <canvas id="pumpCanvas" class="w-full h-full"></canvas>
                        </div>
                    </div>
                </div>

                <div class="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                    <div class="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                        <div class="flex items-center justify-between">
                            <p class="text-xs uppercase tracking-widest text-white/50">Voltaje de entrada</p>
                            <span class="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-cyan-200">AC</span>
                        </div>
                        <p class="mt-4 text-4xl font-semibold text-white">
                            <span data-metric-voltage>{{ number_format($metricsSeed['voltage'], 1, '.', '') }}</span>
                            <span class="ml-1 text-base font-normal text-white/50">V</span>
                        </p>
                        <div class="mt-4 h-24">
                            <canvas id="voltage-chart"></canvas>
                        </div>
                    </div>
                    <div class="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                        <div class="flex items-center justify-between">
                            <p class="text-xs uppercase tracking-widest text-white/50">Corriente consumida</p>
                            <span class="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-200">AMP</span>
                        </div>
                        <p class="mt-4 text-4xl font-semibold text-white">
                            <span data-metric-current>{{ number_format($metricsSeed['current'], 2, '.', '') }}</span>
                            <span class="ml-1 text-base font-normal text-white/50">A</span>
                        </p>
                        <div class="mt-4 h-24">
                            <canvas id="current-chart"></canvas>
                        </div>
                    </div>
                    <div class="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                        <div class="flex items-center justify-between">
                            <p class="text-xs uppercase tracking-widest text-white/50">Batería / UPS</p>
                            <span class="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-indigo-200">Backup</span>
                        </div>
                        <p class="mt-4 text-4xl font-semibold text-white">
                            <span data-metric-battery>{{ number_format($metricsSeed['battery'], 0, '.', '') }}</span>
                            <span class="ml-1 text-base font-normal text-white/50">%</span>
                        </p>
                        <div class="mt-4">
                            <div class="h-3 overflow-hidden rounded-full bg-white/10">
                                <div class="h-full rounded-full bg-gradient-to-r from-indigo-400 via-blue-500 to-cyan-400" data-metric-battery-bar style="width: {{ min(100, max(0, (int) $metricsSeed['battery'])) }}%;"></div>
                            </div>
                        </div>
                        <div class="mt-4 h-24">
                            <canvas id="battery-chart"></canvas>
                        </div>
                    </div>
                    <div class="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                        <div>
                            <p class="text-xs uppercase tracking-widest text-white/50">Tiempo acumulado</p>
                            <p class="mt-4 text-4xl font-semibold text-white"><span data-runtime-minutes>{{ number_format($metricsSeed['totalRuntimeMinutes'], 1, '.', '') }}</span> <span class="ml-1 text-base font-normal text-white/50">min</span></p>
                        </div>
                        <div class="mt-6 space-y-2 text-xs text-white/60">
                            <p class="flex items-center justify-between">
                                <span>Duración actual</span>
                                <span data-runtime>{{ $pumpState['totalRuntimeFormatted'] }}</span>
                            </p>
                            <p class="flex items-center justify-between">
                                <span>Estado</span>
                                <span data-runtime-state>{{ $pumpState['isOn'] ? 'En ejecución' : 'En espera' }}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col lg:flex-row gap-6">
                    <div class="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-xs uppercase tracking-widest text-white/50">Tendencia eléctrica</p>
                                <h3 class="text-xl font-semibold text-white">Voltaje y corriente</h3>
                            </div>
                            <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/60">Actualizado</span>
                        </div>
                        <div class="mt-6 h-60">
                            <canvas id="telemetry-chart"></canvas>
                        </div>
                    </div>
                    <div class="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                        <div>
                            <p class="text-xs uppercase tracking-widest text-white/50">Actividades recientes</p>
                            <h3 class="text-xl font-semibold text-white">Registro del simulador</h3>
                        </div>
                        <ul class="mt-6 space-y-4 text-sm text-white/70" data-activity-log>
                            <li class="flex items-start gap-3">
                                <span class="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-white/10 text-white/60">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm.5 4a.5.5 0 00-1 0v3.25a.5.5 0 00.252.434l2.5 1.5a.5.5 0 10.496-.868L10.5 9.236V6z" /></svg>
                                </span>
                                <div>
                                    <p class="font-semibold text-white">Simulador inicializado</p>
                                    <p class="text-xs text-white/50">Tiempo operativo estimado: {{ number_format($metricsSeed['totalRuntimeMinutes'], 1, '.', '') }} minutos</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p class="text-xs uppercase tracking-widest text-white/50">Integración física</p>
                            <h3 class="text-xl font-semibold text-white">Resumen del ESP32</h3>
                            <p class="mt-2 text-sm text-white/60">
                                Supervisa el estado del módulo y accede a los parámetros completos desde el centro de configuración.
                            </p>
                        </div>
                        <span class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] {{ $activationTag }}">
                            <span class="h-1.5 w-1.5 rounded-full {{ $esp32Enabled ? 'bg-emerald-300 animate-pulse' : 'bg-amber-300' }}"></span>
                            {{ $esp32Enabled ? 'Activo' : 'Pendiente' }}
                        </span>
                    </div>
                    <dl class="mt-6 grid gap-4 text-sm text-white/70 sm:grid-cols-3">
                        <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                            <dt class="text-xs uppercase tracking-widest text-white/50">Identificador</dt>
                            <dd class="mt-1 font-semibold text-white">{{ $esp32Config['device_id'] ?? '---' }}</dd>
                        </div>
                        <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                            <dt class="text-xs uppercase tracking-widest text-white/50">Firmware</dt>
                            <dd class="mt-1 font-semibold text-white">v{{ $esp32Config['firmware_version'] ?? '1.0.0' }}</dd>
                        </div>
                        <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                            <dt class="text-xs uppercase tracking-widest text-white/50">Modo</dt>
                            <dd class="mt-1 font-semibold text-white">{{ $activationMode }}</dd>
                        </div>
                    </dl>
                    <div class="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
                        <div class="flex flex-wrap items-center gap-3">
                            <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                <span class="h-1.5 w-1.5 rounded-full bg-cyan-300"></span>
                                REST/MQTT listo
                            </span>
                            <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                <span class="h-1.5 w-1.5 rounded-full bg-indigo-300"></span>
                                Credenciales protegidas
                            </span>
                        </div>
                        <a
                            href="{{ route('settings.edit') }}"
                            class="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-cyan-100 transition hover:border-cyan-400/60 hover:bg-cyan-500/20"
                        >
                            Gestionar configuración
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l5 5a.999.999 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 11H3a1 1 0 110-2h10.586l-3.293-3.293a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                        </a>
                    </div>
                </div>

                @php
                    $initialRe = $measurement['reynolds'] ?? null;
                    $initialRegime = $initialRe ? ($initialRe < 2300 ? 'Flujo laminar' : 'Flujo turbulento') : 'Sin datos';
                    $initialDeltaP = $measurement['pressureDrop'] ?? null;
                    $initialHead = $measurement['headLoss'] ?? null;
                    $initialPower = $measurement['hydraulicPower'] ?? null;
                    $initialVelocity = $measurement['velocity'] ?? null;
                    $initialDensity = $measurement['density'] ?? null;
                    $initialViscosity = $measurement['viscosity'] ?? null;
                @endphp

                <div class="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p class="text-xs uppercase tracking-widest text-white/50">Cálculos hidráulicos en línea</p>
                            <h3 class="text-xl font-semibold text-white">Resultados a partir de la última telemetría</h3>
                            <p class="mt-2 text-sm text-white/60">
                                El servicio FluidCalculationService procesa el caudal reportado junto con las propiedades del fluido seleccionado.
                            </p>
                        </div>
                        <span class="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-200">
                            SSE
                        </span>
                    </div>

                    <div class="mt-6 grid gap-4 md:grid-cols-3">
                        <div class="rounded-2xl border border-white/10 bg-white/5 p-5" data-fluid-card="regime">
                            <p class="text-xs uppercase tracking-widest text-white/50">Régimen de flujo</p>
                            <p class="mt-3 text-2xl font-semibold text-white" data-fluid-card-regime-primary>{{ $initialRegime }}</p>
                            <p class="mt-2 text-sm text-white/60">
                                Re = <span data-fluid-card-reynolds>{{ $initialRe ? number_format($initialRe, 0, '.', ' ') : '---' }}</span>
                            </p>
                        </div>

                        <div class="rounded-2xl border border-white/10 bg-white/5 p-5" data-fluid-card="pressure">
                            <p class="text-xs uppercase tracking-widest text-white/50">Pérdida de presión ΔP</p>
                            <p class="mt-3 text-2xl font-semibold text-white">
                                <span data-fluid-card-pressure>{{ $initialDeltaP ? number_format($initialDeltaP / 1000, 2, '.', ' ') : '---' }}</span>
                                <span class="ml-1 text-base font-normal text-white/50">kPa</span>
                            </p>
                            <p class="mt-2 text-sm text-white/60">
                                Carga equivalente: <span data-fluid-card-head>{{ $initialHead ? number_format($initialHead, 2, '.', ' ') : '---' }}</span> m
                            </p>
                        </div>

                        <div class="rounded-2xl border border-white/10 bg-white/5 p-5" data-fluid-card="power">
                            <p class="text-xs uppercase tracking-widest text-white/50">Potencia hidráulica</p>
                            <p class="mt-3 text-2xl font-semibold text-white">
                                <span data-fluid-card-power>{{ $initialPower ? number_format($initialPower, 1, '.', ' ') : '---' }}</span>
                                <span class="ml-1 text-base font-normal text-white/50">W</span>
                            </p>
                            <p class="mt-2 text-sm text-white/60">
                                Velocidad: <span data-fluid-card-velocity>{{ $initialVelocity ? number_format($initialVelocity, 2, '.', ' ') : '---' }}</span> m/s · ρ = <span data-fluid-card-density>{{ $initialDensity ? number_format($initialDensity, 0, '.', ' ') : '---' }}</span> kg/m³ · μ = <span data-fluid-card-viscosity>{{ $initialViscosity ? number_format($initialViscosity * 1000, 2, '.', ' ') : '---' }}</span> mPa·s
                            </p>
                        </div>
                    </div>
                </div>
            </section>
    </div>
</div>

    <div
        data-fluid-panel
        id="fluid-panel"
        class="fixed inset-0 z-50 hidden items-center justify-center px-4 py-6"
        role="dialog"
        aria-modal="true"
        aria-hidden="true"
        aria-labelledby="fluid-panel-title"
        tabindex="-1"
    >
        <div data-fluid-close class="absolute inset-0 bg-slate-950/80"></div>
        <div class="relative z-10 w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950/95 shadow-xl shadow-slate-900/40">
            <header class="flex items-start justify-between gap-4 border-b border-slate-800 bg-slate-900/90 px-5 py-4">
                <div class="space-y-1">
                    <p class="text-[10px] uppercase tracking-[0.3em] text-cyan-300">Selector de fluidos</p>
                    <h2 id="fluid-panel-title" class="text-lg font-semibold text-white">{{ $fluidSelection['name'] ?? 'Selecciona un fluido' }}</h2>
                    <p class="text-xs text-slate-300">Puedes cambiar el fluido activo en cualquier momento, los cálculos del panel se actualizan al instante.</p>
                </div>
                <button
                    type="button"
                    data-fluid-close
                    class="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:border-rose-400 hover:bg-rose-500/20 hover:text-rose-100"
                    aria-label="Cerrar gestión de fluidos"
                >
                    Cerrar
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 8.586l3.536-3.535a1 1 0 111.414 1.414L11.414 10l3.536 3.535a1 1 0 01-1.414 1.414L10 11.414l-3.535 3.535a1 1 0 01-1.414-1.414L8.586 10 5.05 6.465a1 1 0 111.414-1.414L10 8.586z" clip-rule="evenodd" /></svg>
                </button>
            </header>

            <div class="max-h-[70vh] overflow-y-auto px-5 py-5 space-y-5">
                <section class="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
                    <p class="text-[10px] uppercase tracking-[0.3em] text-slate-400">Propiedades</p>
                    <dl class="mt-3 grid gap-3 sm:grid-cols-2">
                        @forelse(($fluidSelection['properties'] ?? []) as $property)
                            <div class="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm text-slate-200">
                                <dt class="text-[10px] uppercase tracking-[0.3em] text-slate-400">{{ $property['label'] ?? 'Propiedad' }}</dt>
                                <dd class="mt-1 text-base font-semibold text-white">{{ $property['value'] ?? '---' }}</dd>
                            </div>
                        @empty
                            <p class="text-sm text-slate-400">{{ __('Selecciona un fluido para ver sus propiedades.') }}</p>
                        @endforelse
                    </dl>
                </section>

                @php
                    $monitoring = $fluidSelection['monitoring'] ?? [];
                    $monitoringAlerts = $monitoring['alerts'] ?? [];
                @endphp

                @if (! empty($fluidSelection['operating']))
                    <section class="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
                        <p class="text-[10px] uppercase tracking-[0.3em] text-slate-400">Ventana operativa</p>
                        <ul class="mt-3 space-y-2 text-sm text-slate-200">
                            @foreach ($fluidSelection['operating'] as $target)
                                <li class="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2">
                                    <div class="flex items-center justify-between gap-3">
                                        <span class="font-semibold text-white">{{ $target['label'] ?? 'Parámetro' }}</span>
                                        <span>{{ $target['value'] ?? '---' }}</span>
                                    </div>
                                    @if (! empty($target['note']))
                                        <p class="mt-1 text-[10px] text-slate-400">{{ $target['note'] }}</p>
                                    @endif
                                </li>
                            @endforeach
                        </ul>
                    </section>
                @endif

                <section class="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
                    <p class="text-[10px] uppercase tracking-[0.3em] text-slate-400">Alertas</p>
                    @if (! empty($monitoringAlerts))
                        <ul class="mt-3 space-y-2 text-sm text-slate-200">
                            @foreach ($monitoringAlerts as $alert)
                                <li class="flex items-start gap-2">
                                    <span class="mt-1 h-1.5 w-1.5 rounded-full bg-rose-400"></span>
                                    <span>{{ $alert }}</span>
                                </li>
                            @endforeach
                        </ul>
                    @else
                        <p class="mt-3 text-sm text-slate-400">{{ __('Sin alertas registradas para este fluido.') }}</p>
                    @endif

                    @if (! empty($monitoring['sampling']))
                        <div class="mt-4 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-slate-300">
                            <p class="font-semibold uppercase tracking-[0.3em] text-slate-400">Muestreo sugerido</p>
                            <p class="mt-1 text-sm text-slate-200">{{ $monitoring['sampling'] }}</p>
                        </div>
                    @endif
                </section>

                <section class="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
                    <p class="text-[10px] uppercase tracking-[0.3em] text-slate-400">Selecciona un fluido</p>
                    <div class="mt-3 space-y-3">
                        @foreach ($fluidCatalog as $fluid)
                            @php
                                $isSelected = ($fluid['key'] ?? null) === $fluidSelectedKey;
                            @endphp
                            <form
                                action="{{ route('settings.fluid.update') }}"
                                method="POST"
                                class="rounded-lg border {{ $isSelected ? 'border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/15' : 'border-slate-800 bg-slate-950/80 hover:border-cyan-400 hover:bg-cyan-500/10' }} transition"
                            >
                                @csrf
                                @method('PUT')
                                <input type="hidden" name="selection" value="{{ $fluid['key'] }}">
                                <input type="hidden" name="redirect_to" value="{{ route('dashboard') }}">
                                <button type="submit" class="flex w-full flex-col items-start gap-2 px-3 py-3 text-left">
                                    <div class="flex w-full items-start justify-between gap-3">
                                        <div class="space-y-1">
                                            <p class="text-sm font-semibold text-white">{{ $fluid['name'] ?? 'Fluido' }}</p>
                                            <p class="text-xs text-slate-300">{{ $fluid['description'] ?? '' }}</p>
                                        </div>
                                        @if (! empty($fluid['status']))
                                            <span class="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[9px] uppercase tracking-[0.3em] text-slate-200">{{ $fluid['status'] }}</span>
                                        @endif
                                    </div>
                                    <div class="grid w-full gap-2 text-[11px] text-slate-300 sm:grid-cols-3">
                                        @foreach (array_slice($fluid['properties'] ?? [], 0, 3) as $property)
                                            <span>{{ $property['label'] ?? 'Propiedad' }}: <span class="text-white">{{ $property['value'] ?? '---' }}</span></span>
                                        @endforeach
                                    </div>
                                    @if ($isSelected)
                                        <span class="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-200">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.414 0L3.296 9.917a1 1 0 111.414-1.414l3.041 3.04 6.543-6.543a1 1 0 011.41 0z" clip-rule="evenodd" /></svg>
                                            Seleccionado
                                        </span>
                                    @endif
                                </button>
                            </form>
                        @endforeach
                    </div>
                </section>
            </div>
        </div>
    </div>

    

</div>
@endsection
