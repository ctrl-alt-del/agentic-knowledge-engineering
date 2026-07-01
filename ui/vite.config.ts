import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    {
      name: 'ake-config',
      configureServer(server) {
        const root = path.resolve(import.meta.dirname, '..')

        server.middlewares.use((req, res, next) => {
          if (req.url === '/ake.json') {
            try {
              const content = fs.readFileSync(path.join(root, 'ake.json'), 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(content)
            } catch {
              res.statusCode = 404
              res.end('')
            }
            return
          }

          if (req.url?.startsWith('/skill/')) {
            const filePath = path.join(root, 'skill', req.url.slice(7))
            try {
              const content = fs.readFileSync(filePath, 'utf-8')
              const ext = path.extname(filePath)
              res.setHeader('Content-Type', ext === '.json' ? 'application/json' : 'text/markdown; charset=utf-8')
              res.end(content)
            } catch {
              res.statusCode = 404
              res.end('')
            }
            return
          }

          next()
        })
      },
    },
  ],
})
