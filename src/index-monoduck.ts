export const quack = function (): string {
  return 'Quack!'
}

export type {
  AcceptorFn, Pubsubable, Lookable, ReactyLooky, UseLookableFn
} from './lookduck/index-lookduck'
export { lookduck } from './lookduck/index-lookduck'

export type { TapiEndpoint, TapiSockpoint } from './tapiduck/index-tapiduck'
export { tapiduck, TapiError } from './tapiduck/index-tapiduck'

export type { NoInfer, AnyFn, SameFn } from './utilduck/index-utilduck'
export { _ } from './utilduck/index-utilduck'

export type { DuckModel, ModelFactory } from './sqlduck/index-sqlduck'
export { sqlduck } from './sqlduck/index-sqlduck'

export type { RouteInfo } from './roqsduck/index-roqsduck'
export { roqsduck } from './roqsduck/index-roqsduck'
