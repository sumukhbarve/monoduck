import React from 'react'
import { lookduck } from '../../index-lookduck'

const MIN_EXPECTED_DUCK_COUNT = 5

export const store = {
  duckCount: lookduck.observable(0),
  duckNoun: lookduck.computed(function (): string {
    return store.duckCount.get() === 1 ? 'duck' : 'ducks'
  }),
  isTooLow: lookduck.computed(function (): boolean {
    return store.duckCount.get() < MIN_EXPECTED_DUCK_COUNT
  })
}

export const useStore = lookduck.makeUseStore(store, React)
