import {
  currentRouteInfo, setRouteInfo, getRouteInfo,
  prefixQmark, unprefixQmark, parseQs, stringifyQs
} from './qs-base-tracker'
import {
  useRouteInfo,
  getLinkHref,
  makeLinkClickHandler,
  LinkFC,
  injectReact
} from './qs-react-integ'

export type { RouteInfo } from './qs-base-tracker'

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
  useRouteInfo,
  getLinkHref,
  makeLinkClickHandler,
  LinkFC,
  injectReact
}
