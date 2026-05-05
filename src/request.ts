import type { App, ParasitoResponse, Body, Expectation, HeaderValue, Method, RequestState } from './types'
import { formatExpected, isJsonBody, matches } from './helpers'

import { dispatch } from './dispatch'
import { jsonContentType } from './constants'

export function request (app: App): ParasitoRequest {
    return new ParasitoRequest(app)
}

export const parasito = request
export default request

export class ParasitoRequest implements PromiseLike<ParasitoResponse> {
    private readonly expectations: Expectation[] = []
    private readonly state: RequestState

    public constructor(private readonly app: App, method: Method = 'GET', path = '/') {
        this.state = {
            headers: new Headers(),
            method,
            path,
            query: new URLSearchParams(),
        }
    }

    public get (path: string): this {
        return this.method('GET', path)
    }

    public post (path: string): this {
        return this.method('POST', path)
    }

    public put (path: string): this {
        return this.method('PUT', path)
    }

    public patch (path: string): this {
        return this.method('PATCH', path)
    }

    public delete (path: string): this {
        return this.method('DELETE', path)
    }

    public head (path: string): this {
        return this.method('HEAD', path)
    }

    public options (path: string): this {
        return this.method('OPTIONS', path)
    }

    public method (method: Method, path: string): this {
        this.state.method = method
        this.state.path = path

        return this
    }

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

    public auth (token: string, options?: { type?: 'bearer' }): this;
    public auth (username: string, password: string, options?: { type?: 'basic' }): this;
    public auth (usernameOrToken: string, passwordOrOptions?: string | { type?: 'bearer' }, _options?: { type?: 'basic' }): this {
        if (typeof passwordOrOptions === 'string') {
            const value = Buffer.from(`${usernameOrToken}:${passwordOrOptions}`).toString('base64')
            this.state.headers.set('authorization', `Basic ${value}`)

            return this
        }

        this.state.headers.set('authorization', `Bearer ${usernameOrToken}`)

        return this
    }

    public query (value: string | URLSearchParams | Record<string, HeaderValue | Array<HeaderValue>>): this {
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

    public send (body: Body): this {
        this.state.body = body

        if (isJsonBody(body) && !this.state.headers.has('content-type')) {
            this.state.headers.set('content-type', jsonContentType)
        }

        return this
    }

    public expect (status: number): this;
    public expect (body: string | RegExp | Record<string, unknown> | unknown[]): this;
    public expect (field: string, value: string | RegExp): this;
    public expect (assertion: Expectation): this;
    public expect (first: number | string | RegExp | Record<string, unknown> | unknown[] | Expectation, second?: string | RegExp): this {
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

    public async end (callback?: (error: Error | null, response?: ParasitoResponse) => void): Promise<ParasitoResponse | void> {
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

    public then<TResult1 = ParasitoResponse, TResult2 = never> (
        onfulfilled?: ((value: ParasitoResponse) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ): PromiseLike<TResult1 | TResult2> {
        return this.run().then(onfulfilled, onrejected)
    }

    private async run (): Promise<ParasitoResponse> {
        const response = await dispatch(this.app, this.state)

        for (const expectation of this.expectations) {
            await expectation(response)
        }

        return response
    }
}
