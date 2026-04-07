import { defineConfig } from 'vite'
import vue2 from '@vitejs/plugin-vue2'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [vue2(), dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['vue', 'vant', '@conf-component-tool-lib/shared'],
      output: {
        globals: {
          vue: 'Vue',
          vant: 'vant',
        },
      },
    },
  },
})
