import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'


// https://vite.dev/config/
export default defineConfig({
logLevel: 'error', // Suppress warnings, only show errors
plugins: [
base44({
    legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
    hmrNotifier: true,
    navigationNotifier: true,
    visualEditAgent: true
}),
react(),
],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/admin': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
