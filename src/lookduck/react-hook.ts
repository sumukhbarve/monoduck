import type { VoidFn, Reacty } from './indeps-lookduck'
import { _, getReact, injectReact } from './indeps-lookduck'
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
const defaultHookOpt: HookOpt = {
  debounce: null,
  logRerender: null,
  equality: 'is'
}

const useMinimalRerender = function (
  lkArr: Array<Lookable<unknown>>, opt: HookOpt
): VoidFn {
  const React = getReact()
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

const useSubscription = function (
  lkArr: Array<Lookable<unknown>>, minRerender: VoidFn
): void {
  const React = getReact()
  const phase = React.useRef<'premount' | 'mounted' | 'unmounted'>('premount')
  const didChangePremount = React.useRef(false)
  const didSubscribe = React.useRef(false)
  const phasewiseListenerMap = {
    premount: () => { didChangePremount.current = true },
    mounted: minRerender,
    unmounted: () => _.defer(unsubAll) // async-unsub, as we're amid pub-loop
  }
  const rootListener = (): void => phasewiseListenerMap[phase.current]()
  const subAll = (): void => lkArr.forEach(o => o.subscribe(rootListener))
  const unsubAll = (): void => lkArr.forEach(o => o.unsubscribe(rootListener))
  React.useEffect(function () {
    phase.current = 'mounted'
    if (didChangePremount.current) { minRerender() }
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

const useLookableArray = function <T extends Array<Lookable<unknown>>>(
  lkArr: T, opts?: Partial<HookOpt>
): undefined {
  const opt: HookOpt = { ...defaultHookOpt, ...opts }
  const minRerender = useMinimalRerender(lkArr, opt)
  useSubscription(lkArr, minRerender)
  return undefined
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

// Note: useRef vs useCallback (in makeUseLookables)
// --- --- --- --- --- --- --- --- --- --- --- ---
// The `didSubscribe` ref ensures that we subscribe at most once.
// (It is only relevant in the premount/mounted phases, not when unmounted.)
// Alternatively, useCallback-wrapped listener would work too, as subscribeAll()
// internally calls pubsubable.subscribe, which uses a Set for subscribers.
// Howerever, useCallback(fn, deps) is equivalnt to useMemo(() => fn, deps),
// and useMemo may only be used for optimizations, not as a semantic guarantee.
// We need a semantic guarantee that we subscribe at most once, so useCallback
// alone isn't sufficient. Since we'll need useRef anyway, and since the
// callbacks aren't being passed as props, useCallback is unnecessary.

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

const useSingleLookable = function <T>(
  lk: Lookable<T>, opt?: Partial<HookOpt>
): T {
  return useLookableMap({ lk }, opt).lk
}
const useLookable = function <T>(
  lk: Lookable<T>, opt?: Partial<HookOpt>
): T {
  console.warn(_.singleSpaced(`
    Lookduck: useLookable() is deprecated.
    Please switch to usePickLookables() or useSingleLookable() instead.
  `))
  return useSingleLookable(lk, opt)
}
const makeUseLookable = function (React: Reacty): (typeof useLookable) {
  console.warn(_.singleSpaced(`
    Lookduck: makeUseLookable() is deprecated.
    Please call lookduck.injectReact() and then lookduck.useLookables() instead.
  `))
  injectReact(React)
  return useLookable
}

const batch = function (fn: VoidFn): void {
  const React = getReact()
  if (_.bool(React.unstable_batchedUpdates)) {
    React.unstable_batchedUpdates(fn)
  } else {
    fn()
  }
}

export type { HookOpt }
export {
  useSingleLookable, usePickLookables, useLookables, batch,
  useLookable, makeUseLookable
}
