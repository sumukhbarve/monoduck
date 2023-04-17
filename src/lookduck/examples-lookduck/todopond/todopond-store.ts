import React from 'react'
import { lookduck } from '../../index-lookduck'

export interface Todo {
  id: number
  text: string
  done: boolean
}

export const store = {
  allTodos: lookduck.observable<Todo[]>([]),
  hideDone: lookduck.observable(false),
  visibleTodos: lookduck.computed(function (): Todo[] {
    if (!store.hideDone.get()) {
      return store.allTodos.get()
    }
    return store.allTodos.get().filter(todo => !todo.done)
  })
}

export const useStore = lookduck.makeUseStore(store, React)
