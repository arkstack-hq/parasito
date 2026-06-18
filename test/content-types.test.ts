import { describe, expect, it } from 'vitest'

import { Hono } from 'hono'
import express from 'express'
import request from '../src/index'

describe('content types', () => {
    describe('fetch targets', () => {
        it('sends URLSearchParams as application/x-www-form-urlencoded', async () => {
            const app = new Hono()

            app.post('/form', async (context) => {
                return context.json({
                    body: await context.req.parseBody(),
                    type: context.req.header('content-type'),
                })
            })

            await request(app)
                .post('/form')
                .send(new URLSearchParams({ city: 'Lagos', name: 'Ada' }))
                .expect(200)
                .expect((response) => {
                    expect(response.body.type).toContain('application/x-www-form-urlencoded')
                    expect(response.body.body).toEqual({ city: 'Lagos', name: 'Ada' })
                })
        })

        it('sends FormData as multipart/form-data with a boundary', async () => {
            const app = new Hono()

            app.post('/upload', async (context) => {
                const body = await context.req.parseBody()

                return context.json({
                    name: body.name,
                    type: context.req.header('content-type'),
                })
            })

            const form = new FormData()
            form.set('name', 'Ada')

            await request(app)
                .post('/upload')
                .send(form)
                .expect(200)
                .expect((response) => {
                    expect(response.body.type).toContain('multipart/form-data')
                    expect(response.body.type).toContain('boundary=')
                    expect(response.body.name).toBe('Ada')
                })
        })

        it('sends strings as text/plain', async () => {
            const app = new Hono()

            app.post('/text', async (context) => {
                return context.json({
                    text: await context.req.text(),
                    type: context.req.header('content-type'),
                })
            })

            await request(app)
                .post('/text')
                .send('hello world')
                .expect(200)
                .expect((response) => {
                    expect(response.body.type).toContain('text/plain')
                    expect(response.body.text).toBe('hello world')
                })
        })

        it('parses application/x-www-form-urlencoded responses into objects', async () => {
            const app = new Hono()

            app.get('/form', (context) => {
                return context.body('city=Lagos&name=Ada', 200, {
                    'content-type': 'application/x-www-form-urlencoded',
                })
            })

            await request(app)
                .get('/form')
                .expect(200)
                .expect({ city: 'Lagos', name: 'Ada' })
        })

        it('keeps an explicit content type set before send', async () => {
            const app = new Hono()

            app.post('/text', async (context) => {
                return context.json({ type: context.req.header('content-type') })
            })

            await request(app)
                .post('/text')
                .set('content-type', 'text/csv')
                .send('a,b,c')
                .expect(200)
                .expect({ type: 'text/csv' })
        })
    })

    describe('superagent targets', () => {
        it('sends URLSearchParams as application/x-www-form-urlencoded', async () => {
            const app = express()

            app.use(express.urlencoded({ extended: true }))
            app.post('/form', (request, response) => {
                response.json({
                    body: request.body,
                    type: request.headers['content-type'],
                })
            })

            await request(app)
                .post('/form')
                .send(new URLSearchParams({ city: 'Lagos', name: 'Ada' }))
                .expect(200)
                .expect((response) => {
                    expect(response.body.type).toContain('application/x-www-form-urlencoded')
                    expect(response.body.body).toEqual({ city: 'Lagos', name: 'Ada' })
                })
        })

        it('sends FormData as multipart/form-data', async () => {
            const app = express()

            app.post('/upload', (request, response) => {
                response.json({ type: request.headers['content-type'] })
            })

            const form = new FormData()
            form.set('name', 'Ada')

            await request(app)
                .post('/upload')
                .send(form)
                .expect(200)
                .expect((response) => {
                    expect(response.body.type).toContain('multipart/form-data')
                    expect(response.body.type).toContain('boundary=')
                })
        })

        it('sends strings as text/plain', async () => {
            const app = express()

            app.use(express.text())
            app.post('/text', (request, response) => {
                response.json({
                    text: request.body,
                    type: request.headers['content-type'],
                })
            })

            await request(app)
                .post('/text')
                .send('hello world')
                .expect(200)
                .expect((response) => {
                    expect(response.body.type).toContain('text/plain')
                    expect(response.body.text).toBe('hello world')
                })
        })
    })
})
