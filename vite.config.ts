/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      tslib: 'tslib/tslib.es6.mjs',
    },
  },
  plugins: [
    !process.env.VITEST && tanstackStart(),
    tailwindcss(),
    // react's vite plugin must come after start's vite plugin
    viteReact(),
  ].filter(Boolean),
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    pool: 'forks',
  },
})