import { _, lookduck } from './indeps-roqsduck'

// How it works:
//  - When the page initially loads, data flows from URL --> App
//  - As the user interacts with the app, data flows from App --> URL
//  - As the user clicks back/forward, data flows from URL --> App
//  - By `App`, we mean `observableQs` (and linked `currentRouteInfo`.)

type RouteInfo = {id: string} & Record<string, string>

const gWindow = globalThis.globalThis === globalThis.window
  ? globalThis
  : {
      location: { search: '' },
      history: { pushState: _.noop },
      addEventListener: _.noop,
      encodeURIComponent: globalThis.encodeURIComponent, // available in node
      decodeURIComponent: globalThis.decodeURIComponent
    }

const prefixQmark = function (s: string): string {
  if (s.startsWith('?')) { return s }
  return '?' + s
}
const unprefixQmark = function (s: string): string {
  if (s.startsWith('?')) { return s.slice(1) }
  return s
}

const splitQsSegment = function (segment: string): [string, string] {
  if (segment === '') {
    throw new Error('Roqsduck: Blank query segment not expected.')
  }
  const seglets = segment.split('=')
  if (seglets.length !== 2) {
    console.warn(`Failed to parse query string segment: ${segment}`)
    return ['invalid_segment', segment]
  }
  return [_.bang(seglets[0]), _.bang(seglets[1])]
}
const decodePair = function (pair: [string, string]): [string, string] {
  const d = gWindow.decodeURIComponent
  return [d(pair[0]), d(pair[1])]
}
const parseQs = function (qs: string): RouteInfo {
  const qsWoQmark = unprefixQmark(qs)
  const segments = qsWoQmark.split('&')
  const pairs = _.map(_.filter(segments), splitQsSegment)
  const routeInfo = _.fromPairs(pairs.map(decodePair))
  return { id: '', ...routeInfo }
}
const stringifyQs = function (routeInfo: RouteInfo): string {
  const e = gWindow.encodeURIComponent
  return _.toPairs(routeInfo).map(p => `${e(p[0])}=${e(p[1])}`).join('&')
}

// Handle initial data flow from URL --> App with proper initialization:
const observableQs = lookduck.observable(unprefixQmark(gWindow.location.search))
let qsPopInProgress: boolean = false
// Handle data flow from App --> URL as user interacts with the App:
observableQs.subscribe(function () {
  if (!qsPopInProgress) {
    gWindow.history.pushState(null, '', prefixQmark(observableQs.get()))
  }
})
// Handle data flow from URL --> App as the users navigates back/forward:
gWindow.addEventListener('popstate', function () {
  qsPopInProgress = true
  observableQs.set(unprefixQmark(gWindow.location.search))
  qsPopInProgress = false
})

const currentRouteInfo = lookduck.computed(function (): RouteInfo {
  const qs = observableQs.get()
  return parseQs(unprefixQmark(qs))
})
const setRouteInfo = function (routeInfo: RouteInfo): void {
  observableQs.set(unprefixQmark(stringifyQs(routeInfo)))
}
const getRouteInfo = (): RouteInfo => currentRouteInfo.get() // For export only

// Note: `observableQs` is _not_ exported, but `currentRouteInfo` is.
export type { RouteInfo }
export {
  // Lookability:
  currentRouteInfo,
  setRouteInfo,
  getRouteInfo,
  // Helpers:
  prefixQmark,
  unprefixQmark,
  parseQs,
  stringifyQs
}
