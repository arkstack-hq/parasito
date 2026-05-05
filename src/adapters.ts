import type { ParasitoResponse, RequestState } from './types'

import type { AddressInfo } from 'node:net'
import type { Server } from 'node:http'
import { createUrl } from './fetch'
import { normalizeSuperAgentResponse } from './response'
import superagent from 'superagent'

export async function requestWithServer (server: Server, state: RequestState): Promise<ParasitoResponse> {
    if (server.listening) {
        const address = server.address()

        if (typeof address === 'object' && address !== null) {
            return requestWithSuperAgent(`http://127.0.0.1:${address.port}`, state)
        }
    }

    return requestWithTemporaryServer(server, state)
}

export async function requestWithTemporaryServer (server: Server, state: RequestState): Promise<ParasitoResponse> {
    await new Promise<void>((resolve, reject) => {
        server.once('error', reject)
        server.listen(0, '127.0.0.1', () => {
            server.off('error', reject)
            resolve()
        })
    })

    try {
        const address = server.address() as AddressInfo

        return await requestWithSuperAgent(`http://127.0.0.1:${address.port}`, state)
    } finally {
        await new Promise<void>((resolve, reject) => {
            server.close((error) => {
                if (error) {
                    reject(error)

                    return
                }

                resolve()
            })
        })
    }
}

export async function requestWithSuperAgent (baseUrl: string, state: RequestState): Promise<ParasitoResponse> {
    const url = createUrl(baseUrl, state)
    let agentRequest = superagent(state.method, url)

    for (const [field, value] of state.headers) {
        agentRequest = agentRequest.set(field, value)
    }

    agentRequest = agentRequest.ok(() => true)

    if (state.body !== undefined && state.body !== null) {
        agentRequest = agentRequest.send(state.body)
    }

    const response = await agentRequest

    return normalizeSuperAgentResponse(response)
}
