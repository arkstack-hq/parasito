import { describe, it } from 'vitest'

import fastify from 'fastify'
import request from '../src/index'

describe('fastify', () => {
    it('tests fastify instances through their underlying node server', async () => {
        const app = fastify()

        app.post('/account', async (request) => {
            return {
                body: request.body,
                query: request.query,
            }
        })

        try {
            await request(app)
                .post('/account')
                .query({ expand: 'team' })
                .send({ name: 'Ada' })
                .expect(200)
                .expect({
                    body: { name: 'Ada' },
                    query: { expand: 'team' },
                })
        } finally {
            await app.close()
        }
    })
})
