import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

function canonicalGymRoute(): Plugin {
  const redirectDuplicatePath = (url: string | undefined) => {
    const pathname = (url ?? '').split('?')[0]
    return pathname === '/gym/Gym' || pathname.startsWith('/gym/Gym/')
  }

  const redirect = (
    url: string | undefined,
    res: { statusCode: number; setHeader: (name: string, value: string) => void; end: () => void },
  ) => {
    const query = url?.includes('?') ? url.slice(url.indexOf('?')) : ''
    res.statusCode = 308
    res.setHeader('Location', `/gym/${query}`)
    res.end()
  }

  return {
    name: 'canonical-gym-route',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (redirectDuplicatePath(req.url)) {
          redirect(req.url, res)
          return
        }
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (redirectDuplicatePath(req.url)) {
          redirect(req.url, res)
          return
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), canonicalGymRoute()],
  base: '/gym/',
})
