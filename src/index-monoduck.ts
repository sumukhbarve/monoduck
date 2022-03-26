export const quack = function (): string {
  return 'Quack!'
}

export type {
  AcceptorFn, Pubsubable, Lookable, UseStateFn, UseEffectFn, UseLookableFn
} from './lookduck/index-lookduck'
export { lookduck } from './lookduck/index-lookduck'

export type {
  TapiEndpoint, BoundRouteFn, BoundFetchFn
} from './tapiduck/index-tapiduck'
export { tapiduck, TapiError } from './tapiduck/index-tapiduck'

export { _ } from './utilduck/index-utilduck'
