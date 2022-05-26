import {
  currentRouteInfo, setRouteInfo, getRouteInfo,
  prefixQmark, unprefixQmark, parseQs, stringifyQs
} from './qs-base-tracker'
import {
  makeUseRouteInfo,
  getLinkHref,
  makeLinkClickHandler,
  makeLinkFC,
  injectReact
} from './qs-react-integ'

export type { RouteInfo } from './qs-base-tracker'
export type { ReactyRoqsy } from './qs-react-integ'

export const roqsduck = {
  // Lookability:
  currentRouteInfo,
  setRouteInfo,
  getRouteInfo,
  // Helpers:
  prefixQmark,
  unprefixQmark,
  parseQs,
  stringifyQs,
  // React Integ:
  makeUseRouteInfo,
  getLinkHref,
  makeLinkClickHandler,
  makeLinkFC,
  injectReact
}
