import { useState, useEffect } from 'react'

type AcceptorFn<T> = (someVal: T) => void

export interface Lookable<T> {
  get: () => T
  subscribe: (fn: AcceptorFn<T>) => (() => void)
}

export const observable = function<T> (val: T): Lookable<T> & { set: AcceptorFn<T> } {
  const subscribers = new Set<AcceptorFn<T>>()
  return {
    get: () => val,
    set: (newVal: T) => {
      if (val !== newVal) {
        val = newVal
        subscribers.forEach(subscriber => subscriber(newVal))
      }
    },
    subscribe: (fn: AcceptorFn<T>) => {
      subscribers.add(fn)
      return () => subscribers.delete(fn)
    }
  }
}

export const computed = function<T> (
  compute: () => T,
  deps: Array<Lookable<any>>
): Lookable<T> {
  const { set: setLookable, ...lookable } = observable(compute())
  const recompute = (): void => setLookable(compute())
  deps.forEach(dep => dep.subscribe(recompute))
  return lookable
}

export const useLookable = function<T> (ob: Lookable<T>): T {
  const [, setBool] = useState(false)
  const rerender = (): void => setBool(bool => !bool)
  useEffect(() => ob.subscribe(rerender), [])
  return ob.get()
}
