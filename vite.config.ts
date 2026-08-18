import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-icon.png'],
      workbox: {
        navigateFallbackDenylist: [/^\/o\//, /^\/api\//],
      },
      manifest: {
        name: 'A/C HELP',
        short_name: 'A/C HELP',
        description: 'Orçamento rápido para oficinas de ar-condicionado automotivo',
        theme_color: '#1b3f69',
        background_color: '#eef1f5',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-icon.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-icon.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
});
