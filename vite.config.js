import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/affiliate-dashboard/', // Replace with your GitHub repo name
  server: {
    port: 3000,
    host: true
  }
})
