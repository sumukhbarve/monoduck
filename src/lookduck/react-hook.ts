import type { VoidFn, AnyFn } from './indeps-lookduck'
import type {
  Lookable, AnyLookableMap, GottenLookableValueMap
} from './lookable'
import { getLookables } from './lookable'
import { _ } from './indeps-lookduck'

interface ReactyLooky {
  useState: <T>(initVal: T) => [T, (cb: (val: T) => T) => void]
  useEffect: (effect: () => VoidFn, deps?: unknown[]) => void
  useRef: <T>(initVal: T) => {current: T}
  useCallback: (callback: VoidFn, deps: unknown[]) => VoidFn
  // Optionals:
  unstable_batchedUpdates?: (fn: VoidFn) => void
  createRoot?: AnyFn
}

interface UseLookablezOpt {
  debounce: number | false // no. of miliseconds, or false
  logRerender: string | false // msg to log on rerender, or false
}
const getDefaultLookablezOpt = _.once(
  function (React: ReactyLooky): UseLookablezOpt {
    return {
      debounce: _.bool(React.createRoot) ? false : 10, // 10 ms => 100 fps
      logRerender: false
    }
  }
)

type UseLookablesFn = <LMap extends AnyLookableMap>(
  lkMap: LMap,
  options?: Partial<UseLookablezOpt>
) => GottenLookableValueMap<LMap>

// Creates useLookables from React's useState and useEffect
const makeUseLookables = _.once(function (React: ReactyLooky): UseLookablesFn {
  //
  // Debounce Hook:
  const useDebounceAwareRerender = function (opt: UseLookablezOpt): VoidFn {
    const [, setNum] = React.useState(0)
    const rerender = function (): void {
      if (_.stringIs(opt.logRerender)) {
        console.log(`Rerendering ${opt.logRerender} ...`)
      }
      setNum(n => (n + 1) % 2e9) // 2e9 is just some big number (32 bit signed)
    }
    if (opt.debounce === false) { return rerender }
    return _.debounce(rerender, opt.debounce)
  }
  //
  // Subscription Hook:
  const useSubscription = function (
    lkArr: Array<Lookable<unknown>>, daRerender: VoidFn
  ): void {
    const phase = React.useRef<'premount' | 'mounted' | 'unmounted'>('premount')
    const didChangePremount = React.useRef(false)
    const didSubscribe = React.useRef(false)
    const phasewiseListenerMap = {
      premount: () => { didChangePremount.current = true },
      mounted: daRerender,
      unmounted: () => _.defer(unsubAll) // async-unsub, as we're amid pub-loop
    }
    const rootListener = (): void => phasewiseListenerMap[phase.current]()
    const subAll = (): void => lkArr.forEach(o => o.subscribe(rootListener))
    const unsubAll = (): void => lkArr.forEach(o => o.unsubscribe(rootListener))
    React.useEffect(function () {
      phase.current = 'mounted'
      if (didChangePremount.current) { daRerender() }
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
  //
  // Main Hook:
  const useLookables = function <LMap extends AnyLookableMap>(
    lkMap: LMap, opts?: Partial<UseLookablezOpt>
  ): GottenLookableValueMap<LMap> {
    const opt: UseLookablezOpt = { ...getDefaultLookablezOpt(React), ...opts }
    const daRerender = useDebounceAwareRerender(opt)
    useSubscription(Object.values(lkMap), daRerender)
    return getLookables(lkMap)
  }
  //
  // Return Hook:
  return useLookables
})

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

type UseLookableFn = <T>(lk: Lookable<T>, opt?: Partial<UseLookablezOpt>) => T

// Creates useLookable from React's useState and useEffect
const makeUseLookable = _.once(function (React: ReactyLooky): UseLookableFn {
  const useLookables = makeUseLookables(React)
  const useLookable = function <T>(
    lk: Lookable<T>, opt?: Partial<UseLookablezOpt>
  ): T {
    return useLookables({ lk }, opt).lk
  }
  return useLookable
})

const makeBatch = _.once(function (React: ReactyLooky) {
  const mockUnstableBatchedUpdates = (fn: VoidFn): void => fn()
  return React.unstable_batchedUpdates ?? mockUnstableBatchedUpdates
})

const injectReact = _.once(function (React: ReactyLooky) {
  return {
    useLookables: makeUseLookables(React),
    useLookable: makeUseLookable(React),
    batch: makeBatch(React)
  }
})

export type { ReactyLooky, UseLookableFn, UseLookablezOpt }
export { makeUseLookable, injectReact }
