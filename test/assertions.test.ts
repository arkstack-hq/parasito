import { describe, expect, it } from 'vitest'

import request from '../src/index'

describe('custom assertions', () => {
    it('allows custom response assertions', async () => {
        const app = {
            fetch () {
                return Response.json({ framework: 'any' }, {
                    headers: {
                        'x-powered-by': 'httpest',
                    },
                })
            },
        }

        await request(app)
            .get('/')
            .expect('x-powered-by', 'httpest')
            .expect((response) => {
                expect(response.body).toEqual({ framework: 'any' })
            })
    })
})
