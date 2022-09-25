import type { Reacty } from './indeps-roqsduck'
import {
  lookduck, injectReact as _injReact, getInjectedReact
} from './indeps-roqsduck'
import type { RouteInfo } from './qs-base-tracker'
import {
  currentRouteInfo,
  setRouteInfo,
  prefixQmark,
  stringifyQs
} from './qs-base-tracker'

const useRouteInfo = function (): RouteInfo {
  // TODO: Accept options and pass them to useLookable
  return lookduck.useLookable(currentRouteInfo)
}

const getLinkHref = function (to: RouteInfo): string {
  return prefixQmark(stringifyQs(to))
}

interface ClickEventyRoqsy {
  preventDefault: () => void
}
const makeLinkClickHandler = function (to: RouteInfo) {
  return function (event: ClickEventyRoqsy) {
    event.preventDefault()
    setRouteInfo(to)
  }
}

// Note the signature of: React.createElement(component, props, ...children)
type CE = Reacty['createElement'] // Local alias
interface LinkFCPropsy<ChildrenType> {
  to: RouteInfo
  children?: ChildrenType
  style?: {
    textDecoration?: string
    color?: string
  }
}
const defaultLinkStyle = {
  textDecoration: 'inherit', color: 'inherit'
}
const LinkFC = function (
  props: LinkFCPropsy<Parameters<CE>[300]>
): ReturnType<CE> {
  const React = getInjectedReact()
  const { to, children, style } = props
  const anchorProps = {
    href: getLinkHref(to),
    onClick: makeLinkClickHandler(to),
    style: { ...defaultLinkStyle, ...style }
  }
  return React.createElement('a', anchorProps, children)
}

// Backward compatible roqsduck.injectReact:
interface InjectReactOutput {
  useRouteInfo: typeof useRouteInfo
  Link: typeof LinkFC
}
const injectReact = function (React: Reacty): InjectReactOutput {
  _injReact(React)
  return { useRouteInfo, Link: LinkFC }
}

export type { ClickEventyRoqsy, LinkFCPropsy, InjectReactOutput }
export {
  useRouteInfo,
  getLinkHref, makeLinkClickHandler,
  LinkFC, injectReact
}
