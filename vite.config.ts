import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { Plugin } from 'vite';

// Custom plugin to handle markdown files
function markdownPlugin(): Plugin {
  return {
    name: 'vite-plugin-markdown',
    transform(code, id) {
      if (id.endsWith('.md')) {
        // Simply export the content as a string
        return `export default ${JSON.stringify(code)};`;
      }
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    markdownPlugin(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Persona Chat',
        short_name: 'Persona',
        description: 'Chat with historical figures using AI',
        theme_color: '#3b82f6',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
