import { describe, it } from 'vitest'

import Koa from 'koa'
import request from '../src/index'

describe('koa', () => {
    it('tests koa apps through their callback handler', async () => {
        const app = new Koa()

        app.use(async (context) => {
            if (context.path !== '/account' || context.method !== 'POST') {
                context.status = 404

                return
            }

            const body = await readJsonBody(context.req)

            context.status = 201
            context.body = {
                body,
                query: context.query,
            }
        })

        await request(app)
            .post('/account')
            .query({ expand: 'team' })
            .send({ name: 'Ada' })
            .expect(201)
            .expect({
                body: { name: 'Ada' },
                query: { expand: 'team' },
            })
    })
})

/**
 * Reads and parses a JSON request body from Koa's incoming message.
 *
 * @param incoming - Incoming request stream to read.
 * @returns Parsed JSON body.
 */
async function readJsonBody (incoming: Koa.ParameterizedContext['req']): Promise<unknown> {
    let text = ''

    for await (const chunk of incoming) {
        text += chunk
    }

    return JSON.parse(text)
}
