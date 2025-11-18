@extends('layouts.app')

@section('title', 'Calculadora de fluidos')

@section('content')
    @php
        $calculatorFluids = [
            'water' => 'Agua (líquida)',
            'air' => 'Aire (gas)',
            'acetone' => 'Acetona',
            'ethanol' => 'Alcohol etílico',
            'glycerin' => 'Glicerina',
            'mercury' => 'Mercurio',
            'propane' => 'Propano líquido',
        ];

        $thermoTables = [
            'fluids' => [
                ['name' => 'Acetona', 'sg' => '0.787', 'gamma' => '7.72', 'rho' => '787', 'mu' => '3.16 x 10^-4', 'nu' => '4.02 x 10^-7'],
                ['name' => 'Alcohol etílico', 'sg' => '0.787', 'gamma' => '7.72', 'rho' => '787', 'mu' => '1.00 x 10^-3', 'nu' => '> 1.27 x 10^-6'],
                ['name' => 'Alcohol metílico', 'sg' => '0.789', 'gamma' => '7.74', 'rho' => '789', 'mu' => '5.60 x 10^-4', 'nu' => '7.10 x 10^-7'],
                ['name' => 'Alcohol propílico', 'sg' => '0.802', 'gamma' => '7.87', 'rho' => '802', 'mu' => '1.92 x 10^-3', 'nu' => '2.39 x 10^-6'],
                ['name' => 'Amoniaco hidratado (25%)', 'sg' => '0.910', 'gamma' => '8.93', 'rho' => '910', 'mu' => '6.03 x 10^-4', 'nu' => '6.63 x 10^-7'],
                ['name' => 'Benceno', 'sg' => '0.876', 'gamma' => '8.59', 'rho' => '876', 'mu' => '6.03 x 10^-4', 'nu' => '6.88 x 10^-7'],
                ['name' => 'Tetracloruro de carbono', 'sg' => '1.590', 'gamma' => '15.60', 'rho' => '1 590', 'mu' => '9.61 x 10^-4', 'nu' => '6.05 x 10^-7'],
                ['name' => 'Aceite de ricino', 'sg' => '0.960', 'gamma' => '9.42', 'rho' => '960', 'mu' => '9.86 x 10^-1', 'nu' => '1.03 x 10^-3'],
                ['name' => 'Etilenglicol', 'sg' => '1.100', 'gamma' => '10.79', 'rho' => '1 100', 'mu' => '1.60 x 10^-2', 'nu' => '> 1.45 x 10^-5'],
                ['name' => 'Gasolina', 'sg' => '0.680', 'gamma' => '6.67', 'rho' => '680', 'mu' => '3.90 x 10^-4', 'nu' => '5.74 x 10^-7'],
                ['name' => 'Glicerina', 'sg' => '1.258', 'gamma' => '12.34', 'rho' => '1 258', 'mu' => '1.41 x 10^-1', 'nu' => '1.12 x 10^-4'],
                ['name' => 'Queroseno', 'sg' => '0.810', 'gamma' => '7.95', 'rho' => '810', 'mu' => '1.64 x 10^-3', 'nu' => '2.03 x 10^-6'],
                ['name' => 'Aceite de linaza', 'sg' => '0.930', 'gamma' => '9.13', 'rho' => '930', 'mu' => '2.42 x 10^-2', 'nu' => '2.60 x 10^-5'],
                ['name' => 'Mercurio', 'sg' => '13.54', 'gamma' => '132.8', 'rho' => '13 540', 'mu' => '1.53 x 10^-3', 'nu' => '1.13 x 10^-7'],
                ['name' => 'Propano', 'sg' => '0.495', 'gamma' => '4.86', 'rho' => '495', 'mu' => '1.86 x 10^-3', 'nu' => '3.76 x 10^-6'],
                ['name' => 'Agua de mar', 'sg' => '1.030', 'gamma' => '10.10', 'rho' => '1 030', 'mu' => '1.08 x 10^-3', 'nu' => '1.05 x 10^-6'],
                ['name' => 'Aguarrás', 'sg' => '0.870', 'gamma' => '8.54', 'rho' => '870', 'mu' => '1.03 x 10^-3', 'nu' => '1.18 x 10^-6'],
                ['name' => 'Combustóleo medio', 'sg' => '0.852', 'gamma' => '8.35', 'rho' => '852', 'mu' => '2.99 x 10^-2', 'nu' => '3.51 x 10^-5'],
                ['name' => 'Combustóleo pesado', 'sg' => '0.906', 'gamma' => '8.89', 'rho' => '906', 'mu' => '1.07 x 10^-1', 'nu' => '1.18 x 10^-4'],
            ],
            'water_si' => [
                ['t' => '0', 'gamma' => '9.81', 'rho' => '1 000', 'mu' => '1.75 x 10^-3', 'nu' => '1.75 x 10^-6'],
                ['t' => '5', 'gamma' => '9.81', 'rho' => '1 000', 'mu' => '1.52 x 10^-3', 'nu' => '1.52 x 10^-6'],
                ['t' => '10', 'gamma' => '9.80', 'rho' => '999', 'mu' => '1.31 x 10^-3', 'nu' => '1.31 x 10^-6'],
                ['t' => '15', 'gamma' => '9.80', 'rho' => '999', 'mu' => '1.14 x 10^-3', 'nu' => '1.14 x 10^-6'],
                ['t' => '20', 'gamma' => '9.79', 'rho' => '998', 'mu' => '1.00 x 10^-3', 'nu' => '1.00 x 10^-6'],
                ['t' => '25', 'gamma' => '9.78', 'rho' => '997', 'mu' => '8.94 x 10^-4', 'nu' => '8.97 x 10^-7'],
                ['t' => '30', 'gamma' => '9.77', 'rho' => '996', 'mu' => '7.97 x 10^-4', 'nu' => '8.00 x 10^-7'],
                ['t' => '40', 'gamma' => '9.71', 'rho' => '992', 'mu' => '6.53 x 10^-4', 'nu' => '6.58 x 10^-7'],
                ['t' => '50', 'gamma' => '9.65', 'rho' => '988', 'mu' => '5.47 x 10^-4', 'nu' => '5.54 x 10^-7'],
                ['t' => '60', 'gamma' => '9.59', 'rho' => '983', 'mu' => '4.66 x 10^-4', 'nu' => '4.74 x 10^-7'],
                ['t' => '70', 'gamma' => '9.52', 'rho' => '978', 'mu' => '4.04 x 10^-4', 'nu' => '4.13 x 10^-7'],
                ['t' => '80', 'gamma' => '9.45', 'rho' => '972', 'mu' => '3.55 x 10^-4', 'nu' => '3.65 x 10^-7'],
                ['t' => '90', 'gamma' => '9.38', 'rho' => '965', 'mu' => '3.18 x 10^-4', 'nu' => '3.30 x 10^-7'],
                ['t' => '100', 'gamma' => '9.28', 'rho' => '958', 'mu' => '2.82 x 10^-4', 'nu' => '2.94 x 10^-7'],
            ],
            'water_imperial' => [
                ['t' => '32', 'gamma' => '62.4', 'rho' => '1.94', 'mu' => '3.66 x 10^-5', 'nu' => '1.89 x 10^-5'],
                ['t' => '40', 'gamma' => '62.4', 'rho' => '1.94', 'mu' => '3.23 x 10^-5', 'nu' => '1.67 x 10^-5'],
                ['t' => '50', 'gamma' => '62.4', 'rho' => '1.94', 'mu' => '2.92 x 10^-5', 'nu' => '1.51 x 10^-5'],
                ['t' => '60', 'gamma' => '62.4', 'rho' => '1.94', 'mu' => '2.72 x 10^-5', 'nu' => '1.41 x 10^-5'],
                ['t' => '70', 'gamma' => '62.3', 'rho' => '1.94', 'mu' => '2.04 x 10^-5', 'nu' => '1.05 x 10^-5'],
                ['t' => '80', 'gamma' => '62.2', 'rho' => '1.93', 'mu' => '1.74 x 10^-5', 'nu' => '9.02 x 10^-6'],
                ['t' => '90', 'gamma' => '62.1', 'rho' => '1.93', 'mu' => '1.60 x 10^-5', 'nu' => '8.29 x 10^-6'],
                ['t' => '100', 'gamma' => '62.0', 'rho' => '1.93', 'mu' => '1.50 x 10^-5', 'nu' => '7.77 x 10^-6'],
                ['t' => '120', 'gamma' => '61.9', 'rho' => '1.92', 'mu' => '1.26 x 10^-5', 'nu' => '6.57 x 10^-6'],
                ['t' => '140', 'gamma' => '61.7', 'rho' => '1.92', 'mu' => '1.09 x 10^-5', 'nu' => '5.68 x 10^-6'],
                ['t' => '160', 'gamma' => '61.4', 'rho' => '1.91', 'mu' => '9.86 x 10^-6', 'nu' => '5.16 x 10^-6'],
                ['t' => '180', 'gamma' => '61.1', 'rho' => '1.90', 'mu' => '8.70 x 10^-6', 'nu' => '4.58 x 10^-6'],
                ['t' => '200', 'gamma' => '60.7', 'rho' => '1.89', 'mu' => '7.70 x 10^-6', 'nu' => '4.07 x 10^-6'],
                ['t' => '212', 'gamma' => '59.8', 'rho' => '1.86', 'mu' => '5.89 x 10^-6', 'nu' => '3.17 x 10^-6'],
            ],
            'air_si' => [
                ['t' => '-40', 'gamma' => '14.85', 'rho' => '1.514', 'mu' => '1.51 x 10^-5', 'nu' => '9.98 x 10^-6'],
                ['t' => '-30', 'gamma' => '14.24', 'rho' => '1.452', 'mu' => '1.56 x 10^-5', 'nu' => '1.08 x 10^-5'],
                ['t' => '-20', 'gamma' => '13.67', 'rho' => '1.394', 'mu' => '1.61 x 10^-5', 'nu' => '1.15 x 10^-5'],
                ['t' => '-10', 'gamma' => '13.15', 'rho' => '1.341', 'mu' => '1.65 x 10^-5', 'nu' => '1.23 x 10^-5'],
                ['t' => '0', 'gamma' => '12.65', 'rho' => '1.292', 'mu' => '1.71 x 10^-5', 'nu' => '1.32 x 10^-5'],
                ['t' => '10', 'gamma' => '12.23', 'rho' => '1.247', 'mu' => '1.76 x 10^-5', 'nu' => '1.41 x 10^-5'],
                ['t' => '20', 'gamma' => '11.79', 'rho' => '1.204', 'mu' => '1.81 x 10^-5', 'nu' => '1.50 x 10^-5'],
                ['t' => '30', 'gamma' => '11.42', 'rho' => '1.164', 'mu' => '1.86 x 10^-5', 'nu' => '1.60 x 10^-5'],
                ['t' => '40', 'gamma' => '11.05', 'rho' => '1.127', 'mu' => '1.92 x 10^-5', 'nu' => '1.70 x 10^-5'],
                ['t' => '50', 'gamma' => '10.70', 'rho' => '1.092', 'mu' => '1.97 x 10^-5', 'nu' => '1.81 x 10^-5'],
                ['t' => '60', 'gamma' => '10.37', 'rho' => '1.058', 'mu' => '2.02 x 10^-5', 'nu' => '1.91 x 10^-5'],
                ['t' => '70', 'gamma' => '10.05', 'rho' => '1.026', 'mu' => '2.07 x 10^-5', 'nu' => '2.02 x 10^-5'],
                ['t' => '80', 'gamma' => '9.75', 'rho' => '0.995', 'mu' => '2.12 x 10^-5', 'nu' => '2.13 x 10^-5'],
                ['t' => '90', 'gamma' => '9.47', 'rho' => '0.966', 'mu' => '2.17 x 10^-5', 'nu' => '2.25 x 10^-5'],
                ['t' => '100', 'gamma' => '9.20', 'rho' => '0.938', 'mu' => '2.22 x 10^-5', 'nu' => '2.37 x 10^-5'],
                ['t' => '110', 'gamma' => '8.94', 'rho' => '0.912', 'mu' => '2.26 x 10^-5', 'nu' => '2.48 x 10^-5'],
                ['t' => '120', 'gamma' => '8.70', 'rho' => '0.887', 'mu' => '2.31 x 10^-5', 'nu' => '2.61 x 10^-5'],
            ],
            'air_imperial' => [
                ['t' => '-40', 'rho' => '2.94 x 10^-3', 'gamma' => '0.0946', 'mu' => '3.15 x 10^-7', 'nu' => '1.07 x 10^-4'],
                ['t' => '-20', 'rho' => '2.80 x 10^-3', 'gamma' => '0.0903', 'mu' => '3.37 x 10^-7', 'nu' => '1.20 x 10^-4'],
                ['t' => '0', 'rho' => '2.68 x 10^-3', 'gamma' => '0.0864', 'mu' => '3.58 x 10^-7', 'nu' => '1.34 x 10^-4'],
                ['t' => '20', 'rho' => '2.57 x 10^-3', 'gamma' => '0.0828', 'mu' => '3.80 x 10^-7', 'nu' => '1.48 x 10^-4'],
                ['t' => '40', 'rho' => '2.47 x 10^-3', 'gamma' => '0.0795', 'mu' => '4.01 x 10^-7', 'nu' => '1.62 x 10^-4'],
                ['t' => '60', 'rho' => '2.37 x 10^-3', 'gamma' => '0.0760', 'mu' => '4.23 x 10^-7', 'nu' => '1.78 x 10^-4'],
                ['t' => '80', 'rho' => '2.28 x 10^-3', 'gamma' => '0.0730', 'mu' => '4.45 x 10^-7', 'nu' => '1.94 x 10^-4'],
                ['t' => '100', 'rho' => '2.19 x 10^-3', 'gamma' => '0.0700', 'mu' => '4.67 x 10^-7', 'nu' => '2.13 x 10^-4'],
                ['t' => '120', 'rho' => '2.10 x 10^-3', 'gamma' => '0.0672', 'mu' => '4.88 x 10^-7', 'nu' => '2.32 x 10^-4'],
                ['t' => '140', 'rho' => '2.02 x 10^-3', 'gamma' => '0.0646', 'mu' => '5.09 x 10^-7', 'nu' => '2.52 x 10^-4'],
                ['t' => '160', 'rho' => '1.94 x 10^-3', 'gamma' => '0.0620', 'mu' => '5.30 x 10^-7', 'nu' => '2.73 x 10^-4'],
                ['t' => '180', 'rho' => '1.87 x 10^-3', 'gamma' => '0.0597', 'mu' => '5.51 x 10^-7', 'nu' => '2.95 x 10^-4'],
                ['t' => '200', 'rho' => '1.80 x 10^-3', 'gamma' => '0.0574', 'mu' => '5.72 x 10^-7', 'nu' => '3.19 x 10^-4'],
                ['t' => '220', 'rho' => '1.74 x 10^-3', 'gamma' => '0.0554', 'mu' => '5.93 x 10^-7', 'nu' => '3.44 x 10^-4'],
                ['t' => '240', 'rho' => '1.68 x 10^-3', 'gamma' => '0.0536', 'mu' => '6.13 x 10^-7', 'nu' => '3.70 x 10^-4'],
            ],
        ];
    @endphp

    <div id="dashboard-app" data-context="calculator" class="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-12 lg:py-16">
        <header class="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <nav aria-label="Rastro" class="text-sm text-white/60">
                <ol class="flex items-center gap-2">
                    <li><a class="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950" href="{{ route('dashboard') }}">Inicio</a></li>
                    <li aria-hidden="true" class="text-white/30">/</li>
                    <li class="text-white">Calculadora de fluidos</li>
                </ol>
            </nav>
            <div class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 11-8 8 8 8 0 018-8zm0 3a.75.75 0 00-.75.75v4.5a.75.75 0 001.5 0v-4.5A.75.75 0 0010 5zm0 8a1 1 0 100 2 1 1 0 000-2z" /></svg>
                Flujo termodinámico
            </div>
        </header>

        <div class="rounded-3xl border border-cyan-500/20 bg-slate-950/95 shadow-[0_40px_120px_-50px_rgba(8,145,178,0.75)] ring-1 ring-white/5">
            <header class="border-b border-white/10 bg-gradient-to-br from-cyan-500/15 via-slate-900/95 to-indigo-900/60 px-8 py-8 text-white shadow-[inset_0_-1px_0_0_rgba(148,163,184,0.25)] sm:px-10 sm:py-9">
                <div class="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:items-start lg:gap-14">
                    <div class="max-w-2xl space-y-4">
                        <span class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-100">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 11-8 8 8 8 0 018-8zm0 3a.75.75 0 00-.75.75v4.5a.75.75 0 001.5 0v-4.5A.75.75 0 0010 5zm0 8a1 1 0 100 2 1 1 0 000-2z" /></svg>
                            Calculadora de fluidos
                        </span>
                        <h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Análisis termodinámico integral</h1>
                        <p class="text-sm leading-relaxed text-slate-100/80">
                            Ingresa las condiciones de operación y obtén un resumen profesional de propiedades críticas,
                            tendencias y clasificaciones del fluido seleccionado.
                        </p>
                        <dl class="mt-6 grid gap-5 rounded-2xl border border-white/10 bg-slate-950/40 p-6 text-xs text-slate-200/80 shadow-lg shadow-cyan-500/10 sm:grid-cols-2">
                            <div class="space-y-1">
                                <dt class="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-200">
                                    <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.144 3.528a1 1 0 011.712 0l6 10.5A1 1 0 0116.01 15H3.99a1 1 0 01-.846-1.472l6-10.5zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-.25-6.75a.75.75 0 10-1.5 0v3.5a.75.75 0 001.5 0v-3.5z" clip-rule="evenodd" /></svg>
                                    </span>
                                    Seguridad operacional
                                </dt>
                                <dd class="text-[11px] leading-relaxed">Evalúa escenarios térmicos y de presión con indicadores clave calculados al instante.</dd>
                            </div>
                            <div class="space-y-1">
                                <dt class="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-200">
                                    <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656l-6.364 6.364a.75.75 0 01-1.06 0L3.172 10.828a4 4 0 010-5.656z" /></svg>
                                    </span>
                                    Integridad del activo
                                </dt>
                                <dd class="text-[11px] leading-relaxed">Sigue la evolución del fluido y toma decisiones de mantenimiento con información curada.</dd>
                            </div>
                        </dl>
                    </div>
                    <div class="flex flex-col gap-4 lg:gap-6">
                        <div class="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 p-6 text-xs text-slate-200/80 shadow-xl shadow-cyan-500/20">
                            <div class="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-500/20 blur-3xl"></div>
                            <p class="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-100">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V4zm4 1a1 1 0 100 2h6a1 1 0 100-2H7zm-1 5a1 1 0 011-1h2a1 1 0 010 2H7a1 1 0 01-1-1zm1 3a1 1 0 000 2h6a1 1 0 100-2H7z" /></svg>
                                Estado resumido
                            </p>
                            <p class="mt-4 text-sm font-semibold text-white" data-calculator-output="fluid-name">Selecciona un fluido</p>
                            <p class="mt-2 text-[11px] leading-relaxed text-slate-300" data-calculator-output="fluid-summary">Los resultados aparecerán aquí al capturar tus condiciones.</p>
                        </div>
                    </div>
                </div>
            </header>

            <div class="flex flex-col gap-8 lg:flex-row">
                <section class="flex-1 overflow-y-auto px-8 py-10 sm:px-10">
                    <form data-calculator-form class="space-y-8">
                        <div class="grid gap-6 lg:grid-cols-2">
                            <div class="space-y-3">
                                <label class="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-300" for="calculator-fluid">Fluido de referencia</label>
                                <select
                                    id="calculator-fluid"
                                    name="fluid"
                                    class="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white shadow-inner shadow-slate-950/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                >
                                    @foreach ($calculatorFluids as $key => $label)
                                        <option value="{{ $key }}">{{ $label }}</option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="grid gap-3 sm:grid-cols-2">
                                <label class="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-300" for="calculator-temperature">Temperatura inicial (°C)
                                    <input
                                        id="calculator-temperature"
                                        type="number"
                                        step="0.1"
                                        name="temperature"
                                        value="25"
                                        class="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white shadow-inner shadow-slate-950/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                    />
                                </label>
                                <label class="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-300" for="calculator-temperature-target">Temperatura objetivo (°C)
                                    <input
                                        id="calculator-temperature-target"
                                        type="number"
                                        step="0.1"
                                        name="temperature_target"
                                        value="25"
                                        class="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white shadow-inner shadow-slate-950/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                    />
                                </label>
                            </div>
                        </div>

                        <div class="grid gap-6 lg:grid-cols-3">
                            <label class="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-300" for="calculator-pressure">Presión inicial (kPa)
                                <input
                                    id="calculator-pressure"
                                    type="number"
                                    step="0.1"
                                    name="pressure"
                                    value="101.325"
                                    class="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white shadow-inner shadow-slate-950/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </label>
                            <label class="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-300" for="calculator-pressure-target">Presión objetivo (kPa)
                                <input
                                    id="calculator-pressure-target"
                                    type="number"
                                    step="0.1"
                                    name="pressure_target"
                                    value="101.325"
                                    class="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white shadow-inner shadow-slate-950/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </label>
                            <label class="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-300" for="calculator-molar">Fracción molar
                                <input
                                    id="calculator-molar"
                                    type="number"
                                    step="0.01"
                                    name="molar_fraction"
                                    value="1"
                                    class="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white shadow-inner shadow-slate-950/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </label>
                        </div>

                        <div class="grid gap-6 lg:grid-cols-3">
                            <label class="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-300" for="calculator-velocity">Velocidad (m/s)
                                <input
                                    id="calculator-velocity"
                                    type="number"
                                    step="0.01"
                                    name="velocity"
                                    value="0"
                                    class="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white shadow-inner shadow-slate-950/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </label>
                            <label class="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-300" for="calculator-diameter">Diámetro (m)
                                <input
                                    id="calculator-diameter"
                                    type="number"
                                    step="0.001"
                                    name="diameter"
                                    value="0"
                                    class="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white shadow-inner shadow-slate-950/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </label>
                        </div>
                    </form>
                </section>

                <section class="flex-1 space-y-8 border-t border-white/10 bg-slate-950/80 px-8 py-10 text-sm text-slate-200 sm:px-10 lg:border-t-0 lg:border-l">
                    <div class="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-center">
                        <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/80" data-calculator-output="fluid-type">---</span>
                        <p class="text-lg font-semibold text-white" data-calculator-output="reynolds">—</p>
                        <p class="mt-2 text-sm text-slate-300" data-calculator-output="flow-regime">—</p>
                        <p class="mt-1 text-xs text-slate-400" data-calculator-output="flow-note">Captura velocidad y diámetro para evaluar el régimen laminar o turbulento.</p>
                    </div>

                    <div class="grid gap-6 lg:grid-cols-2">
                        <dl class="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
                            <dt class="text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-200">Propiedades principales</dt>
                            <div class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-2xl border border-white/5 bg-slate-950/50 px-4 py-3 shadow-inner shadow-slate-950/30">
                                <dt class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">Densidad</dt>
                                <dd class="text-base font-semibold leading-tight text-white tabular-nums" data-calculator-output="density">—</dd>
                            </div>
                            <div class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-2xl border border-white/5 bg-slate-950/50 px-4 py-3 shadow-inner shadow-slate-950/30">
                                <dt class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">Volumen específico</dt>
                                <dd class="text-base font-semibold leading-tight text-white tabular-nums" data-calculator-output="specific-volume">—</dd>
                            </div>
                            <div class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-2xl border border-white/5 bg-slate-950/50 px-4 py-3 shadow-inner shadow-slate-950/30">
                                <dt class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">Peso específico</dt>
                                <dd class="text-base font-semibold leading-tight text-white tabular-nums" data-calculator-output="specific-weight">—</dd>
                            </div>
                        </dl>
                        <dl class="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
                            <dt class="text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-200">Reología</dt>
                            <div class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-2xl border border-white/5 bg-slate-950/50 px-4 py-3 shadow-inner shadow-slate-950/30">
                                <dt class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">Viscosidad dinámica</dt>
                                <dd class="text-base font-semibold leading-tight text-white tabular-nums" data-calculator-output="dynamic-viscosity">—</dd>
                            </div>
                            <div class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-2xl border border-white/5 bg-slate-950/50 px-4 py-3 shadow-inner shadow-slate-950/30">
                                <dt class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">Viscosidad cinemática</dt>
                                <dd class="text-base font-semibold leading-tight text-white tabular-nums" data-calculator-output="kinematic-viscosity">—</dd>
                            </div>
                            <div class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-2xl border border-white/5 bg-slate-950/50 px-4 py-3 shadow-inner shadow-slate-950/30">
                                <dt class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300" data-calculator-output="compressibility-label">Compresibilidad</dt>
                                <dd class="flex flex-col items-end text-right">
                                    <span class="text-base font-semibold leading-tight text-white tabular-nums" data-calculator-output="compressibility">—</span>
                                    <span class="text-[10px] font-medium uppercase tracking-[0.35em] text-slate-500" data-calculator-output="compressibility-unit">—</span>
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div class="grid gap-6 lg:grid-cols-2">
                        <div class="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
                            <p class="text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-200">Presiones derivadas</p>
                            <dl class="mt-6 space-y-3 text-sm text-slate-200">
                                <div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-white/5 bg-slate-950/50 px-4 py-3 shadow-inner shadow-slate-950/30">
                                    <dt class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">Ecuación de estado</dt>
                                    <dd class="flex flex-col items-end text-right">
                                        <span class="text-base font-semibold leading-tight text-white tabular-nums" data-calculator-output="pressure-eos">—</span>
                                        <span class="text-[10px] font-medium uppercase tracking-[0.35em] text-slate-500">kPa</span>
                                    </dd>
                                </div>
                                <div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-white/5 bg-slate-950/50 px-4 py-3 shadow-inner shadow-slate-950/30">
                                    <dt class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">Presión parcial</dt>
                                    <dd class="flex flex-col items-end text-right">
                                        <span class="text-base font-semibold leading-tight text-white tabular-nums" data-calculator-output="partial-pressure">—</span>
                                        <span class="text-[10px] font-medium uppercase tracking-[0.35em] text-slate-500">kPa</span>
                                    </dd>
                                </div>
                                <div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-white/5 bg-slate-950/50 px-4 py-3 shadow-inner shadow-slate-950/30">
                                    <dt class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">Presión de vapor</dt>
                                    <dd class="flex flex-col items-end text-right">
                                        <span class="text-base font-semibold leading-tight text-white tabular-nums" data-calculator-output="vapor-pressure">—</span>
                                        <span class="text-[10px] font-medium uppercase tracking-[0.35em] text-slate-500">kPa</span>
                                    </dd>
                                </div>
                                <div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-white/5 bg-slate-950/50 px-4 py-3 shadow-inner shadow-slate-950/30">
                                    <dt class="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">Presión de saturación</dt>
                                    <dd class="flex flex-col items-end text-right">
                                        <span class="text-base font-semibold leading-tight text-white tabular-nums" data-calculator-output="saturation-pressure">—</span>
                                        <span class="text-[10px] font-medium uppercase tracking-[0.35em] text-slate-500">kPa</span>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                        <div class="space-y-6">
                            <div class="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
                                <p class="text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-200">Lectura operativa</p>
                                <ul class="mt-6 space-y-4 text-sm leading-relaxed text-slate-200">
                                    <li data-calculator-output="classification-viscosity">—</li>
                                    <li data-calculator-output="classification-compressibility">—</li>
                                    <li data-calculator-output="classification-rheology">—</li>
                                </ul>
                            </div>
                            <div class="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
                                <p class="text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-200">Variaciones registradas</p>
                                <div class="mt-6 space-y-3 text-sm leading-relaxed text-slate-200">
                                    <p data-calculator-output="temperature-variation">—</p>
                                    <p data-calculator-output="pressure-variation">—</p>
                                    <p data-calculator-output="property-variation">—</p>
                                </div>
                            </div>
                            <div class="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
                                <p class="text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-200">Procesos de referencia</p>
                                <ul class="mt-6 space-y-4 text-sm leading-relaxed text-slate-200" data-calculator-output="process-list"></ul>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div class="border-t border-white/10 px-8 pb-8 pt-8 sm:px-10 sm:pb-10">
                <div class="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-inner shadow-slate-950/50">
                    <button
                        type="button"
                        data-calculator-table-toggle
                        class="flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-slate-950/70 px-5 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-100 transition hover:border-cyan-300/60 hover:text-cyan-100"
                        aria-expanded="false"
                    >
                        <span>Ver tablas de referencia</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.939l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0l-4.25-4.25a.75.75 0 01.02-1.06z" clip-rule="evenodd" /></svg>
                    </button>

                    <div data-calculator-tables class="mt-6 hidden space-y-7 text-sm text-slate-100">
                        <div>
                            <h2 class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">Tabla B.1 • Fluidos en unidades SI</h2>
                            <div class="mt-4 overflow-x-auto rounded-xl border border-white/5">
                                <table class="min-w-full divide-y divide-white/10 text-xs">
                                    <thead class="bg-slate-900/80 text-cyan-100">
                                        <tr>
                                            <th class="px-3 py-2 text-left font-semibold uppercase tracking-[0.25em]">Fluido</th>
                                            <th class="px-3 py-2 text-left font-semibold uppercase tracking-[0.25em]">sg</th>
                                            <th class="px-3 py-2 text-left font-semibold uppercase tracking-[0.25em]">γ (kN/m³)</th>
                                            <th class="px-3 py-2 text-left font-semibold uppercase tracking-[0.25em]">ρ (kg/m³)</th>
                                            <th class="px-3 py-2 text-left font-semibold uppercase tracking-[0.25em]">μ (Pa·s)</th>
                                            <th class="px-3 py-2 text-left font-semibold uppercase tracking-[0.25em]">ν (m²/s)</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-white/5 bg-slate-950/60">
                                        @foreach ($thermoTables['fluids'] as $row)
                                            <tr>
                                                <td class="whitespace-nowrap px-3 py-2 text-slate-200">{{ $row['name'] }}</td>
                                                <td class="whitespace-nowrap px-3 py-2 text-slate-300">{{ $row['sg'] }}</td>
                                                <td class="whitespace-nowrap px-3 py-2 text-slate-300">{{ $row['gamma'] }}</td>
                                                <td class="whitespace-nowrap px-3 py-2 text-slate-300">{{ $row['rho'] }}</td>
                                                <td class="whitespace-nowrap px-3 py-2 text-slate-300">{{ $row['mu'] }}</td>
                                                <td class="whitespace-nowrap px-3 py-2 text-slate-300">{{ $row['nu'] }}</td>
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div class="grid gap-6 lg:grid-cols-2">
                            <div>
                                <h3 class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">Tabla B.2 • Agua (SI)</h3>
                                <div class="mt-4 overflow-x-auto rounded-xl border border-white/5">
                                    <table class="min-w-full divide-y divide-white/10 text-xs">
                                        <thead class="bg-slate-900/80 text-cyan-100">
                                            <tr>
                                                <th class="px-3 py-2 text-left font-semibold uppercase tracking-[0.25em]">T (°C)</th>
                                                <th class="px-3 py-2 text-left font-semibold uppercase tracking-[0.25em]">γ (kN/m³)</th>
                                                <th class="px-3 py-2 text-left font-semibold uppercase tracking-[0.25em]">ρ (kg/m³)</th>
                                                <th class="px-3 py-2 text-left font-semibold uppercase tracking-[0.25em]">μ (Pa·s)</th>
                                                <th class="px-3 py-2 text-left font-semibold uppercase tracking-[0.25em]">ν (m²/s)</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-white/5 bg-slate-950/60">
                                            @foreach ($thermoTables['water_si'] as $row)
                                                <tr>
                                                    <td class="whitespace-nowrap px-3 py-2 text-slate-200">{{ $row['t'] }}</td>
                                                    <td class="whitespace-nowrap px-3 py-2 text-slate-300">{{ $row['gamma'] }}</td>
                                                    <td class="whitespace-nowrap px-3 py-2 text-slate-300">{{ $row['rho'] }}</td>
                                                    <td class="whitespace-nowrap px-3 py-2 text-slate-300">{{ $row['mu'] }}</td>
                                                    <td class="whitespace-nowrap px-3 py-2 text-slate-300">{{ $row['nu'] }}</td>
                                                </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div>
                                <h3 class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">Tabla B.3 • Agua (Sistema Imperial)</h3>
                                <div class="mt-4 overflow-x-auto rounded-xl border border-white/5">
                                    <table class="min-w-full divide-y divide-white/10 text-xs">
                                        <thead class="bg-slate-900/80 text-cyan-100">
                                            <tr>
                                                <th class="px-3 py-2 text-left font-semibold uppercase tracking-[0.25em]">T (°F)</th>
                                                <th class="px-3 py-2 text-left font-semibold uppercase tracking-[0.25em]">γ (lb/pie³)</th>
                                                <th class="px-3 py-2 text-left font-semibold uppercase tracking-[0.25em]">ρ (slug/pie³)</th>
                                                <th class="px-3 py-2 text-left font-semibold uppercase tracking-[0.25em]">μ (lb·s/pie²)</th>
                                                <th class="px-3 py-2 text-left font-semibold uppercase tracking-[0.25em]">ν (pie²/s)</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-white/5 bg-slate-950/60">
                                            @foreach ($thermoTables['water_imperial'] as $row)
                                                <tr>
                                                    <td class="whitespace-nowrap px-3 py-2 text-slate-200">{{ $row['t'] }}</td>
                                                    <td class="whitespace-nowrap px-3 py-2 text-slate-300">{{ $row['gamma'] }}</td>
                                                    <td class="whitespace-nowrap px-3 py-2 text-slate-300">{{ $row['rho'] }}</td>
                                                    <td class="whitespace-nowrap px-3 py-2 text-slate-300">{{ $row['mu'] }}</td>
                                                    <td class="whitespace-nowrap px-3 py-2 text-slate-300">{{ $row['nu'] }}</td>
                                                </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">Tabla B.4 • Aire (SI)</h3>
                            <div class="mt-4 overflow-x-auto rounded-xl border border-white/5">
                                <table class="min-w-full divide-y divide-white/10 text-xs">
                                    <thead class="bg-slate-900/80 text-cyan-100">
                                        <tr>
                                            <th class="px-3 py-2 text-left font-semibold uppercase tracking-[0.25em]">T (°C)</th>
                                            <th class="px-3 py-2 text-left font-semibold uppercase tracking-[0.25em]">γ (kN/m³)</th>
                                            <th class="px-3 py-2 text-left font-semibold uppercase tracking-[0.25em]">ρ (kg/m³)</th>
                                            <th class="px-3 py-2 text-left font-semibold uppercase tracking-[0.25em]">μ (Pa·s)</th>
                                            <th class="px-3 py-2 text-left font-semibold uppercase tracking-[0.25em]">ν (m²/s)</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-white/5 bg-slate-950/60">
                                        @foreach ($thermoTables['air_si'] as $row)
                                            <tr>
                                                <td class="whitespace-nowrap px-3 py-2 text-slate-200">{{ $row['t'] }}</td>
                                                <td class="whitespace-nowrap px-3 py-2 text-slate-300">{{ $row['gamma'] }}</td>
                                                <td class="whitespace-nowrap px-3 py-2 text-slate-300">{{ $row['rho'] }}</td>
                                                <td class="whitespace-nowrap px-3 py-2 text-slate-300">{{ $row['mu'] }}</td>
                                                <td class="whitespace-nowrap px-3 py-2 text-slate-300">{{ $row['nu'] }}</td>
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <h3 class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">Tabla B.5 • Aire (Sistema Imperial)</h3>
                            <div class="mt-4 overflow-x-auto rounded-xl border border-white/5">
                                <table class="min-w-full divide-y divide-white/10 text-xs">
                                    <thead class="bg-slate-900/80 text-cyan-100">
                                        <tr>
                                            <th class="px-3 py-2 text-left font-semibold uppercase tracking-[0.25em]">T (°F)</th>
                                            <th class="px-3 py-2 text-left font-semibold uppercase tracking-[0.25em]">ρ (slug/pie³)</th>
                                            <th class="px-3 py-2 text-left font-semibold uppercase tracking-[0.25em]">γ (lb/pie³)</th>
                                            <th class="px-3 py-2 text-left font-semibold uppercase tracking-[0.25em]">μ (lb·s/pie²)</th>
                                            <th class="px-3 py-2 text-left font-semibold uppercase tracking-[0.25em]">ν (pie²/s)</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-white/5 bg-slate-950/60">
                                        @foreach ($thermoTables['air_imperial'] as $row)
                                            <tr>
                                                <td class="whitespace-nowrap px-3 py-2 text-slate-200">{{ $row['t'] }}</td>
                                                <td class="whitespace-nowrap px-3 py-2 text-slate-300">{{ $row['rho'] }}</td>
                                                <td class="whitespace-nowrap px-3 py-2 text-slate-300">{{ $row['gamma'] }}</td>
                                                <td class="whitespace-nowrap px-3 py-2 text-slate-300">{{ $row['mu'] }}</td>
                                                <td class="whitespace-nowrap px-3 py-2 text-slate-300">{{ $row['nu'] }}</td>
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
