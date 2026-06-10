import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()], 
  server: {
    proxy: {
      '/apple-api': {
        target: 'https://itunes.apple.com',
        changeOrigin: true, 
        rewrite: (path) => path.replace(/^\/apple-api/, '')
      }
    }
  }
})
