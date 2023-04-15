import type { ZodSchema } from 'zod'
import type { JsonValue } from './indeps-tapiduck'

class TapiError extends Error {
  constructor (data: JsonValue) {
    // Becomes the .message prop of the (catch-able) error obj
    const message = JSON.stringify({ error: data })
    super(message)
    Object.setPrototypeOf(this, TapiError.prototype)
  }

  // Getter for data (passed while init) to a (caught) error obj
  get data (): JsonValue {
    const { error: data } = JSON.parse(this.message)
    return data
  }
}

interface TapiEndpoint<ZReq extends JsonValue, ZRes extends JsonValue> {
  path: string
  zReq: ZodSchema<ZReq>
  zRes: ZodSchema<ZRes>
}

// Helper for building TapiEndpoints that implicitly infers ZReq & ZRes.
const endpoint = function<ZReq extends JsonValue, ZRes extends JsonValue> (
  endpointObj: TapiEndpoint<ZReq, ZRes>
): TapiEndpoint<ZReq, ZRes> {
  if (!endpointObj.path.startsWith('/')) {
    throw new Error(`Error: Path '${endpointObj.path}' should begin with '/'.`)
  }
  return endpointObj
}

export type { TapiEndpoint }
export { endpoint, TapiError }
