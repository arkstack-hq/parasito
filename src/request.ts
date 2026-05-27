import type { App, Body, Expectation, HeaderValue, Method, PResponse, RequestState } from './types'
import { formatExpected, isJsonBody, matches } from './helpers'

import { dispatch } from './dispatch'
import { jsonContentType } from './constants'

/**
 * Creates a new request builder for an application, server, handler, or remote URL.
 *
 * @param app - Target application, server, handler, or remote URL to test.
 * @returns A fluent request builder bound to the provided target.
 */
export function request<TBody = any> (app: App): PRequest<TBody> {
    return new PRequest<TBody>(app)
}

export const parasito = request
export default request

/**
 * Fluent HTTP request builder that can be awaited like a promise.
 */
export class PRequest<TBody = any> implements PromiseLike<PResponse<TBody>> {
    private readonly expectations: Array<Expectation<TBody>> = []
    private readonly state: RequestState

    /**
     * Creates a request builder with an initial method and path.
     *
     * @param app - Target application, server, handler, or remote URL to test.
     * @param method - Initial HTTP method for the request.
     * @param path - Initial request path.
     */
    public constructor(private readonly app: App, method: Method = 'GET', path = '/') {
        this.state = {
            headers: new Headers(),
            method,
            path,
            query: new URLSearchParams(),
        }
    }

    /**
     * Sets the request method to GET and updates the target path.
     *
     * @param path - Request path to call.
     * @returns The current request builder.
     */
    public get (path: string): this {
        return this.method('GET', path)
    }

    /**
     * Sets the request method to POST and updates the target path.
     *
     * @param path - Request path to call.
     * @returns The current request builder.
     */
    public post (path: string): this {
        return this.method('POST', path)
    }

    /**
     * Sets the request method to PUT and updates the target path.
     *
     * @param path - Request path to call.
     * @returns The current request builder.
     */
    public put (path: string): this {
        return this.method('PUT', path)
    }

    /**
     * Sets the request method to PATCH and updates the target path.
     *
     * @param path - Request path to call.
     * @returns The current request builder.
     */
    public patch (path: string): this {
        return this.method('PATCH', path)
    }

    /**
     * Sets the request method to DELETE and updates the target path.
     *
     * @param path - Request path to call.
     * @returns The current request builder.
     */
    public delete (path: string): this {
        return this.method('DELETE', path)
    }

    /**
     * Sets the request method to HEAD and updates the target path.
     *
     * @param path - Request path to call.
     * @returns The current request builder.
     */
    public head (path: string): this {
        return this.method('HEAD', path)
    }

    /**
     * Sets the request method to OPTIONS and updates the target path.
     *
     * @param path - Request path to call.
     * @returns The current request builder.
     */
    public options (path: string): this {
        return this.method('OPTIONS', path)
    }

    /**
     * Sets the HTTP method and path for the request.
     *
     * @param method - HTTP method to use.
     * @param path - Request path to call.
     * @returns The current request builder.
     */
    public method (method: Method, path: string): this {
        this.state.method = method
        this.state.path = path

        return this
    }

    /**
     * Sets one header or merges a map of headers into the request.
     *
     * @param field - Header name or map of header names to values.
     * @param value - Header value when setting a single header.
     * @returns The current request builder.
     */
    public set (field: string | Record<string, HeaderValue>, value?: HeaderValue): this {
        if (typeof field === 'string') {
            if (value === undefined) {
                throw new TypeError('Header value is required when setting a single field.')
            }

            this.state.headers.set(field, String(value))

            return this
        }

        for (const [name, headerValue] of Object.entries(field)) {
            this.state.headers.set(name, String(headerValue))
        }

        return this
    }

