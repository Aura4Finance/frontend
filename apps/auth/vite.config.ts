import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@orafi/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
    preview: {
    allowedHosts: ["auth.orafi.app"],
  },
  server: {
    host: true,
  }
})
