import { describe, it } from 'vitest'
import { dirname, join } from 'node:path'

import { fileURLToPath } from 'node:url'
import request from '../src/index'

const __dirname = dirname(fileURLToPath(import.meta.url))
const arkstackRoot = join(__dirname, 'arkstack-app')

describe('express', () => {
    it('tests arkstack apps through superagent-backed http requests', async () => {
        const { Arkstack } = await import('./arkstack-app/node_modules/@arkstack/contract/dist')
        Arkstack.setRootDir(arkstackRoot)
        const { app } = await import(('./arkstack-app/.arkstack/build/core/bootstrap'))

        app.setRootDir(arkstackRoot)

        await request(app)
            .get('/api')
            .set('Content-Type', 'application/json')
            .query({ expand: 'team' })
            .expect(200)
            .expect({
                title: 'Welcome to Arkstack',
                message: 'Server running — ready for requests',
                query: { expand: 'team' }
            })
    })
})
