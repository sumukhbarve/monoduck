import { z } from 'zod'
import { tapiduck } from '../../index-tapiduck'
import { tapiCatch } from '../../tapiFetcher'
import type { Todo } from './todo-shared'
import { ept, SERVER_PORT } from './todo-shared'

let todos: Todo[] = []

const renderHeader = function (): string {
  return `
    <header>
      <h1>Todos</h1>
      <hr />
    </header>
  `
}

const renderTodo = function (todo: Todo, index: number): string {
  return `
    <p>
      <label style="text-decoration: ${todo.done ? 'line-through' : 'initial'}">
        <input
          type="checkbox" ${todo.done ? 'checked' : ''}
          onchange="window.toggleTodo(${todo.id}, ${index})"
        />
        ${todo.text}
      </label>
    </p>
  `
}

const renderTodos = function (): string {
  return todos.map((todo, index) => renderTodo(todo, index)).join('\n')
}

const renderTodoAdder = function (): string {
  return `
    <form onSubmit="
      event.preventDefault(); console.log(event); window.e = event;
      window.addTodo(event.target.todoText.value);
      event.target.todoText.value = '';
    ">
      <input id="todoText" name="todoText" placeholder='What needs to be done?' />
      <button>+ Add</button>
    </form>
  `
}

const renderApp = function (): void {
  const root = document.getElementById('root')
  if (root === null) { return undefined }
  root.innerHTML = `
    ${renderHeader()}
    ${renderTodos()}
    ${renderTodoAdder()}
  `
}

const tapiFetch = tapiduck.fetchUsing(`http://localhost:${SERVER_PORT}`)
const fetchTodos = async function (): Promise<void> {
  todos = await tapiFetch(ept.getTodos, {})
  renderApp()
}
const addTodo = async function (text: string): Promise<void> {
  const todo = await tapiCatch(z.string(), tapiFetch(ept.addTodo, { text }),
    (errorMsg) => {
      alert(errorMsg)
      return { id: Math.random(), text: 'errored', done: false }
    }
  )
  todos.push(todo)
  console.log(todos)
  renderApp()
  document.getElementById('todoText')?.focus()
}
const toggleTodo = async function (id: number, index: number): Promise<void> {
  const todo = await tapiCatch(z.string(), tapiFetch(ept.toggleTodo, { id }),
    (errorMsg) => {
      alert(errorMsg)
      return { id: Math.random(), text: 'errored', done: false }
    }
  )
  todos[index] = todo
  renderApp()
}

Object.assign(window, { fetchTodos, addTodo, toggleTodo })
window.onload = fetchTodos
