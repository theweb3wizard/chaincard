import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'ChainCard Nexus',
        short_name: 'ChainCard',
        description: 'Your wallet has a story. Now it has a world. Transform any Ethereum wallet into a living 3D identity universe.',
        theme_color: '#080B12',
        background_color: '#080B12',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        categories: ['blockchain', 'web3', 'identity', 'crypto', 'productivity'],
        icons: [
          {
            src: '/favicon.svg',
            sizes: '32x32',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.ipfs\..*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ipfs-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/api\.coingecko\.com\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'price-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'ES2022',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
          viem: ['viem'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});