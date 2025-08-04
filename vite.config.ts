import { defineConfig } from 'vite'
import path from 'path'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'TestHelpers',
      formats: ['es', 'cjs'],
      fileName: (format) => format === 'es' ? 'index.js' : 'index.cjs'
    },
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: [
        '@vue/test-utils',
        'deepmerge',
        'emittery',
        'jsonwebtoken',
        'mitt',
        'moment',
        'node-rsa',
        'socket.io-client',
        'uuid',
        'vitest',
        'vue',
        'vue-template-compiler'
      ],
      output: {
        exports: 'named',
      }
    },
    minify: false,
  },
  plugins: [
    dts({
      tsconfigPath: 'tsconfig.build.json',
      include: ['src']
    })
  ]
})
