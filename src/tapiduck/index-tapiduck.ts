import { endpoint, TapiError } from './tapiEndpoint'
import { route, routeUsing } from './tapiRouter'
import { fetch, fetchUsing, injectIsomorphicFetch } from './tapiFetcher'
import { sockpoint, sockEmit, sockOn, sockUse } from './tapiSockpoint'

export type { TapiEndpoint } from './tapiEndpoint'
export type { TapiSockpoint, TapiSocky } from './tapiSockpoint'

export { TapiError }

export const tapiduck = {
  endpoint,
  TapiError,
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
