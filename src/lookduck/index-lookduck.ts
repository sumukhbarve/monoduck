import { injectReact } from './indeps-lookduck'
import { pubsubable } from './pubsubable'
import { observable } from './observable'
import { computed } from './computed'
import {
  useSingleLookable, usePickLookables, useLookables,
  useLookable, makeUseLookable // <-- deprecated
} from './react-hook'
import { observableIdMap } from './observableIdMap'

export type { AcceptorFn, Pubsubable } from './pubsubable'
export type { Lookable, InferLookable } from './lookable'
export type { Observable } from './observable'
export type { Idful, IdMap, ObservableIdMap } from './observableIdMap'

export const lookduck = {
  injectReact,
  pubsubable,
  observable,
  computed,
  useSingleLookable,
  usePickLookables,
  useLookables,
  useLookable,
  makeUseLookable,
  observableIdMap
}
