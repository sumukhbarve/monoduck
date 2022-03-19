import { observable, computed } from '../index-lookduck'

export interface Todo {
  id: number
  text: string
  done: boolean
}

export const obAllTodos = observable<Todo[]>([])
export const obShowDone = observable(true)
export const coShownTodos = computed(function (): Todo[] {
  if (obShowDone.get()) {
    return obAllTodos.get()
  }
  return obAllTodos.get().filter(todo => !todo.done)
})

export const actAddTodo = function (todo: Todo): void {
  obAllTodos.set([...obAllTodos.get(), todo])
}
export const actToggleDone = function (todoId: number): void {
  obAllTodos.set(obAllTodos.get().map(function (todo) {
    return todo.id !== todoId ? todo : { ...todo, done: !todo.done }
  }))
}
export const actToggleShowDone = function (): void {
  obShowDone.set(!obShowDone.get())
}
