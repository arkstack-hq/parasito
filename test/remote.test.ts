import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterEach, beforeEach, describe, it } from 'vitest'
import request from '../src/index.js'

describe('remote urls', () => {
    let baseUrl: string
    let server: Server

    beforeEach(async () => {
        server = createServer((incoming, outgoing) => {
            outgoing.setHeader('content-type', 'application/json')
            outgoing.statusCode = incoming.method === 'POST' ? 201 : 200

            let body = ''
            incoming.on('data', (chunk) => {
                body += chunk
            })
            incoming.on('end', () => {
                outgoing.end(JSON.stringify({
                    authorization: incoming.headers.authorization,
                    body: body ? JSON.parse(body) : undefined,
                    method: incoming.method,
                    url: incoming.url,
                }))
            })
        })

        await new Promise<void>((resolve, reject) => {
            server.once('error', reject)
            server.listen(0, '127.0.0.1', () => {
                server.off('error', reject)
                const address = server.address() as AddressInfo
                baseUrl = `http://127.0.0.1:${address.port}`
                resolve()
            })
        })
    })

    afterEach(async () => {
        await new Promise<void>((resolve, reject) => {
            server.close((error) => {
                if (error) {
                    reject(error)

                    return
                }

                resolve()
            })
        })
    })

    it('tests remote url strings', async () => {
        await request(baseUrl)
            .post('/account')
            .query({ expand: 'team' })
            .auth('abc123')
            .send({ name: 'Ada' })
            .expect(201)
            .expect({
                authorization: 'Bearer abc123',
                body: { name: 'Ada' },
                method: 'POST',
                url: '/account?expand=team',
            })
    })

    it('tests remote URL objects', async () => {
        await request(new URL(baseUrl))
            .get('/health')
            .expect(200)
            .expect({
                method: 'GET',
                url: '/health',
            })
    })
})
