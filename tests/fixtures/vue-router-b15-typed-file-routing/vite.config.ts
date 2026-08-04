import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import VueRouter from 'vue-router/vite'
import Vue from '@vitejs/plugin-vue'

const fixtureRoot = fileURLToPath(new URL('.', import.meta.url))
const buildOutput = fileURLToPath(
  new URL('../../../node_modules/.tmp/vue-router-b15-build', import.meta.url),
)

export default defineConfig({
  root: fixtureRoot,
  plugins: [
    VueRouter({
      root: fixtureRoot,
      routesFolder: 'pages',
      dts: 'generated/route-map.d.ts',
      watch: false,
    }),
    Vue(),
  ],
  build: {
    outDir: buildOutput,
    emptyOutDir: true,
  },
})
