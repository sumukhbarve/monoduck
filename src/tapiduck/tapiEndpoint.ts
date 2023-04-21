import { ZodSchema, ZodError, z } from 'zod'
import type { JsonValue } from './indeps-tapiduck'

type JV = JsonValue // Short, local alias

class TapiError extends Error {
  originalErr: JsonValue = null
  constructor (err: JsonValue) {
    super(JSON.stringify(err)) // CaughtError.message will be stringified `err`
    Object.setPrototypeOf(this, TapiError.prototype)
    this.originalErr = err
  }
}

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

interface FlattenedZodError {
  formErrors: string[]
  fieldErrors: Record<string, string[]>
}
const flattenZodError = function (zodError: ZodError): FlattenedZodError {
  return zodError.flatten()
}

type JSendOutput<ZSuc extends JV, ZFal extends JV> =
  | {status: 'success', data: ZSuc} // 200
  | {status: 'fail', data: ZFal } // 400
  | {status: 'error', message: string, code: number} // ${code}
  | {status: 'zodfail', where: 'server' | 'client', message: string } // 400

interface JSendy<ZSuc extends JV, ZFal extends JV> {
  success: (data: ZSuc) => {status: 'success', data: ZSuc}

  fail: (data: ZFal) => {status: 'fail', data: ZFal }

  error: (message: string, code?: number)
  => {status: 'error', message: string, code: number}

  zodfail: (where: 'server' | 'client', message: string) => ({
    status: 'zodfail'
    where: 'server' | 'client'
    message: string
  })
}

const buildJSendy = function<
  ZSuc extends JV, ZFal extends JV
> (): JSendy<ZSuc, ZFal> {
  const jSendy: JSendy<ZSuc, ZFal> = {
    success: (data: ZSuc) => ({ status: 'success', data }),
    fail: (data: ZFal) => ({ status: 'fail', data }),
    error: (message: string, code: number = 500) => ({
      status: 'error', message, code
    }),
    zodfail: (where: 'server' | 'client', message: string) => ({
      status: 'zodfail', where, message
    })
  }
  return jSendy
}

/* eslint-disable @typescript-eslint/explicit-function-return-type */

const buildZJSendOutput = function<ZReq extends JV, ZSuc extends JV, ZFal extends JV> (
  endpoint: TapiEndpoint<ZReq, ZSuc, ZFal>
) {
  const zSuccessOutput = z.object({
    status: z.literal('success'),
    data: endpoint.zSuccess
  })
  const zFailOutput = z.object({
    status: z.literal('fail'),
    data: endpoint.zFail
  })
  const zErrorOutput = z.object({
    status: z.literal('error'),
    message: z.string(),
    code: z.number()
  })
  const zZodFailOutput = z.object({
    status: z.literal('zodfail'),
    where: z.literal('server').or(z.literal('client')),
    message: z.string()
  })
  const zOutput = zSuccessOutput.or(zFailOutput).or(zErrorOutput).or(zZodFailOutput)
  return zOutput
}

export type { TapiEndpoint, FlattenedZodError, JSendOutput, JSendy }
export { endpoint, TapiError, flattenZodError, buildJSendy, buildZJSendOutput }
