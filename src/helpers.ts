import type { Body } from './types'
import { jsonContentType } from './constants'

/**
 * Parses response text as JSON when the content type indicates JSON.
 *
 * @param text - Response text to parse.
 * @param contentType - Response content type header.
 * @returns Parsed JSON, plain text, or undefined for empty text.
 */
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

/**
 * Checks whether a body should be serialized as JSON by default.
 *
 * @param body - Request body to inspect.
 * @returns True when the body is a plain object or array.
 */
export function isJsonBody (body: Body): body is Record<string, unknown> | unknown[] {
    return typeof body === 'object' && body !== null && !(body instanceof ArrayBuffer) && !(body instanceof Blob) && !(body instanceof FormData) && !(body instanceof URLSearchParams)
}

/**
 * Compares an actual string value with a string or regular expression expectation.
 *
 * @param actual - Actual value to test.
 * @param expected - Expected string or regular expression.
 * @returns True when the actual value matches the expectation.
 */
export function matches (actual: string | undefined, expected: string | RegExp): boolean {
    if (actual === undefined) {
        return false
    }

    return expected instanceof RegExp ? expected.test(actual) : actual === expected
}

/**
 * Formats a value for expectation failure messages.
 *
 * @param value - Value to format.
 * @returns Human-readable representation of the value.
 */
export function formatExpected (value: unknown): string {
    return typeof value === 'string' ? `"${value}"` : JSON.stringify(value)
}
