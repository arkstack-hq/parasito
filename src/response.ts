import type { ArkResponse, HeaderMap } from './types'

import type { Response as SuperAgentResponse } from 'superagent'
import { parseBody } from './helpers'

export async function normalizeFetchResponse (response: Response): Promise<ArkResponse> {
    const text = await response.text()
    const header = headersToObject(response.headers)

    return {
        body: parseBody(text, header['content-type']),
        header,
        headers: response.headers,
        ok: response.ok,
        raw: response,
        status: response.status,
        statusCode: response.status,
        text,
    }
}

export function normalizeSuperAgentResponse (response: SuperAgentResponse): ArkResponse {
    return {
        body: response.body ?? parseBody(response.text, response.header['content-type']),
        header: response.header,
        headers: objectToHeaders(response.header),
        ok: response.ok,
        raw: response,
        status: response.status,
        statusCode: response.status,
        text: response.text,
    }
}

function headersToObject (headers: Headers): HeaderMap {
    const output: HeaderMap = {}

    for (const [field, value] of headers) {
        output[field.toLowerCase()] = value
    }

    return output
}

function objectToHeaders (headers: HeaderMap): Headers {
    const output = new Headers()

    for (const [field, value] of Object.entries(headers)) {
        output.set(field, value)
    }

    return output
}