    /**
     * Sets a bearer authorization header.
     *
     * @param token - Bearer token to send.
     * @param options - Optional bearer auth settings.
     * @returns The current request builder.
     */
    public auth (token: string, options?: { type?: 'bearer' }): this;
    /**
     * Sets a basic authorization header.
     *
     * @param username - Basic auth username.
     * @param password - Basic auth password.
     * @param options - Optional basic auth settings.
     * @returns The current request builder.
     */
    public auth (username: string, password: string, options?: { type?: 'basic' }): this;
    /**
     * Sets the authorization header using bearer or basic credentials.
     *
     * @param usernameOrToken - Bearer token or basic auth username.
     * @param passwordOrOptions - Basic auth password or bearer auth options.
     * @param _options - Optional basic auth settings.
     * @returns The current request builder.
     */
    public auth (
        usernameOrToken: string,
        passwordOrOptions?: string | { type?: 'bearer' },
        _options?: { type?: 'basic' }
    ): this {
        if (typeof passwordOrOptions === 'string') {
            const value = Buffer.from(`${usernameOrToken}:${passwordOrOptions}`).toString('base64')
            this.state.headers.set('authorization', `Basic ${value}`)

            return this
        }

        this.state.headers.set('authorization', `Bearer ${usernameOrToken}`)

        return this
    }

    /**
     * Adds query parameters from a query string, URLSearchParams, or object.
     *
     * @param value - Query data to merge into the request URL.
     * @returns The current request builder.
     */
    public query (
        value: string | URLSearchParams | Record<string, HeaderValue | Array<HeaderValue>>
    ): this {
        const query = typeof value === 'string' ? new URLSearchParams(value) : new URLSearchParams()

        if (value instanceof URLSearchParams) {
            for (const [name, item] of value) {
                this.state.query.append(name, item)
            }
        } else if (typeof value === 'object') {
            for (const [name, item] of Object.entries(value)) {
                if (Array.isArray(item)) {
                    for (const nestedItem of item) {
                        this.state.query.append(name, String(nestedItem))
                    }
                } else {
                    this.state.query.set(name, String(item))
                }
            }
        } else {
            for (const [name, item] of query) {
                this.state.query.append(name, item)
            }
        }

        return this
    }

    /**
     * Sets the request body and applies a JSON content type for plain objects and arrays.
     *
     * @param body - Request body payload to send.
     * @returns The current request builder.
     */
    public send (body: Body): this {
        this.state.body = body

        if (isJsonBody(body) && !this.state.headers.has('content-type')) {
            this.state.headers.set('content-type', jsonContentType)
        }

        return this
    }

    /**
     * Expects the response status code to match.
     *
     * @param status - Expected response status code.
     * @returns The current request builder.
     */
    public expect (status: number): this;
    /**
     * Expects the response body or text to match.
     *
     * @param body - Expected response body, text, or text pattern.
     * @returns The current request builder.
     */
    public expect (body: string | RegExp | Record<string, unknown> | unknown[]): this;
    /**
     * Expects a response header to match a string or regular expression.
     *
     * @param field - Header field name to check.
     * @param value - Expected header value or pattern.
     * @returns The current request builder.
     */
    public expect (field: string, value: string | RegExp): this;
    /**
     * Registers a custom response assertion.
     *
     * @param assertion - Function that validates the normalized response.
     * @returns The current request builder.
     */
    public expect (assertion: Expectation<TBody>): this;
    /**
     * Registers a response expectation.
     *
     * @param first - Status, body, text, header field, or custom assertion expectation.
     * @param second - Header value expectation when checking a header field.
     * @returns The current request builder.
     */
    public expect (
        first: number | string | RegExp | Record<string, unknown> | unknown[] | Expectation<TBody>,
        second?: string | RegExp
    ): this {
        if (typeof first === 'function') {
            this.expectations.push(first)

            return this
        }

        if (typeof first === 'number') {
            this.expectations.push((response) => {
                if (response.status !== first) {
                    throw new Error(`expected ${first} status, got ${response.status}`)
                }
            })

            return this
        }

        if (typeof first === 'string' && second !== undefined) {
            this.expectations.push((response) => {
                const actual = response.header[first.toLowerCase()]

                if (!matches(actual, second)) {
                    throw new Error(`expected "${first}" header to match ${formatExpected(second)}, got ${formatExpected(actual)}`)
                }
            })

            return this
        }

        this.expectations.push((response) => {
            if (first instanceof RegExp) {
                if (!first.test(response.text)) {
                    throw new Error(`expected response text to match ${first}`)
                }

                return
            }

            if (typeof first === 'string') {
                if (response.text !== first) {
                    throw new Error(`expected response text ${formatExpected(first)}, got ${formatExpected(response.text)}`)
                }

                return
            }

            const actual = response.body
            if (JSON.stringify(actual) !== JSON.stringify(first)) {
                throw new Error(`expected response body ${formatExpected(first)}, got ${formatExpected(actual)}`)
            }
        })

        return this
    }

