import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
  },
  preview: {
    allowedHosts: ['orafi.app'],
  },
  resolve: {
    alias: {
      '@orafi/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@': path.resolve(__dirname, './src'),
    },
  },
})
