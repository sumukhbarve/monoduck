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
interface AnyLookableMap {
  [k: string]: Lookable<any>
}
// Given a str-to-lookable map, produces _typed_ str-to-val map
type GottenLookableValueMap<LMap extends AnyLookableMap> = {
  [K in keyof LMap]: InferLookable<LMap[K]>
}

const getLookables = function <LMap extends AnyLookableMap>(
  lMap: LMap
): GottenLookableValueMap<LMap> {
  const vMap: Partial<GottenLookableValueMap<LMap>> = {}
  _.keys(lMap).forEach(function (key) {
    vMap[key as keyof LMap] = _.bang(lMap[key]).get()
  })
  return vMap as GottenLookableValueMap<LMap>
}

export type { Lookable, InferLookable, AnyLookableMap, GottenLookableValueMap }
export { internalLookableGetterWatcher, getLookables }
