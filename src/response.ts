import type { HeaderMap, PResponse } from './types'

import type { Response as SuperAgentResponse } from 'superagent'
import { parseBody } from './helpers'

/**
 * Converts a Fetch API response into Parasito's normalized response shape.
 *
 * @param response - Fetch API response to normalize.
 * @returns Normalized Parasito response.
 */
export async function normalizeFetchResponse<TBody = any> (
    response: Response
): Promise<PResponse<TBody>> {
    const text = await response.text()
    const header = headersToObject(response.headers)

    return {
        body: parseBody(text, header['content-type']) as TBody,
        header,
        headers: response.headers,
        ok: response.ok,
        raw: response,
        status: response.status,
        statusCode: response.status,
        text,
    }
}

/**
 * Converts a SuperAgent response into Parasito's normalized response shape.
 *
 * @param response - SuperAgent response to normalize.
 * @returns Normalized Parasito response.
 */
export function normalizeSuperAgentResponse<TBody = any> (
    response: SuperAgentResponse
): PResponse<TBody> {
    return {
        body: (response.body ?? parseBody(response.text, response.header['content-type'])) as TBody,
        header: response.header,
        headers: objectToHeaders(response.header),
        ok: response.ok,
        raw: response,
        status: response.status,
        statusCode: response.status,
        text: response.text,
    }
}

/**
 * Converts Web Headers into Parasito's lower-cased header map.
 *
 * @param headers - Headers object to convert.
 * @returns Plain object keyed by lower-cased header names.
 */
function headersToObject (headers: Headers): HeaderMap {
    const output: HeaderMap = {}

    for (const [field, value] of headers as any) {
        output[field.toLowerCase()] = value
    }

    return output
}

/**
 * Converts Parasito's plain header map into Web Headers.
 *
 * @param headers - Plain header map to convert.
 * @returns Web Headers object.
 */
function objectToHeaders (headers: HeaderMap): Headers {
    const output = new Headers()

    for (const [field, value] of Object.entries(headers)) {
        output.set(field, value)
    }

    return output
}
