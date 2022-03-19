import { TapiError } from './tapiEndpoint'
import type { TapiEndpoint } from './tapiEndpoint'

// Highly simplified, eXpress-compatible types:
interface XReq {
  body?: unknown
}
interface XRes {
  status: (code: number) => unknown
  json: (data: unknown) => unknown
}
type XHandler = (req: XReq, res: XRes) => void
interface XRtBase {
  post: (path: string, xHandler: XHandler) => unknown
}

const addTapiRoute = function<ZReq, ZRes> (
  xRouter: XRtBase,
  endpoint: TapiEndpoint<ZReq, ZRes>,
  handler: (reqData: ZReq) => Promise<ZRes>
): void {
  console.log(endpoint.path)
  xRouter.post(endpoint.path, function (req: XReq, res: XRes) {
    // Using async IIFE (with .catch()) to pacify ts-standard (linter), which
    // correctly points out that `void` and `Promise<void>` aren't the same.
    // (Keep simplified XHandler's o/p `void` to retain ts-standard's warning.)
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

interface TapiRouter<XRtFull extends XRtBase> {
  addRoute: <ZReq, ZRes>(
    endpoint: TapiEndpoint<ZReq, ZRes>,
    handler: (reqData: ZReq) => Promise<ZRes>
  ) => void
  middleware: () => XRtFull
}
const tapiRouter = function<XRtFull extends XRtBase> (
  xRouter: XRtFull
): TapiRouter<XRtFull> {
  const addRoute = function<ZReq, ZRes> (
    endpoint: TapiEndpoint<ZReq, ZRes>,
    handler: (reqData: ZReq) => Promise<ZRes>
  ): void {
    addTapiRoute(xRouter, endpoint, handler)
  }
  const middleware = function (): XRtFull {
    return xRouter
  }
  return { addRoute, middleware }
}

export type { XReq, XRes, XHandler, XRtBase, TapiRouter }
export { addTapiRoute, tapiRouter }
