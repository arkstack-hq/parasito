import type { Body, NodeHandler, RequestState } from './types'

import { createServer } from 'node:http'
import { isJsonBody } from './helpers'

export function createFetchRequest (state: RequestState): Request {
    const url = createUrl('http://127.0.0.1', state)
    const init: RequestInit = {
        headers: state.headers,
        method: state.method,
    }

    if (state.body !== undefined && state.body !== null && state.method !== 'GET' && state.method !== 'HEAD') {
        init.body = serializeFetchBody(state.body)
    }

    return new Request(url, init)
}

export function createUrl (baseUrl: string, state: RequestState): string {
    const url = new URL(state.path, baseUrl)

    for (const [name, value] of state.query) {
        url.searchParams.append(name, value)
    }

    return url.toString()
}

export function createNodeServer (handler: NodeHandler) {
    return createServer(handler)
}

function serializeFetchBody (body: Exclude<Body, null | undefined>): BodyInit {
    if (isJsonBody(body)) {
        return JSON.stringify(body)
    }

    return body as BodyInit
}
