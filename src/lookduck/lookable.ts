import { _ } from './indeps-lookduck'
import type { Pubsubable } from './pubsubable'
import { pubsubable } from './pubsubable'

type Lookable<T> = Omit<Pubsubable<T>, 'publish'> & {
  get: () => T
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

export type { Lookable, InferLookable, AnyLookableMap, GottenLookableMapValues }
export { internalLookableGetterWatcher, getEachInLookableMap }
