import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import WindiCSS from 'vite-plugin-windicss'

export default defineConfig({
  base: '/pomodoro-app/',
  plugins: [
    vue(),
    WindiCSS(),
  ],
})
