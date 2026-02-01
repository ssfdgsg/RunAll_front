import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 监听所有 IPv4 地址
    port: 3000,
    allowedHosts: ['runall.me', 'localhost', '157.230.37.18'], // 允许的域名
    hmr: {
      protocol: 'wss', // 使用 wss 协议（因为前端是 HTTPS）
      host: 'runall.me', // HMR 连接的主机名
      port: 443 // HTTPS 端口
    },
    proxy: {
      '/api': {
        target: 'https://47.110.74.199:7999',
        changeOrigin: true,
        secure: false // 忽略证书验证
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand'],
    exclude: []
  },
  resolve: {
    dedupe: ['react', 'react-dom']
  }
})
