import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@neeloong/table': fileURLToPath(new URL('./packages/table', import.meta.url)),
      '@neeloong/table-gantt': fileURLToPath(new URL('./packages/table-gantt', import.meta.url)),
      '@neeloong/table-vue': fileURLToPath(new URL('./packages/table-vue', import.meta.url)),
      'vue': fileURLToPath(new URL('./demo/node_modules/vue', import.meta.url)),
    }
  },
  css: {
    preprocessorOptions: {
      less: {

      },
    }
  }
})
