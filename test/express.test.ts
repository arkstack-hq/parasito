import { describe, it } from 'vitest'

import express from 'express'
import request from '../src/index'

describe('express', () => {
    it('tests express apps through superagent-backed http requests', async () => {
        const app = express()

        app.use(express.json())
        app.post('/account', (request, response) => {
            response.status(201).json({
                body: request.body,
                query: request.query,
            })
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
