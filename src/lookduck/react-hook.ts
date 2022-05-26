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
    const [, setBool] = React.useState(false)
    const rerender = (): void => setBool(bool => !bool)
    // ob.subscribe() returns the unsubscribe fn for effect cleanup.
    React.useEffect(() => ob.subscribe(rerender), [])
    return ob.get()
  }
  return useLookable
})

export type { ReactyLooky, UseLookableFn }
export { makeUseLookable }
