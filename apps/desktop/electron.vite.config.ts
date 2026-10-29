import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  main: {
    plugins: [],
    build: {
      sourcemap: false,
      minify: process.env.NODE_ENV === 'production',
      rollupOptions: {
        // ws가 있으면 쓰고 없으면 건너뛰는 선택 모듈. 묶으면 시작할 때 바로 멈춘다
        external: ['bufferutil', 'utf-8-validate']
      }
    }
  },
  preload: {
    plugins: [],
    build: {
      sourcemap: false,
      minify: process.env.NODE_ENV === 'production'
    }
  },
  renderer: {
    root: 'src/renderer',
    build: {
      sourcemap: false,
      minify: process.env.NODE_ENV === 'production',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html')
        }
      }
    },
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@assets': resolve('src/renderer/src/assets'),
        '@styles': resolve('src/renderer/src/styles'),
        '@components': resolve('src/renderer/src/component'),
        '@hooks': resolve('src/renderer/src/hooks'),
        '@pages': resolve('src/renderer/src/page')
      }
    },
    plugins: [react(), svgr({ include: '**/*.svg' })]
  }
})
