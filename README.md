# Arktest

[![NPM Downloads](https://img.shields.io/npm/dt/arktest.svg)](https://www.npmjs.com/package/arktest)
[![npm version](https://img.shields.io/npm/v/arktest.svg)](https://www.npmjs.com/package/arktest)
[![License](https://img.shields.io/npm/l/arktest.svg)](https://github.com/arkstack-hq/arktest/blob/main/LICENSE)
[![codecov](https://codecov.io/gh/arkstack-hq/arktest/graph/badge.svg?token=ls1VVoFkYh)](https://codecov.io/gh/arkstack-hq/arktest)
[![CI](https://github.com/arkstack-hq/arktest/actions/workflows/ci.yml/badge.svg)](https://github.com/arkstack-hq/arktest/actions/workflows/ci.yml)
[![Deploy Documentation](https://github.com/arkstack-hq/arktest/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/arkstack-hq/arktest/actions/workflows/deploy-docs.yml)
[![Publish to NPM](https://github.com/arkstack-hq/arktest/actions/workflows/publish.yml/badge.svg)](https://github.com/arkstack-hq/arktest/actions/workflows/publish.yml)

Universal TypeScript-first HTTP testing for Node applications.

arktest gives you one request API for framework apps, Node servers, and fetch-style handlers. Use it to test Express, Fastify, H3, Hono, plain Node handlers, already-listening servers, or remote URLs with the same fluent assertions.

## Install

```sh
pnpm add -D arktest
```

## Quick Start

```ts
import request from 'arktest';
import express from 'express';

const app = express();

app.get('/account', (_request, response) => {
  response.json({ ok: true });
});

await request(app).get('/account').expect(200).expect({ ok: true });
```

## Supported Targets

- Express and connect-style handlers
- Fastify instances
- H3 apps
- Hono apps
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

## Examples

### H3

```ts
import { H3 } from 'h3';
import request from 'arktest';

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
import request from 'arktest';

const app = new Hono();

app.get('/account', (context) => {
  return context.json({ ok: true });
});

await request(app).get('/account').expect(200).expect({ ok: true });
```

### Fastify

```ts
import fastify from 'fastify';
import request from 'arktest';

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

### Plain Node

```ts
import request from 'arktest';

await request((_incoming, outgoing) => {
  outgoing.setHeader('content-type', 'application/json');
  outgoing.end(JSON.stringify({ ok: true }));
})
  .get('/health')
  .expect(200)
  .expect({ ok: true });
```

## Development

```sh
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
