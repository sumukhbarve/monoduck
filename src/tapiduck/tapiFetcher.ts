import type { NoInfer, JsonValue } from './indeps-tapiduck'
import type { TapiEndpoint } from './tapiEndpoint'
import { _, getInjectedFetch } from './indeps-tapiduck'
import type { JSendOutput, JSendStatus } from './jsend'
import { buildJSendy, jSendEnvelopeIs } from './jsend'

export { injectFetch as injectIsomorphicFetch } from './indeps-tapiduck'

type JV = JsonValue // Short, local alias

const joinUrl = function (baseUrl: string, path: string): string {
  if (baseUrl.endsWith('/')) {
    throw new Error(`Error: Base URL '${baseUrl}' shouldn't end with '/'.`)
  }
  return `${baseUrl}${path}`
}

export const fetch = async function<ZReq extends JV, ZSuc extends JV, ZFal extends JV> (
  endpoint: TapiEndpoint<ZReq, ZSuc, ZFal>,
  reqData: NoInfer<ZReq>,
  baseUrl: string = ''
): Promise<JSendOutput<ZSuc, ZFal>> {
  const windowyFetch = getInjectedFetch()
  const url = joinUrl(baseUrl, endpoint.path)
  const res = await windowyFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reqData)
  })
  const text = await res.text()
  const sdata = JSON.parse(text)
  const jsend = buildJSendy<ZSuc, ZFal>()
  if (!jSendEnvelopeIs(sdata)) {
    return jsend.zodfail('client', 'Error: Misshaped response envelope')
  }
  if (sdata.status === 'error' || sdata.status === 'zodfail') {
    return sdata // No zod-parsing reqd here, jSendEnvelopeIs() is enough.
  }
  if (sdata.status === 'success') {
    const parsed = endpoint.zSuccess.safeParse(sdata.data)
    return parsed.success
      ? jsend.success(parsed.data)
      : jsend.zodfail('client', parsed.error)
  }
  if (sdata.status === 'fail') {
    const parsed = endpoint.zFail.safeParse(sdata.data)
    return parsed.success
      ? jsend.fail(parsed.data)
      : jsend.zodfail('client', parsed.error)
  }
  return _.never(sdata.status)
}

export type BoundFetchFn = <ZReq extends JV, ZSuc extends JV, ZFal extends JV>(
    endpoint: TapiEndpoint<ZReq, ZSuc, ZFal>,
    reqData: NoInfer<ZReq>
  ) => Promise<JSendOutput<ZSuc, ZFal>>

export const fetchUsing = function (baseUrl: string): BoundFetchFn {
  const boundHit = async function<ZReq extends JV, ZSuc extends JV, ZFal extends JV> (
    endpoint: TapiEndpoint<ZReq, ZSuc, ZFal>,
    reqData: NoInfer<ZReq>
  ): Promise<JSendOutput<ZSuc, ZFal>> {
    return await fetch(endpoint, reqData, baseUrl)
  }
  return boundHit
}

export const expectStatus = async function<
  S extends JSendStatus, ZSuc extends JV, ZFal extends JV
> (
  status: S,
  responsePromise: Promise<JSendOutput<ZSuc, ZFal>>
): Promise<JSendOutput<ZSuc, ZFal> & {status: S}> {
  const resp = await responsePromise
  if (resp.status !== status) {
    throw new Error(_.singleSpaced(`
      Tapiduck:: Expected response status '${status}',
      but received '${resp.status}' instead.
    `))
  }
  return resp as JSendOutput<ZSuc, ZFal> & {status: S}
}
