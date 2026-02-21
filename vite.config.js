import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://13.49.72.166/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1500, // adjust warning limit
    rollupOptions: {
      output: {
        // remove custom react-vendor split to avoid circular dependencies
        // and the "Cannot access 'ne' before initialization" error
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // put all third-party code in a single ``vendor`` chunk
            return 'vendor'
          }
        }
      }
    }
  }
})