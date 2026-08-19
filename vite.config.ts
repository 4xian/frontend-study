import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { markdownPlugin } from './build/markdown-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [markdownPlugin(), vue(), react(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    allowedHosts: ['jian.us.ci'],
  },
  build: {
    rollupOptions: {
      input: {
        app: fileURLToPath(new URL('./index.html', import.meta.url)),
        resourceHintsFixture: fileURLToPath(
          new URL(
            './src/categories/frontend/react/core/demos/resource-hints/resource-hints-fixture.html',
            import.meta.url,
          ),
        ),
      },
    },
  },
})
