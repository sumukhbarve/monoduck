import { computedRouteInfo, setRouteInfo } from './qs-base-tracker'
import {
  makeUseRouteInfo, getHref, makeOnClick, hrefAndOnClick
} from './qs-react-integ'

export type { RouteInfo } from './qs-base-tracker'

export const roqsduck = {
  computedRouteInfo,
  setRouteInfo,
  makeUseRouteInfo,
  getHref,
  makeOnClick,
  hrefAndOnClick
}
