import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    esbuild: {
        jsx: 'automatic',
        jsxImportSource: 'react',
    },
    resolve: {
        alias: {
            'hydraulic-designer/router': resolve(projectDir, 'resources/ts/router.tsx'),
            'hydraulic-designer/pages': resolve(projectDir, 'resources/ts/pages/hydraulic-designer'),
        },
    },
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
                'resources/ts/main.tsx',
                'resources/ts/dashboard-designer.tsx',
                'resources/ts/modeling-standalone.tsx',
            ],
            refresh: true,
        }),
        tailwindcss(),
    ],
});
