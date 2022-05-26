import type { ReactyLooky } from './indeps-roqsduck'
import { _, lookduck } from './indeps-roqsduck'
import type { RouteInfo } from './qs-base-tracker'
import {
  currentRouteInfo,
  setRouteInfo,
  prefixQmark,
  stringifyQs
} from './qs-base-tracker'

const makeUseRouteInfo = _.once(function (React: ReactyLooky) {
  const useLookable = lookduck.makeUseLookable(React)
  return () => useLookable(currentRouteInfo)
})

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

type CreateElementyRoqsy =
  (tag: string, props: Record<string, any>, ...children: any) => any
type ReactyRoqsy = ReactyLooky & {
  createElement: CreateElementyRoqsy
}
interface LinkFCPropsy<ChildrenType> {
  to: RouteInfo
  children?: ChildrenType
  style?: {
    textDecoration?: string
    color?: string
  }
}
const makeLinkFC = _.once(function<CE extends CreateElementyRoqsy> (
  createElement: CE
): (props: LinkFCPropsy<Parameters<CE>[300]>) => ReturnType<CE> {
  const LinkFC = function (
    props: LinkFCPropsy<Parameters<CE>[300]>
  ): ReturnType<CE> {
    const { to, children, style } = props
    const anchorProps = {
      href: getLinkHref(to),
      onClick: makeLinkClickHandler(to),
      style: { textDecoration: 'inherit', color: 'inherit', ...style }
    }
    return createElement('a', anchorProps, children)
  }
  return LinkFC
})

const injectReact = _.once(function (React: ReactyRoqsy) {
  return {
    useRouteInfo: makeUseRouteInfo(React),
    Link: makeLinkFC(React.createElement)
  }
})

export type { ClickEventyRoqsy, CreateElementyRoqsy, LinkFCPropsy, ReactyRoqsy }
export {
  makeUseRouteInfo,
  getLinkHref, makeLinkClickHandler,
  makeLinkFC, injectReact
}
