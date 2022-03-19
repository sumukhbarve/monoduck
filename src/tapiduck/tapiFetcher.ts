import type { TapiEndpoint } from './tapiEndpoint'

const fullUrl = function (baseUrl: string, path: string): string {
  return (baseUrl + '/' + path).split('//').join('/')
}

const hitTapiRoute = async function<ZReq, ZRes> (
  baseUrl: string,
  endpoint: TapiEndpoint<ZReq, ZRes>,
  reqData: ZReq
): Promise<ZRes> {
  const url = fullUrl(baseUrl, endpoint.path)
  const res = await fetch(url, {
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

interface TapiFetcher {
  hitRoute: <ZReq, ZRes>(
    endpoint: TapiEndpoint<ZReq, ZRes>,
    reqData: ZReq
  ) => Promise<ZRes>
}
const tapiFetcher = function (baseUrl: string): TapiFetcher {
  const hitRoute = async function<ZReq, ZRes> (
    endpoint: TapiEndpoint<ZReq, ZRes>,
    reqData: ZReq
  ): Promise<ZRes> {
    return await hitTapiRoute(baseUrl, endpoint, reqData)
  }
  return { hitRoute }
}

export type { TapiFetcher }
export { hitTapiRoute, tapiFetcher }
