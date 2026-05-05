import { defineConfig } from 'tsdown'

export default defineConfig({
    clean: true,
    format: ['esm', 'cjs'],
    minify: true,
    exports: true,
    sourcemap: false,
    outputOptions: {
        exports: 'named',
    },
})
