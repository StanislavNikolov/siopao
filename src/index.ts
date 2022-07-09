import { createRouter } from "radix3"
import type { RadixRouter } from "radix3"
import type { Serve } from "bun"

export class Siopao {
  router: RadixRouter

  constructor() {
    this.router = createRouter()
  }

  fetch(request: Request) {
    const { pathname } = new URL(request.url)

    const matched = this.router.lookup(pathname)

    if (!matched) {
      return new Response('Not Found', {
        status: 404,
        statusText: `Cannot find any route matching ${request.url || '/'}.`
      })
    }

    const methodMatched = (matched.method === request.method) || matched.method === 'ALL'
    if (!methodMatched) {
      return new Response('Method Not Allowed', {
        status: 405,
        statusText: `Method ${request.method} is not allowed on this route.`
      })
    }

    // @ts-ignore: Added params
    request.params = matched.params || {}
    return matched.handler(request) as Response
  }

  use(path: string, handler: Handler, method?: HTTPMethod) {
    this.router.insert(path, {
      handler,
      method: method || 'ALL'
    })
  }

  get(path: string, handler: Handler) {
    this.use(path, handler, 'GET')
  }

  post(path: string, handler: Handler) {
    this.use(path, handler, 'POST')
  }

  put(path: string, handler: Handler) {
    this.use(path, handler, 'PUT')
  }

  patch(path: string, handler: Handler) {
    this.use(path, handler, 'PATCH')
  }

  delete(path: string, handler: Handler) {
    this.use(path, handler, 'DELETE')
  }

  serve(options: ServeOptions = {}) {
    return Bun.serve({
      ...options,
      fetch: (request) => this.fetch(request)
    })
  }
}

export default Siopao

type Params = {
  params: Record<string, string>
}

export type ServeOptions = Omit<Serve, 'fetch'>

export type Handler = (request: Request & Params) => Response

export type HTTPMethod = 'GET' | 'PATCH' | 'POST' | 'PUT' | 'DELETE'
