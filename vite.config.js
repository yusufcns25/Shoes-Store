import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Shoes-Store/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        detail: resolve(__dirname, 'urun-detay.html'),
        admin: resolve(__dirname, 'admin.html'),
        kategori: resolve(__dirname, 'kategori.html'),
      },
    },
  },
})
