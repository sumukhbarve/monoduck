import { endpoint } from './tapiEndpoint'
import { route, routeUsing } from './tapiRouter'
import { fetch, fetchUsing, injectIsomorphicFetch } from './tapiFetcher'
import { sockpoint, sockEmit, sockOn, sockUse } from './tapiSockpoint'
import { failish } from './jsend'

export type { TapiEndpoint } from './tapiEndpoint'
export type { TapiSockpoint, TapiSocky } from './tapiSockpoint'

export const tapiduck = {
  endpoint,
  failish,
  failMsg: failish, // alias
  nonSuccessMsg: failish,
  route,
  routeUsing,
  fetch,
  fetchUsing,
  injectIsomorphicFetch,
  sockpoint,
  sockEmit,
  sockOn,
  sockUse
}
