import { pubsubable } from './pubsubable'
import type { AcceptorFn } from './pubsubable'
import type { LookableDunderMonoduck, Lookable } from './lookable'
import { internalLookableGetterWatcher, lookableIs } from './lookable'
import { _ } from './indeps-lookduck'
import type { VoidFn } from './indeps-lookduck'

type EqualityStr = 'is' | 'shallow' | 'deep'
type EqualityFn = (x: unknown, y: unknown) => boolean
type EqualityMode = EqualityStr | EqualityFn

const makeEqualityFn = function (equality?: EqualityMode): EqualityFn {
  if (equality === undefined) { return Object.is }
  if (!_.stringIs(equality)) { return equality }
  if (equality === 'is') { return Object.is }
  if (equality === 'shallow') { return _.shallowEquals }
  if (equality === 'deep') { return _.deepEquals }
  return _.never(equality)
}

interface ObservableDunderMonoduck extends LookableDunderMonoduck {
  isSettable: true
}
interface Observable<T> extends Lookable<T> {
  set: AcceptorFn<T>
  reset: VoidFn
  __monoduck__: ObservableDunderMonoduck
}
const observableIs = function (x: unknown): x is Observable<unknown> {
  return lookableIs(x) && _.plainObjectIs(x) && _.all([
    _.functionIs(x.set) && x.set.length === 1,
    _.functionIs(x.reset) && x.reset.length === 0,
    x.__monoduck__.isSettable,
    x.__monoduck__.getDepCount() === 0 // observables have no dependencies
  ])
}

const observable = function<T> (
  val: T,
  equality?: EqualityMode
): Observable<T> {
  const initVal = val
  const equalityFn = makeEqualityFn(equality)
  const pubsub = pubsubable<T>()
  const self: Observable<T> = {
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
    reset: () => self.set(initVal),
    subscribe: pubsub.subscribe,
    unsubscribe: pubsub.unsubscribe,
    __monoduck__: {
      isLookable: true,
      isSettable: true,
      getSubCount: pubsub.__monoduck__.getSubCount,
      subIs: pubsub.__monoduck__.subIs,
      getDepCount: () => 0,
      depIs: (_x: Lookable<unknown>) => false
    }
  }
  return self
}

const shallowObservable = function<T> (
  val: T
): Lookable<T> & { set: AcceptorFn<T> } {
  return observable(val, 'shallow')
}

export type { EqualityMode, ObservableDunderMonoduck, Observable }
export { observable, observableIs, shallowObservable, makeEqualityFn }
