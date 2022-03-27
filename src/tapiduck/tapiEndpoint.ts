import { ZodSchema } from 'zod'

class TapiError extends Error {
  constructor (message: string) {
    super(message)
    Object.setPrototypeOf(this, TapiError.prototype)
  }
}

interface TapiEndpoint<ZReq, ZRes> {
  path: string
  zReq: ZodSchema<ZReq>
  zRes: ZodSchema<ZRes>
}

// Helper for building TapiEndpoints that implicitly infers ZReq & ZRes.
const endpoint = function<ZReq, ZRes> (
  endpointObj: TapiEndpoint<ZReq, ZRes>
): TapiEndpoint<ZReq, ZRes> {
  if (!endpointObj.path.startsWith('/')) {
    throw new Error(`Error: Path '${endpointObj.path}' should begin with '/'.`)
  }
  return endpointObj
}

// Util type, for avoiding lenient inference. Used for routing & fetching.
type NoInfer<T> = [T][T extends any ? 0 : never]

export type { TapiEndpoint, NoInfer }
export { endpoint, TapiError }
