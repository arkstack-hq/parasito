import type { App, ArkResponse, NodeHandler, RequestState } from './types'
import { createFetchRequest, createNodeServer } from './fetch'
import { isFastifyApp, isFetchApp, isNodeHandler, isServer } from './guards'
import { requestWithServer, requestWithSuperAgent, requestWithTemporaryServer } from './adapters'

import { normalizeFetchResponse } from './response'

export async function dispatch (app: App, state: RequestState): Promise<ArkResponse> {
    if (isFetchApp(app)) {
        const response = await app.fetch(createFetchRequest(state))

        return normalizeFetchResponse(response)
    }

    if (typeof app === 'function' && !isNodeHandler(app)) {
        const response = await app(createFetchRequest(state))

        return normalizeFetchResponse(response)
    }

    if (typeof app === 'string' || app instanceof URL) {
        return requestWithSuperAgent(String(app), state)
    }

    if (isFastifyApp(app)) {
        await app.ready()

        return requestWithServer(app.server, state)
    }

    if (isServer(app)) {
        return requestWithServer(app, state)
    }

    return requestWithTemporaryServer(createNodeServer(app as NodeHandler), state)
}
