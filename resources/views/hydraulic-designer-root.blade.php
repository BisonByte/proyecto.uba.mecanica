@extends('layouts.app')

@section('title', 'Diseñador hidráulico')

@push('scripts')
    @vite('resources/ts/main.tsx')
@endpush

@section('content')
    {{-- El contenedor con id="system-editor-root" es requerido por resources/ts/main.tsx --}}
    <div
        class="min-h-screen"
        id="system-editor-root"
        data-router-base="{{ route('hydraulic.designer.root', [], false) }}"
    >
        <div class="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-300">
            <p>
                Preparando el diseñador hidráulico… Si esta pantalla permanece, verifica tu conexión o recarga la página.
            </p>
        </div>
    </div>
@endsection
