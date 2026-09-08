import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  base: '/The-Way/',

  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'root-pwa-redirect',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/manifest.json') {
            req.url = '/The-Way/manifest.json';
          } else if (req.url === '/manifest.webmanifest') {
            req.url = '/The-Way/manifest.webmanifest';
          } else if (req.url === '/sw.js') {
            req.url = '/The-Way/sw.js';
          }
          next();
        });
      },
    },
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    host: '0.0.0.0',
    port: 3000,
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});