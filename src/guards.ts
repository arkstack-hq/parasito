import type { App, FastifyLike, FetchLike, IsArkstack, KoaLike, NodeHandler } from './types'

import type { Server } from 'node:http'

/**
 * Checks whether an app exposes a getAppInstance() method that returns a 
 * supported app instance.
 *
 * @param app - App target to inspect.
 * @returns True when the app has a callable getAppInstance method that returns a 
 * supported app instance.
 */
export function isArkstackApp (app: App): app is IsArkstack {
    return (typeof app === 'object' || typeof app === 'function') &&
        app !== null &&
        'startup' in app &&
        'getRouter' in app &&
        'getAppInstance' in app &&
        typeof app.getAppInstance === 'function' &&
        typeof app.getRouter === 'function' &&
        typeof app.startup === 'function'
}

/**
 * Checks whether an app exposes a fetch(request) method.
 *
 * @param app - App target to inspect.
 * @returns True when the app has a callable fetch method.
 */
export function isFetchApp (app: App): app is { fetch: FetchLike } {
    // return (typeof app === 'object' || typeof app === 'function') &&
    return typeof app === 'object' &&
        app !== null &&
        'fetch' in app &&
        typeof app.fetch === 'function'
}

/**
 * Checks whether an app behaves like a Node HTTP server.
 *
 * @param app - App target to inspect.
 * @returns True when the app has a callable listen method.
 */
export function isServer (app: any): app is Server {
    // return (typeof app === 'object' || typeof app === 'function') &&
    return typeof app === 'object' &&
        app !== null &&
        'listen' in app &&
        typeof app.listen === 'function'
}

/**
 * Checks whether an app has the Fastify-ready shape Parasito needs.
 *
 * @param app - App target to inspect.
 * @returns True when the app exposes ready() and a Node server.
 */
export function isFastifyApp (app: App): app is FastifyLike {
    // return (typeof app === 'object' || typeof app === 'function') &&
    return typeof app === 'object' &&
        app !== null && 'ready' in app &&
        typeof app.ready === 'function' &&
        'server' in app &&
        isServer(app.server as never)
}

/**
 * Checks whether an app exposes a Koa-style callback() handler factory.
 *
 * @param app - App target to inspect.
 * @returns True when the app has a callable callback method.
 */
export function isKoaApp (app: App): app is KoaLike {
    // return (typeof app === 'object' || typeof app === 'function') &&
    return typeof app === 'object' &&
        app !== null &&
        'callback' in app &&
        typeof app.callback === 'function'
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
