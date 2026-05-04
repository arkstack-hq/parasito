import { describe, it } from 'vitest'

import { createServer } from 'node:http'
import request from '../src/index'

describe('node', () => {
    it('tests plain node request handlers', async () => {
        await request((incoming, outgoing) => {
            outgoing.setHeader('content-type', 'application/json')
            outgoing.statusCode = 201
            outgoing.end(JSON.stringify({
                authorization: incoming.headers.authorization,
                url: incoming.url,
            }))
        })
            .post('/account')
            .query({ expand: 'team' })
            .auth('abc123')
            .expect(201)
            .expect({
                authorization: 'Bearer abc123',
                url: '/account?expand=team',
            })
    })

    it('tests plain node servers', async () => {
        const server = createServer((_incoming, outgoing) => {
            outgoing.setHeader('content-type', 'application/json')
            outgoing.end(JSON.stringify({ ok: true }))
        })

        await request(server)
            .get('/health')
            .expect(200)
            .expect({ ok: true })
    })
})
