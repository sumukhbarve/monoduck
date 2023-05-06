import { lookduck } from '../../../index-monoduck'

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
  }),
  newTodoText: lookduck.observable('')
}

const logsnap = function (): void {
  console.log(JSON.stringify(lookduck.storeSnapshot(store), null, 4))
}
// Object.values(store).forEach(lookable => lookable.subscribe(logsnap))
Object.assign(window, { logsnap })
