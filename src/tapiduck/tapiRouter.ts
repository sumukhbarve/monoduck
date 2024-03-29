import { NoInfer, JsonValue, ZodyToJsonSchemaFn, injectZodToJsonSchema, _ } from './indeps-tapiduck'
import type { TapiEndpoint } from './tapiEndpoint'
import type { JSendOutput, JSendy } from './jsend'
import { buildJSendy } from './jsend'
import type { OpenApi3Opt } from './tapiToOpenApi'
import { swaggerUiHtml, toOpenApi3 } from './tapiToOpenApi'

type JV = JsonValue // Short, local alias

// Simplified, eXpress-compatible Types:
// ------------------------------------
interface XReq {
  body?: unknown
}
interface XRes {
  status: (code: number) => void
  json: (data: unknown) => void
  send: (data: unknown) => void
}
// type XNextFn =  (err: any) => void;
type XHandlerFn = (req: XReq, res: XRes) => void
interface XRtApp { // Compatible with eXpress apps & routers
  get: (path: string, xHandler: XHandlerFn) => void
  post: (path: string, xHandler: XHandlerFn) => void
}

// Endpoint Registry:
// -----------------
const endpointRegistry: Map<XRtApp, Set<TapiEndpoint<JV, JV, JV>>> = new Map()
const registerEndpoint = function<ZReq extends JV, ZSuc extends JV, ZFal extends JV> (
  xRtApp: XRtApp,
  endpoint: TapiEndpoint<ZReq, ZSuc, ZFal>
): void {
  const endpointSet = endpointRegistry.get(xRtApp) ?? new Set()
  endpointSet.add(endpoint)
  endpointRegistry.set(xRtApp, endpointSet)
}

// Route Handling:
// --------------
type TapiHandler<ZReq extends JV, ZSuc extends JV, ZErr extends JV> =
  (
    inp: NoInfer<ZReq>,
    jsend: JSendy<NoInfer<ZSuc>, NoInfer<ZErr>>,
  ) => Promise<JSendOutput<NoInfer<ZSuc>, NoInfer<ZErr>>>

const route = function<ZReq extends JV, ZSuc extends JV, ZFal extends JV> (
  xRtApp: XRtApp,
  endpoint: TapiEndpoint<ZReq, ZSuc, ZFal>,
  handler: TapiHandler<ZReq, ZSuc, ZFal>
): void {
  const jSendy = buildJSendy<ZSuc, ZFal>()
  registerEndpoint(xRtApp, endpoint)
  xRtApp.post(endpoint.path, function (req: XReq, res: XRes) {
    // interna helper:
    const sendJson = function (status: number, data: JsonValue): void {
      res.status(status)
      res.json(data)
    }
    // main iife:
    const iife = async function (): Promise<void> {
      const parsedReq = endpoint.zRequest.safeParse(req.body)
      if (!parsedReq.success) {
        return sendJson(400, jSendy.zodfail('server', parsedReq.error))
      }
      let handlerOutput: JSendOutput<ZSuc, ZFal>
      try {
        handlerOutput = await handler(parsedReq.data, jSendy)
      } catch (error) {
        console.error(error)
        return sendJson(500, jSendy.error('An unexpected error occured'))
      }
      const status = _.bang(handlerOutput).status
      const httpCode = status === 'success' ? 200 : status === 'fail' ? 422 : 500
      return sendJson(httpCode, handlerOutput)
    }
    // The iife pacifies errors, and don't expect main iife() to throw at all.
    iife().catch((error) => { throw error }) // So if it throws, we re-throw.
  })
}

type BoundRouteFn = <ZReq extends JV, ZSuc extends JV, ZErr extends JV>(
    endpoint: TapiEndpoint<ZReq, ZSuc, ZErr>,
    handler: TapiHandler<ZReq, ZSuc, ZErr>
  ) => void

const routeUsing = function (xRtApp: XRtApp): BoundRouteFn {
  return function<ZReq extends JV, ZSuc extends JV, ZErr extends JV> (
    endpoint: TapiEndpoint<ZReq, ZSuc, ZErr>,
    handler: TapiHandler<ZReq, ZSuc, ZErr>
  ): void {
    route(xRtApp, endpoint, handler)
  }
}

// Swagger/OpenAPI helper:
// ----------------------
const swaggerfy = function (
  xRtApp: XRtApp,
  zodToJsonSchema: ZodyToJsonSchemaFn,
  opt?: Partial<Omit<OpenApi3Opt, 'endpoints'>>
): () => ReturnType<typeof toOpenApi3> {
  injectZodToJsonSchema(zodToJsonSchema)
  const getFreshDefn = function (): ReturnType<typeof toOpenApi3> {
    return toOpenApi3({
      endpoints: Array.from(endpointRegistry.get(xRtApp) ?? new Set()),
      serverUrls: opt?.serverUrls ?? ['/'],
      title: opt?.title ?? 'Tapiduck API',
      version: opt?.version ?? '0.1.0'
    })
  }
  xRtApp.get('/openapi.json', function (_req, res) {
    res.json(getFreshDefn())
  })
  xRtApp.get('/swagger-ui', function (_req, res) {
    res.send(swaggerUiHtml(getFreshDefn()))
  })
  return getFreshDefn
}

// Export:
// ------
export type { XReq, XRes, XHandlerFn, XRtApp, BoundRouteFn }
export { route, routeUsing, swaggerfy }
