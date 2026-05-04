import type { Body } from './types'
import { jsonContentType } from './constants'

export function parseBody (text: string, contentType = ''): unknown {
    if (!text) {
        return undefined
    }

    if (!contentType.includes(jsonContentType)) {
        return text
    }

    try {
        return JSON.parse(text)
    } catch {
        return text
    }
}

export function isJsonBody (body: Body): body is Record<string, unknown> | unknown[] {
    return typeof body === 'object' && body !== null && !(body instanceof ArrayBuffer) && !(body instanceof Blob) && !(body instanceof FormData) && !(body instanceof URLSearchParams)
}

export function matches (actual: string | undefined, expected: string | RegExp): boolean {
    if (actual === undefined) {
        return false
    }

    return expected instanceof RegExp ? expected.test(actual) : actual === expected
}

export function formatExpected (value: unknown): string {
    return typeof value === 'string' ? `"${value}"` : JSON.stringify(value)
}
