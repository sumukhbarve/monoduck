import { pubsubable } from './pubsubable'
import type { AcceptorFn } from './pubsubable'
import { internalLookableGetterWatcher } from './lookable'
import type { Lookable } from './lookable'

const observable = function<T> (val: T): Lookable<T> & { set: AcceptorFn<T> } {
  const pubsub = pubsubable<T>()
  const self = {
    get: function (): T {
      internalLookableGetterWatcher.publish(self)
      return val
    },
    set: function (newVal: T): void {
      if (val !== newVal) {
        val = newVal
        pubsub.publish(newVal)
      }
    },
    subscribe: pubsub.subscribe,
    unsubscribe: pubsub.unsubscribe
  }
  return self
}

export { observable }
