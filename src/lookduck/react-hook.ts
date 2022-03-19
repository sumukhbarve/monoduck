// import { useState, useEffect } from 'react'
import { Lookable } from './lookable'

type Bool = boolean
type UseStateFn = (val: Bool) => [Bool, (cb: (val: Bool) => Bool) => void]
type UseEffectFn = (effect: () => void, deps?: unknown[]) => void

type UseLookableFn = <T>(ob: Lookable<T>) => T

const makeUseLookable = function (
  useState: UseStateFn,
  useEffect: UseEffectFn
): UseLookableFn {
  const useLookable = function<T> (ob: Lookable<T>): T {
    const [, setBool] = useState(false)
    const rerender = (): void => setBool(bool => !bool)
    useEffect(() => ob.subscribe(rerender), [])
    return ob.get()
  }
  return useLookable
}

export type { UseStateFn, UseEffectFn, UseLookableFn }
export { makeUseLookable }
