import { URL, fileURLToPath } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd()); // 获取 .env 文件里的环境变量
  return {
    base: env.VITE_PUBLIC_BASE, // 打包使用 / 开发环境使用 ./
    css: {
      postcss: {
        plugins: [tailwind(), autoprefixer()],
      },
      preprocessorOptions: {
        scss: {
          api: "modern",
          additionalData: `@use "@/style/variable.scss" as *;`, // 全局注入变量文件，这样在vue文件中使用变量时，不需要再引入,但是独立的scss文件中使用变量时，需要引入
        },
      },
    },
    plugins: [vue(), vueDevTools()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: "0.0.0.0", // 允许外部访问
      port: 5004,
      proxy: {
        // 配置代理 '/api' 路由
        '^/api(.*)': {
          // target: 'http://127.0.0.1:5001/',
          target: 'http://localhost:8080/',
          changeOrigin: true,
          secure: false,
          ws: true,
          rewrite: path => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
