import type { VoidFn, Reacty } from './indeps-lookduck'
import { _, injectReact, getInjectedReact } from './indeps-lookduck'
import type {
  Lookable, AnyLookableMap, GottenLookableMapValues
} from './lookable'
import { getEachInLookableMap } from './lookable'
import type { EqualityMode } from './observable'
import { makeEqualityFn } from './observable'

interface HookOpt {
  debounce: number | null // no. of ms, or null to disable
  logRerender: string | null // msg to log on rerender, or null to disable
  equality: EqualityMode
}
const DEFAULT_HOOK_OPT: HookOpt = {
  debounce: null,
  logRerender: null,
  equality: 'is'
}

// Internal helper. Returns a func that forces rerender, if (minimally) req'd.
const useForceRerenderMinimally = function (
  lkArr: Array<Lookable<unknown>>, opt: HookOpt
): VoidFn {
  const React = getInjectedReact()
  const valArrRef = React.useRef(_.map(lkArr, lk => lk.get()))
  const [, setNum] = React.useState(0)
  const equalityFn = makeEqualityFn(opt.equality)
  const forceUpdate = function (): void {
    if (_.stringIs(opt.logRerender)) {
      console.log(`Rerendering ${opt.logRerender} ...`)
    }
    setNum(n => (n + 1) % 2e9) // 2e9 is some big number (32 bit signed)
  }
  const forceUpdateIfChanged = function (): void {
    const newValArr = _.map(lkArr, lk => lk.get())
    // Check equlityFn pairwise, to properly support custom equality functions
    if (!_.all(valArrRef.current, (val, i) => equalityFn(val, newValArr[i]))) {
      valArrRef.current = newValArr
      forceUpdate()
    }
  }
  if (opt.debounce === null) { return forceUpdateIfChanged }
  return _.debounce(forceUpdateIfChanged, opt.debounce)
}

// Internal helper. Creates and manages a subscription for force-rerendering.
const useSubscription = function (
  lkArr: Array<Lookable<unknown>>, forceRerender: VoidFn
): void {
  const React = getInjectedReact()
  const phase = React.useRef<'premount' | 'mounted' | 'unmounted'>('premount')
  const didChangePremount = React.useRef(false)
  const didSubscribe = React.useRef(false)
  const phasewiseListenerMap = {
    premount: () => { didChangePremount.current = true },
    mounted: forceRerender,
    unmounted: () => _.defer(unsubAll) // async-unsub, as we're amid pub-loop
  }
  const rootListener = (): void => phasewiseListenerMap[phase.current]()
  const subAll = (): void => lkArr.forEach(o => o.subscribe(rootListener))
  const unsubAll = (): void => lkArr.forEach(o => o.unsubscribe(rootListener))
  React.useEffect(function () {
    phase.current = 'mounted'
    if (didChangePremount.current) { forceRerender() }
    return function () {
      phase.current = 'unmounted'
      unsubAll()
    }
  }, [])
  if (!didSubscribe.current) {
    didSubscribe.current = true
    subAll() // sync-sub, as we aren't amid pub-loop
  }
}

// Note: useRef vs useCallback regarding `didSubscribe`
// --- --- --- --- --- --- --- --- --- --- --- --- ---
// The `didSubscribe` ref ensures that we subscribe at most once.
// (It is only relevant in the premount/mounted phases, not when unmounted.)
// Alternatively, useCallback-wrapped listener would work too, as subscribeAll()
// internally calls pubsubable.subscribe, which uses a Set for subscribers.
// Howerever, useCallback(fn, deps) is equivalnt to useMemo(() => fn, deps),
// and useMemo may only be used for optimizations, not as a semantic guarantee.
// We need a semantic guarantee that we subscribe at most once, so useCallback
// alone isn't sufficient. Since we'll need useRef anyway, and since the
// callbacks aren't being passed as props, useCallback is unnecessary.

const useLookableArray = function <T extends Array<Lookable<unknown>>>(
  lkArr: T, opts?: Partial<HookOpt>
): void {
  const opt: HookOpt = { ...DEFAULT_HOOK_OPT, ...opts }
  const forceRerender = useForceRerenderMinimally(lkArr, opt)
  useSubscription(lkArr, forceRerender)
}

const useLookableMap = function <LMap extends AnyLookableMap>(
  lkMap: LMap, opt?: Partial<HookOpt>
): GottenLookableMapValues<LMap> {
  useLookableArray(_.values(lkMap), opt)
  return getEachInLookableMap(lkMap)
}
const usePickLookables = function <
  LMap extends AnyLookableMap,
  K extends keyof LMap
>(
  lkMap: LMap, keys: K[], opt?: Partial<HookOpt>
): GottenLookableMapValues<Pick<LMap, K>> {
  return useLookableMap(_.pick(lkMap, keys), opt)
}

type AnyLookables =
  | Array<Lookable<any>>
  | AnyLookableMap
type UseLookablesOutput<T extends AnyLookables> =
  T extends Array<Lookable<any>>
    ? undefined
    : T extends AnyLookableMap
      ? GottenLookableMapValues<T>
      : never
const useLookables = function <T extends AnyLookables>(
  lookables: T, opt?: Partial<HookOpt>
): UseLookablesOutput<T> {
  if (_.arrayIs(lookables)) {
    useLookableArray(lookables, opt)
    return undefined as UseLookablesOutput<T>
  } else if (_.plainObjectIs(lookables)) {
    return useLookableMap(lookables, opt) as UseLookablesOutput<T>
  } else {
    return _.never(lookables)
  }
}

const useLookable = function <T>(
  lk: Lookable<T>, opt?: Partial<HookOpt>
): T {
  return useLookableMap({ lk }, opt).lk
}

// TODO: Consider deprecating in favor of injectReact() and useLookable()
const makeUseLookable = function (React: Reacty): (typeof useLookable) {
  injectReact(React)
  return useLookable
}

export type { HookOpt }
export { useLookables, usePickLookables, useLookable, makeUseLookable }
