import { defineConfig } from 'tsdown'

export default defineConfig({
    format: ['esm', 'cjs'],
    minify: true,
    exports: true,
    outputOptions: {
        exports: 'named',
    },
})
