import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import cleanPlugin from 'vite-plugin-clean';

export default defineConfig({
  plugins: [react(),tailwindcss(),cleanPlugin()],
})