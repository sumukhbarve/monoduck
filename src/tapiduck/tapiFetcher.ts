import type { ZodSchema } from 'zod'
import type { TapiEndpoint } from './tapiEndpoint'
import type { NoInfer, JsonValue } from './indeps-tapiduck'
import { TapiError } from './tapiEndpoint'
import { getInjectedFetch } from './indeps-tapiduck'

export { injectFetch as injectIsomorphicFetch } from './indeps-tapiduck'

export const fetch = async function<ZReq extends JsonValue, ZRes extends JsonValue> (
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
  const sdata = JSON.parse(text)
  if (res.status === 418) {
    throw new TapiError(sdata)
  }
  if (res.status !== 200) {
    console.warn(`${endpoint.path}: Unexpected, non-200 response code.`)
  }
  const parsedRes = endpoint.zRes.safeParse(sdata)
  if (!parsedRes.success) {
    console.error('Bad response format', parsedRes.error)
    const errMsg = `${endpoint.path}: Bad response format`
    throw new Error(errMsg)
  }
  return parsedRes.data
}

export type BoundFetchFn = <ZReq extends JsonValue, ZRes extends JsonValue>(
    endpoint: TapiEndpoint<ZReq, ZRes>,
    reqData: NoInfer<ZReq>
  ) => Promise<NoInfer<ZRes>>

export const fetchUsing = function (baseUrl: string): BoundFetchFn {
  const boundHit = async function<ZReq extends JsonValue, ZRes extends JsonValue> (
    endpoint: TapiEndpoint<ZReq, ZRes>,
    reqData: NoInfer<ZReq>
  ): Promise<NoInfer<ZRes>> {
    return await fetch(endpoint, reqData, baseUrl)
  }
  return boundHit
}

export const tapiCatch = async function<ZErr extends JsonValue, ZRes extends JsonValue> (
  zErr: ZodSchema<ZErr>,
  resPromise: Promise<ZRes>,
  fallback: (errorData: NoInfer<ZErr>) => NoInfer<ZRes>
): Promise<NoInfer<ZRes>> {
  try {
    return await resPromise
  } catch (error) {
    if (error instanceof TapiError) {
      const parsed = zErr.safeParse(error.data)
      if (parsed.success) {
        return fallback(parsed.data)
      }
    }
    throw error
  }
}
