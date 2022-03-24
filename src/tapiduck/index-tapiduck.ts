import { endpoint, TapiError } from './tapiEndpoint'
import { route, routeUsing } from './tapiRouter'
import { fetch, fetchUsing } from './tapiFetcher'

export type { TapiEndpoint } from './tapiEndpoint'
export type { BoundRouteFn } from './tapiRouter'
export type { BoundFetchFn } from './tapiFetcher'

export { TapiError }

export const tapiduck = {
  endpoint,
  TapiError,
  route,
  routeUsing,
  fetch,
  fetchUsing
}
