import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': API_URL,
    },
  },
});
