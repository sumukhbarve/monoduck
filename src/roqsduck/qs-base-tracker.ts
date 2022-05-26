import { _, lookduck } from './indeps-roqsduck'

// How it works:
//  - When the page initially loads, data flows from URL --> App
//  - As the user interacts with the app, data flows from App --> URL
//  - As the user clicks back/forward, data flows from URL --> App
//  - By `App`, we mean `observableQs` (and linked `currentRouteInfo`.)

type RouteInfo = {id: string} & Record<string, string>

const windowLocation = globalThis.location
const windowHistory = globalThis.history
const windowAddEventListener = globalThis.addEventListener

const prefixQmark = function (s: string): string {
  if (s.startsWith('?')) { return s }
  return '?' + s
}
const unprefixQmark = function (s: string): string {
  if (s.startsWith('?')) { return s.slice(1) }
  return s
}

const parseQs = function (qs: string): RouteInfo {
  const qsWoQmark = unprefixQmark(qs)
  const parts = qsWoQmark.split('&')
  const pairs = parts.map(s => s.split('=') as [string, string])
  const routeInfo = _.fromPairs(pairs)
  return { id: '', ...routeInfo }
}
const stringifyQs = function (routeInfo: RouteInfo): string {
  return _.toPairs(routeInfo).map(pair => `${pair[0]}=${pair[1]}`).join('&')
}

// Handle initial data flow from URL --> App with proper initialization:
const observableQs = lookduck.observable(unprefixQmark(windowLocation.search))
let qsPopInProgress: boolean = false
// Handle data flow from App --> URL as user interacts with the App:
observableQs.subscribe(function () {
  if (!qsPopInProgress) {
    windowHistory.pushState(null, '', prefixQmark(observableQs.get()))
  }
})
// Handle data flow from URL --> App as the users navigates back/forward:
windowAddEventListener('popstate', function () {
  qsPopInProgress = true
  observableQs.set(unprefixQmark(windowLocation.search))
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
