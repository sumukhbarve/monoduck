import type { Reacty } from './indeps-lookduck'
import { _, injectReact } from './indeps-lookduck'
import type { AnyLookableMap, GottenLookableMapValues } from './lookable'
import { usePickLookables } from './react-hook'

type UseStoreFn<Store extends AnyLookableMap> =
  <K extends keyof Store>(...keys: K[]) => GottenLookableMapValues<Pick<Store, K>>

const makeUseStore = function <Store extends AnyLookableMap>(
  store: Store,
  React?: Reacty
): UseStoreFn<Store> {
  if (_.bool(React)) {
    injectReact(React)
  }
  const useStore = function<K extends keyof Store> (
    ...keys: K[]
  ): GottenLookableMapValues<Pick<Store, K>> {
    return usePickLookables(store, keys)
  }
  return useStore
}

export type { UseStoreFn }
export { makeUseStore }
