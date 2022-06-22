import type { VoidFn } from './indeps-lookduck'

type AcceptorFn<T> = (someVal: T) => void

interface Pubsubable<T> {
  publish: AcceptorFn<T>
  subscribe: (fn: AcceptorFn<T>) => VoidFn
  unsubscribe: (fn: AcceptorFn<T>) => void
  __monoduck__: {
    getSubCount: () => number
    subIs: (fn: AcceptorFn<T>) => boolean
  }
}

const pubsubable = function<T> (): Pubsubable<T> {
  const subscribers = new Set<AcceptorFn<T>>()
  const self: Pubsubable<T> = {
    publish: (val: T) => subscribers.forEach(subscriber => subscriber(val)),
    unsubscribe: (fn: AcceptorFn<T>) => subscribers.delete(fn),
    subscribe: function (fn: AcceptorFn<T>) {
      subscribers.add(fn)
      return () => self.unsubscribe(fn)
    },
    __monoduck__: {
      getSubCount: () => subscribers.size,
      subIs: (fn: AcceptorFn<T>) => subscribers.has(fn)
    }
  }
  return self
}

export type { AcceptorFn, Pubsubable }
export { pubsubable }
