import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false // 개발 중 화면이 캐시되는 것을 막기 위해 잠시 꺼둡니다.
      },
      manifest: {
        name: 'O_miku_Z | 차원 오미쿠지',
        short_name: 'O_miku_Z',
        description: '11개 세계관을 넘나드는 차원 확장형 AI 점괘 서비스',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      // 프론트엔드에서 '/api'로 시작하는 요청을 보내면 백엔드(8000포트)로 토스해줍니다.
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  }
})
