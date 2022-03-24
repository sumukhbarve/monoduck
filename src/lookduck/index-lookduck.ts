import { pubsubable } from './pubsubable'
import { observable } from './observable'
import { computed } from './computed'
import { makeUseLookable } from './react-hook'

export type { AcceptorFn, Pubsubable } from './pubsubable'
export type { Lookable } from './lookable'
export type { UseStateFn, UseEffectFn, UseLookableFn } from './react-hook'

export const lookduck = {
  pubsubable,
  observable,
  computed,
  makeUseLookable
}
