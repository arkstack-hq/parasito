import type { App, FastifyLike, FetchLike, NodeHandler } from './types'

import type { Server } from 'node:http'

export function isFetchApp (app: App): app is { fetch: FetchLike } {
    return typeof app === 'object' && app !== null && 'fetch' in app && typeof app.fetch === 'function'
}

export function isServer (app: App): app is Server {
    return typeof app === 'object' && app !== null && 'listen' in app && typeof app.listen === 'function'
}

export function isFastifyApp (app: App): app is FastifyLike {
    return typeof app === 'object' && app !== null && 'ready' in app && typeof app.ready === 'function' && 'server' in app && isServer(app.server)
}

export function isNodeHandler (app: FetchLike | NodeHandler): app is NodeHandler {
    return app.length >= 2
}