    /**
     * Expects the response body or text to contain expected response body, text, or text pattern.
     *
     * @param expect - Expected response body, text, or text pattern.
     * @returns The current request builder.
     */
    public contains (expected: string | RegExp): this {
        this.expectations.push((response) => {
            if (expected instanceof RegExp) {
                if (!expected.test(response.text)) {
                    throw new Error(
                        `expected response text to contain ${String(expected).replace(/\//g, '')}`
                    )
                }

                return
            }

            if (!response.text.includes(expected)) {
                throw new Error(`expected response text to contain ${formatExpected(expected)}, got ${formatExpected(response.text)}`)
            }

            return
        })

        return this
    }

    /**
     * Expects the response body or text to end with expected response body, text, or text pattern.
     *
     * @param expect - Expected response body, text, or text pattern.
     * @returns The current request builder.
     */
    public endsWith (expected: string | RegExp): this {
        this.expectations.push((response) => {
            if (expected instanceof RegExp) {
                const match = response.text.match(expected)
                if (!match || response.text.slice(match.index! + match[0].length).trim() !== '') {
                    throw new Error(
                        `expected response text to end with ${String(expected).replace(/\//g, '')}`
                    )
                }

                return
            }

            if (!response.text.trimEnd().endsWith(expected)) {
                throw new Error(`expected response text to end with ${formatExpected(expected)}, got ${formatExpected(response.text)}`)
            }

            return
        })

        return this
    }

    /**
     * Expects the response body or text to start with expected response body, text, or text pattern.
     *
     * @param expect - Expected response body, text, or text pattern.
     * @returns The current request builder.
     */
    public startsWith (expected: string | RegExp): this {
        this.expectations.push((response) => {
            if (expected instanceof RegExp) {
                if (!expected.test(response.text) || !response.text.trimStart().match(new RegExp(`^${expected.source}`, expected.flags))) {
                    throw new Error(
                        `expected response text to start with ${String(expected).replace(/\//g, '')}`
                    )
                }

                return
            }

            if (!response.text.trimStart().startsWith(expected)) {
                throw new Error(`expected response text to start with ${formatExpected(expected)}, got ${formatExpected(response.text)}`)
            }

            return
        })

        return this
    }

    /**
     * Executes the request and optionally reports completion through a callback.
     *
     * @param callback - Optional Node-style callback for completion.
     * @returns The response when no callback is provided.
     */
    public async end (
        callback?: (error: Error | null, response?: PResponse<TBody>) => void
    ): Promise<PResponse<TBody> | void> {
        try {
            const response = await this.run()

            if (callback) {
                callback(null, response)

                return
            }

            return response
        } catch (error) {
            if (callback) {
                callback(error instanceof Error ? error : new Error(String(error)))

                return
            }

            throw error
        }
    }

    /**
     * Executes the request when the builder is awaited or used as a promise.
     *
     * @param onfulfilled - Handler called with the normalized response.
     * @param onrejected - Handler called when dispatch or expectations fail.
     * @returns A promise-like value for the request result.
     */
    public then<TResult1 = PResponse<TBody>, TResult2 = never> (
        onfulfilled?: ((value: PResponse<TBody>) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ): PromiseLike<TResult1 | TResult2> {
        return this.run().then(onfulfilled, onrejected)
    }

    /**
     * Dispatches the request and evaluates registered expectations.
     *
     * @returns The normalized response after all expectations pass.
     */
    private async run (): Promise<PResponse<TBody>> {
        const response = await dispatch<TBody>(this.app, this.state)

        for (const expectation of this.expectations) {
            await expectation(response)
        }

        return response
    }
}
