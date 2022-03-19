import {
  pubsubable,
  observable,
  computed,
  makeUseLookable
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
  AcceptorFn, Pubsubable, Lookable,
  UseStateFn, UseEffectFn, UseLookableFn
} from './lookduck/index-lookduck'
export const lookduck = {
  pubsubable,
  observable,
  computed,
  makeUseLookable
}
export {
  pubsubable,
  observable,
  computed,
  makeUseLookable
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
