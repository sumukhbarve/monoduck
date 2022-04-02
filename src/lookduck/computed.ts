import { internalLookableGetterWatcher } from './lookable'
import type { Lookable } from './lookable'
import { observable } from './observable'
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
    lookable => {
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
  const initResult = runAndDetectDeps(compute, new Set<Dep>())
  const currentDeps = initResult.freshDeps
  const { set: setLookable, ...lookable } = observable(
    initResult.computedVal, equality
  )
  const recompute = (): void => {
    const runResult = runAndDetectDeps(compute, currentDeps)
    setLookable(runResult.computedVal)
    runResult.freshDeps.forEach(dep => {
      currentDeps.add(dep)
      dep.subscribe(recompute)
    })
    runResult.staleDeps.forEach(dep => {
      currentDeps.delete(dep)
      dep.unsubscribe(recompute)
    })
  }
  currentDeps.forEach(dep => dep.subscribe(recompute))
  return lookable
}

const shallowComputed = function<T> (compute: () => T): Lookable<T> {
  return computed(compute, 'shallow')
}

export { computed, shallowComputed }
