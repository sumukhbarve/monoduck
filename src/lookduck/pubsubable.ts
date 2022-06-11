type AcceptorFn<T> = (someVal: T) => void

interface Pubsubable<T> {
  publish: AcceptorFn<T>
  subscribe: (fn: AcceptorFn<T>) => (() => void)
  unsubscribe: (fn: AcceptorFn<T>) => void
}

const pubsubable = function<T> (): Pubsubable<T> {
  const subscribers = new Set<AcceptorFn<T>>()
  const self = {
    publish: (val: T) => subscribers.forEach(subscriber => subscriber(val)),
    unsubscribe: (fn: AcceptorFn<T>) => subscribers.delete(fn),
    subscribe: function (fn: AcceptorFn<T>) {
      subscribers.add(fn)
      return () => self.unsubscribe(fn)
    }
  }
  return self
}

export type { AcceptorFn, Pubsubable }
export { pubsubable }
