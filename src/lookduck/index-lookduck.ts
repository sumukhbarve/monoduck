import { pubsubable } from './pubsubable'
import { observable } from './observable'
import { computed } from './computed'
import { makeUseLookable, injectReact } from './react-hook'
import { observableIdMap } from './observableIdMap'

export type { AcceptorFn, Pubsubable } from './pubsubable'
export type { Lookable, InferLookable } from './lookable'
export type { Observable } from './observable'
export type { ReactyLooky, UseLookableFn, UseLookablezOpt } from './react-hook'
export type { Idful, IdMap, ObservableIdMap } from './observableIdMap'

export const lookduck = {
  pubsubable,
  observable,
  computed,
  makeUseLookable,
  observableIdMap,
  injectReact
}
