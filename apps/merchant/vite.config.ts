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
      '@': path.resolve(__dirname, 'src'),
      '@orafi/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@orafi/transactions': path.resolve(__dirname, '../../packages/transactions/src'),
      '@orafi/customers': path.resolve(__dirname, '../../packages/customers/src'), 
      '@orafi/subscriptions': path.resolve(__dirname, '../../packages/subscriptions/src'),
    },
  },
    preview: {
    allowedHosts: ["dashboard.orafi.app"],
  },
  server: {
    host: true
  }
})
