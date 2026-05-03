import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'  // ← change this line
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})