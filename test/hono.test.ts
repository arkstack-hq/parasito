import { describe, it } from 'vitest'

import { Hono } from 'hono'
import request from '../src/index'

describe('hono', () => {
    it('tests fetch-style hono apps with the same request api', async () => {
        const app = new Hono()

        app.get('/account', (context) => {
            return context.json({
                authorization: context.req.header('authorization'),
                ok: true,
            })
        })

        await request(app)
            .get('/account')
            .auth('abc123')
            .expect(200)
            .expect('content-type', /application\/json/)
            .expect({
                authorization: 'Bearer abc123',
                ok: true,
            })
    })
})
