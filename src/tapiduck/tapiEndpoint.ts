import { z } from 'zod'

class TapiError extends Error {
  constructor (message: string) {
    super(message)
    Object.setPrototypeOf(this, TapiError.prototype)
  }
}

interface TapiEndpoint<ZReq, ZRes> {
  path: string
  zReq: z.ZodSchema<ZReq>
  zRes: z.ZodSchema<ZRes>
}

// Helper for building TapiEndpoints that implicitly infers ZReq & ZRes.
const tapiEndpoint = function<ZReq, ZRes> (
  endpoint: TapiEndpoint<ZReq, ZRes>
): TapiEndpoint<ZReq, ZRes> {
  return endpoint
}

export type { TapiEndpoint }
export { tapiEndpoint, TapiError }