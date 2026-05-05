import type { IncomingMessage, Server, ServerResponse } from 'node:http'

import type { Response as SuperAgentResponse } from 'superagent'

export type HeaderValue = string | number | boolean
export type HeaderMap = Record<string, string>
export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'
export type FetchLike = (request: Request) => Response | Promise<Response>
export type NodeHandler = (request: IncomingMessage, response: ServerResponse) => unknown
export type Body = BodyInit | Record<string, unknown> | unknown[] | null | undefined

export interface FastifyLike {
    ready: () => PromiseLike<unknown>
    server: Server
}

export interface KoaLike {
    callback: () => NodeHandler
}

export type App =
    | string
    | URL
    | Server
    | FastifyLike
    | KoaLike
    | NodeHandler
    | FetchLike
    | {
        fetch: FetchLike
    }

export interface PResponse<TBody = any> {
    status: number
    statusCode: number
    ok: boolean
    headers: Headers
    header: HeaderMap
    text: string
    body: TBody
    raw: Response | SuperAgentResponse
}

export type Expectation<TBody = any> = (response: PResponse<TBody>) => void | Promise<void>

export interface RequestState {
    body?: Body
    headers: Headers
    method: Method
    path: string
    query: URLSearchParams
}
