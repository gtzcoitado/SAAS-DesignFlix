import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // Importa o módulo 'path' do Node.js

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Adiciona a configuração do 'alias' aqui
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})