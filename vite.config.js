import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 监听所有 IPv4 地址
    port: 3000,
    allowedHosts: ['runall.me', 'localhost', '157.230.37.18'], // 允许的域名
    hmr: false // 禁用 HMR
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand'],
    exclude: []
  },
  resolve: {
    dedupe: ['react', 'react-dom']
  }
})
