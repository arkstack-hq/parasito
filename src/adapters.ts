import type { PResponse, RequestState } from './types'

import type { AddressInfo } from 'node:net'
import type { Server } from 'node:http'
import { createUrl } from './fetch'
import { normalizeSuperAgentResponse } from './response'
import superagent from 'superagent'

/**
 * Sends a request to an already-listening server or starts it temporarily.
 *
 * @param server - HTTP server to send the request through.
 * @param state - Internal request state to dispatch.
 * @returns Normalized response from the server.
 */
export async function requestWithServer<TBody = any> (
    server: Server,
    state: RequestState
): Promise<PResponse<TBody>> {
    if (server.listening) {
        const address = server.address()

        if (typeof address === 'object' && address !== null) {
            return requestWithSuperAgent<TBody>(`http://127.0.0.1:${address.port}`, state)
        }
    }

    return requestWithTemporaryServer<TBody>(server, state)
}

/**
 * Starts a server on an ephemeral port, sends the request, and closes it.
 *
 * @param server - HTTP server to start temporarily.
 * @param state - Internal request state to dispatch.
 * @returns Normalized response from the temporary server.
 */
export async function requestWithTemporaryServer<TBody = any> (
    server: Server,
    state: RequestState
): Promise<PResponse<TBody>> {
    await new Promise<void>((resolve, reject) => {
        server.once('error', reject)
        server.listen(0, '127.0.0.1', () => {
            server.off('error', reject)
            resolve()
        })
    })

    try {
        const address = server.address() as AddressInfo

        return await requestWithSuperAgent<TBody>(`http://127.0.0.1:${address.port}`, state)
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

/**
 * Sends a request to a remote or local base URL through SuperAgent.
 *
 * @param baseUrl - Base URL for the request.
 * @param state - Internal request state to dispatch.
 * @returns Normalized SuperAgent response.
 */
export async function requestWithSuperAgent<TBody = any> (
    baseUrl: string,
    state: RequestState
): Promise<PResponse<TBody>> {
    const url = createUrl(baseUrl, state)
    let agentRequest = superagent(state.method, url)

    for (const [field, value] of state.headers as any) {
        agentRequest = agentRequest.set(field, value)
    }

    agentRequest = agentRequest.ok(() => true)

    if (state.body !== undefined && state.body !== null) {
        agentRequest = agentRequest.send(state.body)
    }

    const response = await agentRequest

    return normalizeSuperAgentResponse<TBody>(response)
}
