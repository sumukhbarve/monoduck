import { internalLookableGetterWatcher } from './lookable'
import type { Lookable } from './lookable'
import { makeEqualityFn, observable } from './observable'
import type { EqualityMode } from './observable'

const getSetDifference = function<T> (setA: Set<T>, setB: Set<T>): Set<T> {
  const onlyA = new Set(setA)
  setB.forEach(itemB => onlyA.delete(itemB))
  return onlyA
}

type Dep = Lookable<unknown>

interface RunResultInterface<T> {
  computedVal: T // After the computation:
  freshDeps: Set<Dep> // Start tracking these
  carryDeps: Set<Dep> // Keep tracking these
  staleDeps: Set<Dep> // Stop tracking these
}

const runAndDetectDeps = function<T> (
  compute: () => T,
  prevDeps: Set<Dep>
): RunResultInterface<T> {
  const freshDeps = new Set<Dep>()
  const carryDeps = new Set<Dep>()
  const unsubscribeFromGetterWatcher = internalLookableGetterWatcher.subscribe(
    function (lookable) {
      prevDeps.has(lookable) ? carryDeps.add(lookable) : freshDeps.add(lookable)
    }
  )
  const computedVal = compute()
  unsubscribeFromGetterWatcher()
  const staleDeps = getSetDifference(prevDeps, carryDeps)
  return { computedVal, freshDeps, carryDeps, staleDeps }
}

const computed = function<T> (
  compute: () => T,
  equality?: EqualityMode
): Lookable<T> {
  let firstComputeDone = false
  const rawEqualityFn = makeEqualityFn(equality)
  const equalityFn = function (x: unknown, y: unknown): boolean {
    if (!firstComputeDone) { return x === undefined && y === undefined }
    return rawEqualityFn(x, y)
  }
  const currentDeps = new Set<Dep>()
  const { set: setLookable, reset: _reset, ...rawLookable } = observable(
    undefined as unknown as T, equalityFn
  )
  const recompute = function (): void {
    const runResult = runAndDetectDeps(compute, currentDeps)
    setLookable(runResult.computedVal)
    runResult.freshDeps.forEach(function (dep) {
      currentDeps.add(dep)
      dep.subscribe(recompute)
    })
    runResult.staleDeps.forEach(function (dep) {
      currentDeps.delete(dep)
      dep.unsubscribe(recompute)
    })
  }
  const firstCompute = function (): void {
    if (!firstComputeDone) {
      recompute() // -> compute -> setLookable -> equalityFn; -> refresh deps
      firstComputeDone = true // _after_ 1st recompute(), for equalityFn
    }
  }
  return {
    get: function () { firstCompute(); return rawLookable.get() },
    subscribe: function (f) { firstCompute(); return rawLookable.subscribe(f) },
    unsubscribe: rawLookable.unsubscribe
  }
}

const shallowComputed = function<T> (compute: () => T): Lookable<T> {
  return computed(compute, 'shallow')
}

export { computed, shallowComputed }
