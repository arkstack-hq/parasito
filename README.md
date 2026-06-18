# Parasito

[![NPM Downloads](https://img.shields.io/npm/dt/parasito.svg)](https://www.npmjs.com/package/parasito)
[![npm version](https://img.shields.io/npm/v/parasito.svg)](https://www.npmjs.com/package/parasito)
[![License](https://img.shields.io/npm/l/parasito.svg)](https://github.com/arkstack-hq/parasito/blob/main/LICENSE)
[![codecov](https://codecov.io/gh/arkstack-hq/parasito/graph/badge.svg?token=ls1VVoFkYh)](https://codecov.io/gh/arkstack-hq/parasito)
[![Test](https://github.com/arkstack-hq/parasito/actions/workflows/test.yml/badge.svg)](https://github.com/arkstack-hq/parasito/actions/workflows/test.yml)
[![Publish to NPM](https://github.com/arkstack-hq/parasito/actions/workflows/publish.yml/badge.svg)](https://github.com/arkstack-hq/parasito/actions/workflows/publish.yml)

Universal TypeScript-first HTTP testing library for Node applications.

Parasito attaches one request API to framework apps, Node servers, and fetch-style handlers. Use it to test Arkstack, Express, Fastify, H3, Hono, Koa, plain Node handlers, already-listening servers, or remote URLs with the same fluent assertions.

## Install

```sh
pnpm add -D parasito
```

## Quick Start

```ts
import request from 'parasito';
import express from 'express';

const app = express();

app.get('/account', (_request, response) => {
  response.json({ ok: true });
});

await request(app).get('/account').expect(200).expect({ ok: true });
```

## Supported Targets

- Arkstack Applications
- Express and connect-style handlers
- Fastify instances
- H3 apps
- Hono apps
- Koa apps
- Plain Node request handlers
- Node `http.Server` instances
- Fetch-style functions and objects with a `fetch(request)` method
- Remote HTTP URLs

## API

```ts
await request(app)
  .post('/account')
  .set('authorization', 'Bearer token')
  .query({ expand: 'team' })
  .send({ name: 'Ada' })
  .expect(201)
  .expect('content-type', /json/)
  .expect((response) => {
    // Use your test runner's assertions here.
  });
```

Requests are promise-like, so you can `await` them directly. The resolved response includes:

- `status` and `statusCode`
- `ok`
- `headers` as Web `Headers`
- `header` as a plain object
- `text`
- `body`
- `raw`

### Request Bodies

`send()` picks a default `content-type` from the body when you do not set one yourself:

| Body                | Content type                        |
| ------------------- | ----------------------------------- |
| Object or array     | `application/json`                  |
| `URLSearchParams`   | `application/x-www-form-urlencoded` |
| `FormData`          | `multipart/form-data` (with boundary) |
| `string`            | `text/plain`                        |

```ts
await request(app)
  .post('/login')
  .send(new URLSearchParams({ email: 'ada@example.com', password: 'secret' }));

const form = new FormData();
form.set('avatar', new Blob(['…']), 'avatar.png');
await request(app).post('/profile').send(form);

await request(app).post('/notes').send('plain text note');
```

Set `content-type` explicitly with `set()` before `send()` to override the default. Responses sent as `application/x-www-form-urlencoded` are parsed into an object on `response.body`.

## Examples

### Arkstack

When testing arkstack, Parasito taps into your app core, loads all registered routes, config and middleware, allowing you to test with full context awareness.

```ts
import { app } from '../src/core/bootstrap';

await request(app)
  .get('/api')
  .set('Content-Type', 'application/json')
  .expect(200)
  .expect({
    title: 'Welcome to Arkstack',
    message: 'Server running — ready for requests',
  });
```

### H3

```ts
import { H3 } from 'h3';
import request from 'parasito';

const app = new H3();

app.get('/account', (event) => {
  return {
    authorization: event.req.headers.get('authorization'),
    ok: true,
  };
});

await request(app).get('/account').auth('token').expect(200).expect({
  authorization: 'Bearer token',
  ok: true,
});
```

### Hono

```ts
import { Hono } from 'hono';
import request from 'parasito';

const app = new Hono();

app.get('/account', (context) => {
  return context.json({ ok: true });
});

await request(app).get('/account').expect(200).expect({ ok: true });
```

### Fastify

```ts
import fastify from 'fastify';
import request from 'parasito';

const app = fastify();

app.post('/account', async (request) => {
  return { body: request.body };
});

try {
  await request(app)
    .post('/account')
    .send({ name: 'Ada' })
    .expect(200)
    .expect({ body: { name: 'Ada' } });
} finally {
  await app.close();
}
```

### Koa

```ts
import Koa from 'koa';
import request from 'parasito';

const app = new Koa();

app.use((context) => {
  context.body = { ok: true };
});

await request(app).get('/account').expect(200).expect({ ok: true });
```

### Plain Node

```ts
import request from 'parasito';

await request((_incoming, outgoing) => {
  outgoing.setHeader('content-type', 'application/json');
  outgoing.end(JSON.stringify({ ok: true }));
})
  .get('/health')
  .expect(200)
  .expect({ ok: true });
```

### Remote URLs

Use a string URL when the service is already running outside the current test process.

```ts
import request from 'parasito';

await request('https://api.example.com')
  .get('/health')
  .expect(200)
  .expect({ ok: true });
```

`URL` objects are supported too.

```ts
import request from 'parasito';

const api = new URL('https://api.example.com');

await request(api)
  .post('/account')
  .auth('token')
  .send({ name: 'Ada' })
  .expect(201);
```

## Development

```sh
pnpm install
pnpm install:arkstack
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
