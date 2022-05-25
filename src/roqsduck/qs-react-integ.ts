import { _, lookduck } from './indeps-roqsduck'
import type { RouteInfo } from './qs-base-tracker'
import {
  computedRouteInfo,
  setRouteInfo,
  prefixQmark,
  stringifyQs
} from './qs-base-tracker'

type UseLookableFn = ReturnType<typeof lookduck.makeUseLookable>

const makeUseRouteInfo = _.once(function (useLookable: UseLookableFn) {
  return () => useLookable(computedRouteInfo)
})

interface Eventy {
  preventDefault: () => void
}
interface HrefAndOnClick {
  href: string
  onClick: (event: Eventy) => void
}

const getHref = (to: RouteInfo): string => prefixQmark(stringifyQs(to))

const makeOnClick = function (to: RouteInfo) {
  return function (event: Eventy) {
    event.preventDefault()
    setRouteInfo(to)
  }
}

const hrefAndOnClick = function (to: RouteInfo): HrefAndOnClick {
  return { href: getHref(to), onClick: makeOnClick(to) }
}

export type { Eventy, HrefAndOnClick }
export { makeUseRouteInfo, getHref, makeOnClick, hrefAndOnClick }
