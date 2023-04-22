import type { JsonValue } from './indeps-tapiduck'
import type { ZodError } from 'zod'
import { _ } from './indeps-tapiduck'

type JV = JsonValue // Short, local alias

const zodErrorToMessage = function (zodError: ZodError): string {
  const lines = zodError.issues.map(function (issue): string {
    return `Error at ${issue.path.join('.')}: ${issue.message}`
  })
  return lines.join('\n')
}

const JSEND_STATUS_LIST = ['success', 'fail', 'error', 'zodfail'] as const
type JSendStatus = typeof JSEND_STATUS_LIST[number]

interface JSendy<ZSuc extends JV, ZFal extends JV> {
  // 200
  success: (data: ZSuc) => {status: 'success', data: ZSuc}
  // 422
  fail: (data: ZFal) => {status: 'fail', data: ZFal }
  // 500
  error: (message: string, code?: number)
  => {status: 'error', message: string, code: number}
  // 400
  zodfail: (where: 'server' | 'client', message: ZodError | string) => ({
    status: 'zodfail'
    message: string
    where: 'server' | 'client'
  })
}
type JSendOutput<ZSuc extends JV, ZFal extends JV>
  = ReturnType<JSendy<ZSuc, ZFal>[JSendStatus]>

const buildJSendy = function<
  ZSuc extends JV, ZFal extends JV
> (): JSendy<ZSuc, ZFal> {
  const jSendy: JSendy<ZSuc, ZFal> = {
    success: (data: ZSuc) => ({ status: 'success', data }),
    fail: (data: ZFal) => ({ status: 'fail', data }),
    error: (message: string, code: number = 500) => ({
      status: 'error', message, code
    }),
    zodfail: (where: 'server' | 'client', err: ZodError | string) => ({
      status: 'zodfail',
      where,
      message: _.stringIs(err) ? err : zodErrorToMessage(err)
    })
  }
  return jSendy
}

const jSendEnvelopeIs = function (output: unknown): output is JSendOutput<JV, JV> {
  if (!(
    _.plainObjectIs(output) &&
    _.stringIs(output.status) &&
    JSEND_STATUS_LIST.includes(output.status as JSendStatus)
  )) {
    return false
  }
  const status = output.status as JSendStatus
  if (status === 'success' || status === 'fail') {
    return 'data' in output
  }
  if (status === 'error') {
    return _.stringIs(output.message) && _.numberIs(output.code)
  }
  if (status === 'zodfail') {
    return (
      _.stringIs(output.message) &&
        (output.where === 'server' || output.where === 'client')
    )
  }
  _.never(status)
  return false
}

export type { JSendStatus, JSendOutput, JSendy }
export { buildJSendy, jSendEnvelopeIs }
