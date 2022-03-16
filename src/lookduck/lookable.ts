import { AcceptorFn, pubsubable } from './pubsubable'

interface Lookable<T> {
  get: () => T
  subscribe: (fn: AcceptorFn<T>) => (() => void)
  unsubscribe: (fn: AcceptorFn<T>) => void
}

const internalLookableGetterWatcher = pubsubable<Lookable<unknown>>()

export type { Lookable }
export { internalLookableGetterWatcher }
