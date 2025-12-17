import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // 🔑 Обязательно: base = '/<имя-репозитория>/'
  base: '/currency-app/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'Курсы валют',
        short_name: 'Курсы',
        description: 'Приложение для просмотра и конвертации валют',
        theme_color: '#000000', // ← лучше чёрный, как у тебя в дизайне
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            // 🔁 Замени localhost на твой Render URL!
            urlPattern: /^https:\/\/currency-app-api\.onrender\.com\/api\/.+/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 3600,
              },
            },
          },
        ],
      },
    }),
  ],
});