import { defineConfig } from 'vite'
//import { ratter } from '@ratter/vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    // ratter({
    //   domain: "orafi",
    //   tld: "test",
    //   deleteOnExit: true,
    //   verbose: true,
    // })
  ],
  server: {
    host: true,
    //allowedHosts: ['orafi.test']
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
