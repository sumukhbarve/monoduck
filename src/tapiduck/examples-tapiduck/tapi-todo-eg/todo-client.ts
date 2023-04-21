import { tapiduck } from '../../index-tapiduck'
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
  const resp = await tapiFetch(ept.getTodos, {})
  if (resp.status !== 'success') {
    alert('failed to load todos')
    todos = []
  } else {
    todos = resp.data
  }
  renderApp()
}
const addTodo = async function (text: string): Promise<void> {
  const resp = await tapiFetch(ept.addTodo, { text })
  if (resp.status !== 'success') {
    alert(resp.status === 'fail' ? resp.data.message : resp.message ?? 'unknown err')
    return undefined
  }
  const todo = resp.data
  todos.push(todo)
  console.log(todos)
  renderApp()
  document.getElementById('todoText')?.focus()
}
const toggleTodo = async function (id: number, index: number): Promise<void> {
  const resp = await tapiFetch(ept.toggleTodo, { id })
  if (resp.status !== 'success') {
    alert(resp.status === 'fail' ? resp.data : resp.message ?? 'unknown error')
    renderApp() // Re-rendering to remove stale/tmp checkmark in checkbox
    return undefined
  }
  const todo = resp.data
  todos[index] = todo
  renderApp()
}

const performDivision = async function (): Promise<void> {
  const numerator = Number(window.prompt('Numerator: ', '1'))
  const denominator = Number(window.prompt('Denominator: ', '1'))
  const resp = await tapiFetch(ept.divisionEndpoint, { numerator, denominator })
  if (resp.status !== 'success') {
    window.alert(resp.status === 'fail' ? resp.data.message : 'Unknown error')
    return
  }
  // Here, typeof resp.data is { quotient: number, remainder: number }
  // And your IDE will know this, so you'll get proper hinting!
  const { quotient, remainder } = resp.data
  window.alert(`Quotient: ${quotient}; Remainder: ${remainder}`)
}

Object.assign(window, { fetchTodos, addTodo, toggleTodo, performDivision })
window.onload = async function () {
  await performDivision()
  await fetchTodos()
}
