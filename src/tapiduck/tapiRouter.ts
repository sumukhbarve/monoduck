import { TapiError } from './tapiEndpoint'
import type { TapiEndpoint, NoInfer } from './tapiEndpoint'

// Highly simplified, eXpress-compatible types:
interface XReq {
  body?: unknown
}
interface XRes {
  status: (code: number) => void
  json: (data: unknown) => void
}
type XHandlerFn = (req: XReq, res: XRes) => void
interface XRtApp { // Compatible with eXpress apps & routers
  post: (path: string, xHandler: XHandlerFn) => void
}

type TapiHandler<Inp, Out> = (inp: NoInfer<Inp>) => Promise<NoInfer<Out>>

const route = function<ZReq, ZRes> (
  xRtApp: XRtApp,
  endpoint: TapiEndpoint<ZReq, ZRes>,
  handler: TapiHandler<ZReq, ZRes>
): void {
  xRtApp.post(endpoint.path, function (req: XReq, res: XRes) {
    // Using async IIFE (with .catch()) to pacify ts-standard (linter), which
    // correctly points out that `void` and `Promise<void>` aren't the same.
    const iife = async function (): Promise<void> {
      const parsedReq = endpoint.zReq.safeParse(req.body)
      if (!parsedReq.success) {
        res.status(400)
        res.json({
          error: `${endpoint.path}: Bad request format`,
          data: parsedReq.error
        })
        return undefined
      }
      try {
        const resData: ZRes = await handler(parsedReq.data)
        res.json(resData)
        return undefined
      } catch (error) {
        if (error instanceof TapiError) {
          res.status(418)
          res.json({ error: error.message })
          return undefined
        }
        throw error
      }
    }
    iife().catch((error) => { throw error })
  })
}

type BoundRouteFn = <ZReq, ZRes>(
    endpoint: TapiEndpoint<ZReq, ZRes>,
    handler: TapiHandler<ZReq, ZRes>
  ) => void

const routeUsing = function (xRtApp: XRtApp): BoundRouteFn {
  return function<ZReq, ZRes> (
    endpoint: TapiEndpoint<ZReq, ZRes>,
    handler: TapiHandler<ZReq, ZRes>
  ): void {
    route(xRtApp, endpoint, handler)
  }
}

export type { XReq, XRes, XHandlerFn, XRtApp, BoundRouteFn }
export { route, routeUsing }
