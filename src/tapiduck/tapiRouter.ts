import {
  Router as XRouter,
  Request as XReq,
  Response as XRes,
  json as xJson
} from 'express'
import { TapiError } from './tapiEndpoint'
import type { TapiEndpoint } from './tapiEndpoint'

const addTapiRoute = function<ZReq, ZRes> (
  xRouter: XRouter,
  endpoint: TapiEndpoint<ZReq, ZRes>,
  handler: (reqData: ZReq) => Promise<ZRes>
): void {
  console.log(endpoint.path)
  xRouter.post(endpoint.path, function (req: XReq, res: XRes) {
    // Using async IIFE (with .catch()) to pacify ts-standard (linter), which
    // correctly points out that `void` and `Promise<void>` aren't the same.
    const iife = async function (): Promise<void> {
      const parsedReq = endpoint.zReq.safeParse(req.body)
      if (!parsedReq.success) {
        res.status(400).send({
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
          res.status(418).send({ error: error.message })
          return undefined
        }
        throw error
      }
    }
    iife().catch((error) => { throw error })
  })
}

interface TapiRouter {
  addRoute: <ZReq, ZRes>(
    endpoint: TapiEndpoint<ZReq, ZRes>,
    handler: (reqData: ZReq) => Promise<ZRes>
  ) => void
  middleware: () => XRouter
}
const tapiRouter = function (skipJson = false): TapiRouter {
  const xRouter = XRouter()
  if (!skipJson) {
    xRouter.use(xJson())
  }
  const addRoute = function<ZReq, ZRes> (
    endpoint: TapiEndpoint<ZReq, ZRes>,
    handler: (reqData: ZReq) => Promise<ZRes>
  ): void {
    addTapiRoute(xRouter, endpoint, handler)
  }
  const middleware = function (): XRouter {
    return xRouter
  }
  return { addRoute, middleware }
}

export { addTapiRoute, tapiRouter }
