import { defineConfig } from 'vite'
import { resolve } from 'path'
import { builtinModules } from 'module'

export default defineConfig({
  build: {
    target: 'node18',
    outDir: 'dist',
    ssr: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      // Externalize Node.js built-ins and all dependencies
      external: [
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
        /^[^./].*/, // All non-relative imports (node_modules)
      ],
    },
    minify: false,
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
