import { injectReact } from './indeps-lookduck'
import { pubsubable } from './pubsubable'
import { lookableIs } from './lookable'
import { observable, observableIs } from './observable'
import { observableIdMap } from './observableIdMap'
import { computed, computedIs } from './computed'
import {
  useLookables, usePickLookables, useLookable, makeUseLookable
} from './react-hook'
import {
  atom, getAtomValue, makeAtomSetter, atomPair, useAtomValue, useAtom
} from './atom'
import { makeUseStore } from './store'

export type { AcceptorFn, Pubsubable } from './pubsubable'
export type {
  Lookable, InferLookable, AnyLookableMap as LookduckStore
} from './lookable'
export type { Observable } from './observable'
export type { Computed } from './computed'
export type { Idful, IdMap, ObservableIdMap } from './observableIdMap'

export const lookduck = {
  injectReact,
  // foundation:
  pubsubable,
  lookableIs,
  // observable:
  observable,
  observableIs,
  observableIdMap,
  // computed:
  computed,
  computedIs,
  // (non-atom) hooks:
  useLookables,
  usePickLookables,
  useLookable,
  makeUseLookable,
  makeUseStore,
  // atom core:
  atom,
  getAtomValue,
  makeAtomSetter,
  atomPair,
  // atom hooks:
  useAtomValue,
  useAtom
}
