import type { App, FastifyLike, FetchLike, NodeHandler } from './types'

import type { Server } from 'node:http'

/**
 * Checks whether an app exposes a fetch(request) method.
 *
 * @param app - App target to inspect.
 * @returns True when the app has a callable fetch method.
 */
export function isFetchApp (app: App): app is { fetch: FetchLike } {
    return typeof app === 'object' && app !== null && 'fetch' in app && typeof app.fetch === 'function'
}

/**
 * Checks whether an app behaves like a Node HTTP server.
 *
 * @param app - App target to inspect.
 * @returns True when the app has a callable listen method.
 */
export function isServer (app: App): app is Server {
    return typeof app === 'object' && app !== null && 'listen' in app && typeof app.listen === 'function'
}

/**
 * Checks whether an app has the Fastify-ready shape Parasito needs.
 *
 * @param app - App target to inspect.
 * @returns True when the app exposes ready() and a Node server.
 */
export function isFastifyApp (app: App): app is FastifyLike {
    return typeof app === 'object' && app !== null && 'ready' in app && typeof app.ready === 'function' && 'server' in app && isServer(app.server)
}

/**
 * Distinguishes Node request handlers from fetch-like functions by arity.
 *
 * @param app - Function target to inspect.
 * @returns True when the function expects Node request and response arguments.
 */
export function isNodeHandler (app: FetchLike | NodeHandler): app is NodeHandler {
    return app.length >= 2
}
