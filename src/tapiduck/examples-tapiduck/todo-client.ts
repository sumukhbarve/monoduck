import { tapiduck } from '../index-tapiduck'
import type { Todo } from './todo-shared'
import { ept } from './todo-shared'

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

const tapiFetch = tapiduck.fetchUsing('http://localhost:3000')
const fetchTodos = async function (): Promise<void> {
  todos = await tapiFetch(ept.getTodos, {})
  renderApp()
}
const addTodo = async function (text: string): Promise<void> {
  const todo = await tapiFetch(ept.addTodo, { text })
  todos.push(todo)
  renderApp()
  document.getElementById('todoText')?.focus()
}
const toggleTodo = async function (id: number, index: number): Promise<void> {
  const todo = await tapiFetch(ept.toggleTodo, { id })
  todos[index] = todo
  renderApp()
}

Object.assign(window, { fetchTodos, addTodo, toggleTodo })
window.onload = fetchTodos
