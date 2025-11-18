@extends('layouts.app')

@section('title', 'Modelado hidráulico')

@push('scripts')
    @vite('resources/ts/modeling-standalone.tsx')
@endpush

@section('content')
    <div class="min-h-screen" id="modeling-standalone-root">
        <div class="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-300">
            <p>
                Cargando el módulo de modelado… Si esta pantalla permanece, verifica tu conexión o recarga la página.
            </p>
        </div>
    </div>
@endsection
