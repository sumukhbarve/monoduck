import type { Pubsubable } from './pubsubable'
import { pubsubable } from './pubsubable'

type Lookable<T> = Omit<Pubsubable<T>, 'publish'> & {
  get: () => T
}

const internalLookableGetterWatcher = pubsubable<Lookable<unknown>>()

export type { Lookable }
export { internalLookableGetterWatcher }
