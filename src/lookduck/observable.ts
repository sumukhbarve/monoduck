import { pubsubable } from './pubsubable'
import type { AcceptorFn } from './pubsubable'
import { internalLookableGetterWatcher } from './lookable'
import type { Lookable } from './lookable'
import { _ } from './indeps-lookduck'
// import type { NoInfer} from './indeps-lookduck'

type EqualityStr = 'is' | 'shallow' | 'deep'
type EqualityFn = (x: unknown, y: unknown) => boolean
type EqualityMode = EqualityStr | EqualityFn

const makeEqualityFn = function <T>(
  _val: T,
  equality?: EqualityMode
): EqualityFn {
  if (equality === undefined) { return Object.is }
  if (!_.stringIs(equality)) { return equality }
  if (equality === 'is') { return Object.is }
  if (equality === 'shallow') { return _.shallowEquals }
  if (equality === 'deep') { return _.deepEquals }
  return _.never(equality)
}

const observable = function<T> (
  val: T,
  equality?: EqualityMode
): Lookable<T> & { set: AcceptorFn<T> } {
  const equalityFn = makeEqualityFn(val, equality)
  const pubsub = pubsubable<T>()
  const self = {
    get: function (): T {
      internalLookableGetterWatcher.publish(self)
      return val
    },
    set: function (newVal: T): void {
      if (!equalityFn(val, newVal)) {
        val = newVal
        pubsub.publish(newVal)
      }
    },
    subscribe: pubsub.subscribe,
    unsubscribe: pubsub.unsubscribe
  }
  return self
}

const shallowObservable = function<T> (
  val: T
): Lookable<T> & { set: AcceptorFn<T> } {
  return observable(val, 'shallow')
}

export type { EqualityMode }
export { observable, shallowObservable }
