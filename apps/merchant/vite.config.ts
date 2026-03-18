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
      '@orafi/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@orafi/transactions': path.resolve(__dirname, '../../packages/transactions/src'),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173
  }
})
