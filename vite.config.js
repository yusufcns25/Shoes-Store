import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        detail: resolve(__dirname, 'urun-detay.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
})
