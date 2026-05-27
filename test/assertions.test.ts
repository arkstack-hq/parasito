import { describe, expect, it } from 'vitest'

import request from '../src/index'

describe('custom assertions', () => {
    const app = {
        fetch () {
            return new Response('Hello Beautiful World', { status: 200 })
        },
    }

    it('allows custom response assertions', async () => {
        const app = {
            fetch () {
                return Response.json({ framework: 'any' }, {
                    status: 200,
                    headers: {
                        'x-powered-by': 'parasito',
                    },
                })
            },
        }

        await request(app)
            .get('/')
            .expect(200)
            .expect('x-powered-by', 'parasito')
            .expect((response) => {
                expect(response.body).toEqual({ framework: 'any' })
            })
            .contains('{"framework":"any"}')
    })

    it('should contain text in any position', async () => {
        await request(app)
            .get('/')
            .contains('lo Beauti')
            .contains(/lo Beautiful/)
    })

    it('should contain text in at the start', async () => {
        await request(app)
            .get('/')
            .startsWith('Hello Beautiful')
            .startsWith(/Hello Beaut/)
    })

    it('should contain text in at the end', async () => {
        await request(app)
            .get('/')
            .endsWith('ul World')
            .endsWith(/iful World/)
    })
})
