import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      sourcemap: false,
      minify: process.env.NODE_ENV === 'production',
      outDir: 'dist-electron',
      rollupOptions: {
        external: Object.keys(require('./package.json').dependencies || {})
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      sourcemap: false,
      minify: process.env.NODE_ENV === 'production',
      outDir: 'dist-electron',
      rollupOptions: {
        external: Object.keys(require('./package.json').dependencies || {})
      }
    }
  },
  renderer: {
    root: 'src/renderer',
    build: {
      sourcemap: false,
      minify: process.env.NODE_ENV === 'production',
      outDir: 'dist-electron',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html')
        },
        external: Object.keys(require('./package.json').dependencies || {})
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
