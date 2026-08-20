/// <reference types="vitest/config" />
import 'dotenv/config'
import path from 'path'
import { defineConfig, Plugin } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function whatsappWebhookPlugin(): Plugin {
  return {
    name: 'whatsapp-webhook-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        if (url.startsWith('/api/whatsapp')) {
          if (req.method === 'POST') {
            let bodyStr = ''
            req.on('data', (chunk) => {
              bodyStr += chunk.toString()
            })
            req.on('end', async () => {
              try {
                const contentType = req.headers['content-type'] || ''
                let body: Record<string, any> = {}

                if (contentType.includes('application/x-www-form-urlencoded')) {
                  const params = new URLSearchParams(bodyStr)
                  params.forEach((val, key) => {
                    body[key] = val
                  })
                } else {
                  try {
                    body = JSON.parse(bodyStr)
                  } catch {
                    body = { Body: bodyStr }
                  }
                }

                const headersObj: Record<string, string> = {}
                Object.keys(req.headers).forEach((key) => {
                  const val = req.headers[key]
                  if (typeof val === 'string') headersObj[key] = val
                })

                const { handleWhatsAppWebhook } = await import('./src/lib/whatsappWebhookService')
                const response = await handleWhatsAppWebhook(body, headersObj)
                res.statusCode = response.status
                res.setHeader('Content-Type', response.contentType)
                res.end(response.body)
              } catch (err: any) {
                console.error('Error in WhatsApp webhook middleware:', err)
                res.statusCode = 500
                res.end(JSON.stringify({ error: err.message || err }))
              }
            })
            return
          } else {
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/plain')
            res.end('Meyker WhatsApp Webhook Endpoint Active')
            return
          }
        }
        next()
      })
    },
  }
}

export default defineConfig({
  server: {
    port: 3000,
    allowedHosts: true,
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
      tslib: 'tslib/tslib.es6.mjs',
    },
  },
  plugins: [
    whatsappWebhookPlugin(),
    !process.env.VITEST && tanstackStart(),
    tailwindcss(),
    viteReact(),
  ].filter(Boolean),
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    pool: 'forks',
  },
})