import type { VoidFn } from './indeps-lookduck'
import type { Lookable } from './lookable'
import { _ } from './indeps-lookduck'

interface ReactyLooky {
  useState: (val: boolean) => [boolean, (cb: (val: boolean) => boolean) => void]
  useEffect: (effect: () => VoidFn, deps?: unknown[]) => void
}

type UseLookableFn = <T>(ob: Lookable<T>) => T

// Creates useLookable from React's useState and useEffect
const makeUseLookable = _.once(function (React: ReactyLooky): UseLookableFn {
  const useLookable = function<T> (ob: Lookable<T>): T {
    let phase: 'premount' | 'mounted' | 'unmounted' = 'premount'
    let didChangePremount = false
    const [, setBool] = React.useState(false)
    const rerender = (): void => setBool(bool => !bool)
    const unsubscribe = ob.subscribe(function () {
      switch (phase) {
        case 'premount': return (function () { didChangePremount = true })()
        case 'mounted': return rerender()
        // async-unsub if unmounted, as we're amid pub-loop
        case 'unmounted': return setTimeout(() => unsubscribe(), 0)
        default: return _.never(phase)
      }
    })
    React.useEffect(function () {
      phase = 'mounted'
      if (didChangePremount) { rerender() }
      // cleanup fn
      return function () {
        phase = 'unmounted'
        unsubscribe() // sync-unsub, as we aren't amid pub-loop
      }
    }, [])
    return ob.get()
  }
  return useLookable
})

export type { ReactyLooky, UseLookableFn }
export { makeUseLookable }
