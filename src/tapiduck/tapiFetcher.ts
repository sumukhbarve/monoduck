import type { TapiEndpoint } from './tapiEndpoint'
import type { NoInfer } from './indeps-tapiduck'
import {
  injectFetch as injectIsomorphicFetch, getInjectedFetch
} from './indeps-tapiduck'

const fetch = async function<ZReq, ZRes> (
  endpoint: TapiEndpoint<ZReq, ZRes>,
  reqData: NoInfer<ZReq>,
  baseUrl: string = ''
): Promise<NoInfer<ZRes>> {
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
  if (res.status !== 200) {
    console.warn(`${endpoint.path}: Non-200 response, text:`)
    console.warn(text)
  }
  const sdata = JSON.parse(text)
  const parsedRes = endpoint.zRes.safeParse(sdata)
  if (!parsedRes.success) {
    const errMsg = `${endpoint.path}: Bad response format`
    throw new Error(errMsg)
  }
  return parsedRes.data
}

type BoundFetchFn = <ZReq, ZRes>(
    endpoint: TapiEndpoint<ZReq, ZRes>,
    reqData: NoInfer<ZReq>
  ) => Promise<NoInfer<ZRes>>

const fetchUsing = function (baseUrl: string): BoundFetchFn {
  const boundHit = async function<ZReq, ZRes> (
    endpoint: TapiEndpoint<ZReq, ZRes>,
    reqData: NoInfer<ZReq>
  ): Promise<NoInfer<ZRes>> {
    return await fetch(endpoint, reqData, baseUrl)
  }
  return boundHit
}

export type { BoundFetchFn }
export { fetch, fetchUsing, injectIsomorphicFetch }
