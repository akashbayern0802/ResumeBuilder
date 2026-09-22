import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api/bedrock-mantle': {
        target: 'https://bedrock-mantle.us-east-1.api.aws',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bedrock-mantle/, ''),
        secure: false
      }
    }
  },
});

