import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0', // sabhi IPs aur domain se access allow
    port: 5679,
    strictPort: true,
    allowedHosts: [
      'hrmsb2b.btplsoft.com'
    ]
  },
  plugins: [react(), tailwindcss()],
})