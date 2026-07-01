import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../../packages/shared'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3241,
    proxy: {
      '/soap/banco': {
        target: 'http://localhost:18081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/soap\/banco/, '/ws'),
      },
      '/soap/federacion': {
        target: 'http://localhost:18082',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/soap\/federacion/, '/ws'),
      },
    },
  },
});
