import { endpoint } from './tapiEndpoint'
import { route, routeUsing } from './tapiRouter'
import {
  injectIsomorphicFetch, fetch, fetchUsing, expectStatus
} from './tapiFetcher'
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
  injectIsomorphicFetch,
  fetch,
  fetchUsing,
  expectStatus,
  sockpoint,
  sockEmit,
  sockOn,
  sockUse
}
