import { tapiEndpoint, TapiError } from './tapiEndpoint'
import type { TapiEndpoint } from './tapiEndpoint'
import { addTapiRoute, tapiRouter } from './tapiRouter'
import { hitTapiRoute, tapiFetcher } from './tapiFetcher'

export type { TapiEndpoint }
export {
  tapiEndpoint, TapiError,
  addTapiRoute, tapiRouter,
  hitTapiRoute, tapiFetcher
}
