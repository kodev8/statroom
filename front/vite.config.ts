import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// allow @ declaritive for shadcn components
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '#': path.resolve(__dirname, './../'),
        },
    },
});
