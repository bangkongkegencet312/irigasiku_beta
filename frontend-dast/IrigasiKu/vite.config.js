import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url' 
import { VitePWA } from 'vite-plugin-pwa' 

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'], 
      manifest: {
        name: 'IrigasiKu',
        short_name: 'IrigasiKu',
        description: 'Monitoring Irigasi Pintar Berbasis IoT',
        theme_color: '#16a34a', 
        background_color: '#ffffff',
        display: 'standalone', 
        start_url: '/',
        id: '/',
        icons: [
          {
            src: 'pwa-192x192.jpg',
            sizes: '192x192',
            type: 'image/jpg'
          },
          {
            src: 'pwa-512x512.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable' 
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      // 👇 Jalur pintas kamu tetap aman di sini
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})