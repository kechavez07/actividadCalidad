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
    port: 5173,
    proxy: {
      '/soap/banco': {
        target: 'http://209.145.48.25:18081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/soap\/banco/, '/ws'),
      },
      '/soap/federacion': {
        target: 'http://209.145.48.25:18082',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/soap\/federacion/, '/ws'),
      },
    },
  },
});
