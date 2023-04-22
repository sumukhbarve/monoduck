import type { ZodSchema } from 'zod'
import type { JsonValue } from './indeps-tapiduck'

type JV = JsonValue // Short, local alias

interface TapiEndpoint<ZReq extends JV, ZSuc extends JV, ZFal extends JV> {
  path: string
  zRequest: ZodSchema<ZReq>
  zSuccess: ZodSchema<ZSuc>
  zFail: ZodSchema<ZFal>
}

// Helper for building TapiEndpoints that implicitly infers ZFoos
const endpoint = function<ZReq extends JV, ZSuc extends JV, ZFal extends JV> (
  endpointObj: TapiEndpoint<ZReq, ZSuc, ZFal>
): TapiEndpoint<ZReq, ZSuc, ZFal> {
  if (!endpointObj.path.startsWith('/')) {
    throw new Error(`Error: Path '${endpointObj.path}' should begin with '/'.`)
  }
  return endpointObj
}

export type { TapiEndpoint }
export { endpoint }
