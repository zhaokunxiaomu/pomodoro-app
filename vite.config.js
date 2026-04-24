import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import WindiCSS from 'vite-plugin-windicss'

export default defineConfig({
  base: '/pomodoro-app1/',
  plugins: [
    vue(),
    WindiCSS(),
  ],
})
