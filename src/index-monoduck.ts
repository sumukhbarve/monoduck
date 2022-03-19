import {
  pubsubable,
  observable,
  computed,
  useLookable
} from './lookduck/index-lookduck'

import {
  tapiEndpoint,
  TapiError,
  addTapiRoute,
  tapiRouter,
  hitTapiRoute,
  tapiFetcher
} from './tapiduck/index-tapiduck'

// quack:
export const quack = function (): string {
  return 'Quack!'
}

// lookduck:
export type {
  AcceptorFn, Pubsubable, Lookable
} from './lookduck/index-lookduck'
export const lookduck = {
  pubsubable,
  observable,
  computed,
  useLookable
}
export {
  pubsubable,
  observable,
  computed,
  useLookable
}

// tapiduck:
export type {
  TapiEndpoint, TapiRouter, TapiFetcher
} from './tapiduck/index-tapiduck'
export const tapiduck = {
  tapiEndpoint,
  TapiError,
  addTapiRoute,
  tapiRouter,
  hitTapiRoute,
  tapiFetcher
}
export {
  tapiEndpoint,
  TapiError,
  addTapiRoute,
  tapiRouter,
  hitTapiRoute,
  tapiFetcher
}
