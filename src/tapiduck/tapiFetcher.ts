import type { TapiEndpoint } from './tapiEndpoint'
import { buildJSendy, buildZJSendOutput } from './tapiEndpoint'
import type { NoInfer, JsonValue } from './indeps-tapiduck'
import { getInjectedFetch } from './indeps-tapiduck'

export { injectFetch as injectIsomorphicFetch } from './indeps-tapiduck'

type JV = JsonValue // Short, local alias

/* eslint-disable @typescript-eslint/explicit-function-return-type */

export const fetch = async function<ZReq extends JV, ZSuc extends JV, ZFal extends JV> (
  endpoint: TapiEndpoint<ZReq, ZSuc, ZFal>,
  reqData: NoInfer<ZReq>,
  baseUrl: string = ''
) {
  if (baseUrl.endsWith('/')) {
    throw new Error(`Error: Base URL '${baseUrl}' shouldn't end with '/'.`)
  }

  const windowyFetch = getInjectedFetch()
  const url = `${baseUrl}${endpoint.path}`
  const res = await windowyFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reqData)
  })
  const text = await res.text()
  const sdata = JSON.parse(text)
  const zOutput = buildZJSendOutput(endpoint)
  const parsedOutput = zOutput.safeParse(sdata)
  if (parsedOutput.success) {
    return parsedOutput.data
  }
  const jSendy = buildJSendy<ZSuc, ZFal>()
  return jSendy.zodfail('client', parsedOutput.error.message)
}

// export type BoundFetchFn = <ZReq extends JV, ZRes extends JV, ZErr extends JV>(
//     endpoint: TapiEndpoint<ZReq, ZRes, ZRes>,
//     reqData: NoInfer<ZReq>
//   ) => Promise<FetchOutputTuple<ZRes, ZErr>>

export const fetchUsing = function (baseUrl: string) {
  const boundHit = async function<ZReq extends JV, ZRes extends JV, ZErr extends JV> (
    endpoint: TapiEndpoint<ZReq, ZRes, ZErr>,
    reqData: NoInfer<ZReq>
  ) {
    return await fetch(endpoint, reqData, baseUrl)
  }
  return boundHit
}
