
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { recursosAndroid } from './scripts/recursosAndroid.js'

export default defineConfig(({ mode }) => ({
  publicDir: mode === 'android' ? false : 'public',
  plugins: [react(), ...(mode === 'android' ? [recursosAndroid()] : [])],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
}))

