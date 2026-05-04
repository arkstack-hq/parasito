import { describe, expect, it } from 'vitest'

import { H3 } from 'h3'
import request from '../src/index'

describe('h3', () => {
    it('tests fetch-style h3 apps with the shared request API', async () => {
        const app = new H3()

        app.get('/account', (event) => {
            return {
                authorization: event.req.headers.get('authorization'),
                ok: true,
            }
        })

        const response = await request(app)
            .get('/account')
            .auth('abc123')
            .expect(200)
            .expect('content-type', /application\/json/)
            .expect({
                authorization: 'Bearer abc123',
                ok: true,
            })

        expect(response.body).toEqual({
            authorization: 'Bearer abc123',
            ok: true,
        })
    })
})
