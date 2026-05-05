import type { Body, NodeHandler, RequestState } from './types'

import { createServer } from 'node:http'
import { isJsonBody } from './helpers'

/**
 * Creates a Fetch API Request from the internal request state.
 *
 * @param state - Internal request state to convert.
 * @returns A Fetch API Request ready for fetch-style handlers.
 */
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

/**
 * Resolves a request path and query parameters against a base URL.
 *
 * @param baseUrl - Base URL to resolve relative request paths against.
 * @param state - Internal request state containing the path and query string.
 * @returns Fully resolved URL string.
 */
export function createUrl (baseUrl: string, state: RequestState): string {
    const url = new URL(state.path, baseUrl)

    for (const [name, value] of state.query) {
        url.searchParams.append(name, value)
    }

    return url.toString()
}

/**
 * Wraps a Node request handler in an HTTP server.
 *
 * @param handler - Node request handler to serve.
 * @returns HTTP server for the provided handler.
 */
export function createNodeServer (handler: NodeHandler) {
    return createServer(handler)
}

/**
 * Converts a request body into a Fetch-compatible body payload.
 *
 * @param body - Non-null request body to serialize.
 * @returns Fetch-compatible body payload.
 */
function serializeFetchBody (body: Exclude<Body, null | undefined>): BodyInit {
    if (isJsonBody(body)) {
        return JSON.stringify(body)
    }

    return body as BodyInit
}
