import { VoidFn, _ } from './indeps-lookduck'
import { pubsubable } from './pubsubable'

interface LookableDunderMonoduck {
  isLookable: true
  isSettable: boolean
  getSubCount: () => number
  subIs: (fn: VoidFn) => boolean
  getDepCount: () => number
  depIs: (dep: Lookable<unknown>) => boolean
}
const lookableDunderMonoduckShapeHas = function (m: unknown): boolean {
  return _.plainObjectIs(m) && _.all([
    m.isLookable === true,
    typeof m.isSettable === 'boolean',
    (
      _.functionIs(m.getSubCount) &&
      m.getSubCount.length === 0 &&
      _.numberIs(m.getSubCount())
    ),
    _.functionIs(m.subIs) && m.subIs.length === 1,
    (
      _.functionIs(m.getDepCount) &&
      m.getDepCount.length === 0 &&
      _.numberIs(m.getDepCount())
    ),
    _.functionIs(m.depIs) && m.depIs.length === 1
  ])
}

interface Lookable<T> {
  get: () => T
  // Lookable subscribers should be VoidFn, not AcceptorFn like Pubsubable
  subscribe: (fn: VoidFn) => VoidFn
  unsubscribe: (fn: VoidFn) => void
  // For internal use & testing, dunder-namespaced on package name 'monoduck'
  __monoduck__: LookableDunderMonoduck
}
const lookableIs = function (x: unknown): x is Lookable<unknown> {
  if (!_.plainObjectIs(x)) { return false }
  const shapeOk = _.plainObjectIs(x) && _.all([
    _.functionIs(x.get) && x.get.length === 0,
    _.functionIs(x.subscribe) && x.subscribe.length === 1,
    _.functionIs(x.unsubscribe) && x.unsubscribe.length === 1,
    lookableDunderMonoduckShapeHas(x.__monoduck__)
  ])
  if (!shapeOk) { return false }
  const lk = x as unknown as Lookable<unknown>
  const getOk = Object.is(lk.get(), lk.get())
  if (!getOk) { throw new Error('Lookable has unstable .get() mechanics.') }
  const m = lk.__monoduck__
  const listener = (): void => {}
  const count0 = lk.__monoduck__.getSubCount()
  const doUnsub = lk.subscribe(listener)
  const subOk = _.all([
    m.getSubCount() === count0 + 1,
    m.subIs(listener),
    _.functionIs(doUnsub) && doUnsub.length === 0
  ])
  if (!subOk) { throw new Error("Lookable's `.subscribe()` is broken.") }
  doUnsub()
  const unsubOk = m.getSubCount() === count0 && !m.subIs(listener)
  if (!unsubOk) { throw new Error("Lookable's `.unsubscribe()` is broken.") }
  return true
}

const internalLookableGetterWatcher = pubsubable<Lookable<unknown>>()

// Given a lookable, infer the type of its value
type InferLookable<L extends Lookable<any>> = ReturnType<L['get']>

// A string-to-lookable mapping, loosely typed
type AnyLookableMap = Record<string, Lookable<any>>

// Given a str-to-lookable map, produces _typed_ str-to-val map
type GottenLookableMapValues<LMap extends AnyLookableMap> = {
  [K in keyof LMap]: InferLookable<LMap[K]>
}

const getEachInLookableMap = function <LMap extends AnyLookableMap>(
  lMap: LMap
): GottenLookableMapValues<LMap> {
  const vMap: Partial<GottenLookableMapValues<LMap>> = {}
  _.keys(lMap).forEach(function (key) {
    vMap[key as keyof LMap] = _.bang(lMap[key]).get()
  })
  return vMap as GottenLookableMapValues<LMap>
}

export type {
  LookableDunderMonoduck, Lookable, InferLookable,
  AnyLookableMap, GottenLookableMapValues
}
export { lookableIs, internalLookableGetterWatcher, getEachInLookableMap }
