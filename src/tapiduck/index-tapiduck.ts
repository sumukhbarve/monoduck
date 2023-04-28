import { injectZodToJsonSchema } from './indeps-tapiduck'
import { endpoint } from './tapiEndpoint'
import { route, routeUsing, swaggerfy } from './tapiRouter'
import {
  injectIsomorphicFetch, fetch, fetchUsing, expectStatus
} from './tapiFetcher'
import { sockpoint, sockEmit, sockOn, sockUse } from './tapiSockpoint'
import { failish } from './jsend'
import { toOpenApi3, swaggerUiHtml } from './tapiToOpenApi'

export type { TapiEndpoint } from './tapiEndpoint'
export type { TapiSockpoint, TapiSocky } from './tapiSockpoint'

export const tapiduck = {
  // Endpoint:
  endpoint,
  failish,
  // Routing:
  route,
  routeUsing,
  swaggerfy,
  // Fetching:
  injectIsomorphicFetch,
  fetch,
  fetchUsing,
  failMsg: failish, // alias
  nonSuccessMsg: failish,
  expectStatus,
  // Sockets:
  sockpoint,
  sockEmit,
  sockOn,
  sockUse,
  // Open Api:
  injectZodToJsonSchema,
  toOpenApi3,
  swaggerUiHtml
}
