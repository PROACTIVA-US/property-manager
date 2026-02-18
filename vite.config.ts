import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/Shanie/',
  plugins: [react()],
  server: {
    port: 5180,        // Fixed port for PropertyManager
    strictPort: true,  // Fail if port is already in use (don't auto-increment)
  },
  preview: {
    port: 5180,
    strictPort: true,
  },
})
