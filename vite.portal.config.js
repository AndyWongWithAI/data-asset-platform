import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/data-asset-portal/',
  root: 'src/portal',
  plugins: [react()],
  build: { outDir: '../../dist-portal', emptyOutDir: true },
  server: {
    port: 5174,
    proxy: { '/api': 'http://localhost:8078' },
  },
});
