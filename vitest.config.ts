import { ViteUserConfig, defaultExclude, defineConfig } from 'vitest/config'

export default defineConfig({
    resolve: {
        tsconfigPaths: true,
    } as ViteUserConfig['resolve'],

    test: {
        // retry: 10,
        root: './',
        passWithNoTests: true,
        environment: 'node',
        include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
        exclude: [
            ...defaultExclude,
            '**/arkstack-*/**',
        ],
        env: {
            NODE_ENV: 'test',
            VERBOSITY: '0'
        },
        coverage: {
            reporter: ['text', 'json', 'html', 'lcov'],
            reportsDirectory: 'coverage',
            exclude: ['**/node_modules/**', '**/dist/**', '**/cypress/**', '**/.{idea,git,cache,output,temp}/**', '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*', '**/.h3ravel/**'],
        }
    }
})
