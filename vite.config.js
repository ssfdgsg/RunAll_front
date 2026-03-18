import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const blockedRepoPathPattern = /(^|\/)\.(git|svn|hg)(\/|$)/i

const blockRepoInternalsPlugin = () => {
  const denyRepoInternals = (req, res, next) => {
    const requestPath = decodeURIComponent((req.url || '').split('?')[0])

    if (blockedRepoPathPattern.test(requestPath)) {
      res.statusCode = 403
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.end('Forbidden')
      return
    }

    next()
  }

  return {
    name: 'block-repo-internals',
    configureServer(server) {
      server.middlewares.use(denyRepoInternals)
    },
    configurePreviewServer(server) {
      server.middlewares.use(denyRepoInternals)
    }
  }
}

export default defineConfig({
  plugins: [react(), blockRepoInternalsPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['runall.me', 'localhost', '157.230.37.18'],
    hmr: false,
    fs: {
      deny: ['.git', '.svn', '.hg', '.env', '.env.*', '*.{crt,pem,key}']
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
