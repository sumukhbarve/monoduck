import type { Lookable } from './lookable'
import { _ } from './indeps-lookduck'

interface ReactyLooky {
  useState: (val: boolean) => [boolean, (cb: (val: boolean) => boolean) => void]
  useEffect: (effect: () => void, deps?: unknown[]) => void
}

type UseLookableFn = <T>(ob: Lookable<T>) => T

// Creates useLookable from React's useState and useEffect
const makeUseLookable = _.once(function (React: ReactyLooky): UseLookableFn {
  const useLookable = function<T> (ob: Lookable<T>): T {
    let phase: 'premount' | 'mounted' | 'unmounted' = 'premount'
    let premountChangeDetected = false
    const [, setBool] = React.useState(false)
    const rerender = (): void => setBool(bool => !bool)
    const unsubscribe = ob.subscribe(function () {
      if (phase === 'premount') {
        premountChangeDetected = true
      } else if (phase === 'mounted') {
        rerender()
      } else if (phase === 'unmounted') {
        setTimeout(() => unsubscribe(), 0) // don't sync-unsub amid pub-loop
      } else {
        _.never(phase)
      }
    })
    React.useEffect(function () {
      phase = 'mounted'
      if (premountChangeDetected) { rerender() }
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
