import type { App, NodeHandler, PResponse, RequestState } from './types'
import { createFetchRequest, createNodeServer } from './fetch'
import { isFastifyApp, isFetchApp, isKoaApp, isNodeHandler, isServer } from './guards'
import { requestWithServer, requestWithSuperAgent, requestWithTemporaryServer } from './adapters'

import { normalizeFetchResponse } from './response'

/**
 * Routes a request state to the adapter that matches the provided app target.
 *
 * @param app - App target to dispatch against.
 * @param state - Internal request state to dispatch.
 * @returns Normalized response from the selected adapter.
 */
export async function dispatch<TBody = any> (
    app: App,
    state: RequestState
): Promise<PResponse<TBody>> {
    if (isFetchApp(app)) {
        const response = await app.fetch(createFetchRequest(state))

        return normalizeFetchResponse<TBody>(response)
    }

    if (typeof app === 'function' && !isNodeHandler(app)) {
        const response = await app(createFetchRequest(state))

        return normalizeFetchResponse<TBody>(response)
    }

    if (typeof app === 'string' || app instanceof URL) {
        return requestWithSuperAgent<TBody>(String(app), state)
    }

    if (isFastifyApp(app)) {
        await app.ready()

        return requestWithServer<TBody>(app.server, state)
    }

    if (isKoaApp(app)) {
        return requestWithTemporaryServer<TBody>(createNodeServer(app.callback()), state)
    }

    if (isServer(app)) {
        return requestWithServer<TBody>(app, state)
    }

    return requestWithTemporaryServer<TBody>(createNodeServer(app as NodeHandler), state)
}
