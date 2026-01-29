import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 监听所有 IPv4 地址
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:7999',
        changeOrigin: true
      }
    }
  }
})
