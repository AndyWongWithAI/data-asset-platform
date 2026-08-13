import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/data-asset-platform/',
  plugins: [react()],
});
