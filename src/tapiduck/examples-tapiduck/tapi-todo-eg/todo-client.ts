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
    window.alert(tapiduck.failMsg(resp, data => data))
    todos = []
  } else {
    todos = resp.data
  }
  renderApp()
}
const addTodo = async function (text: string): Promise<void> {
  const resp = await tapiFetch(ept.addTodo, { text })
  if (resp.status !== 'success') {
    return window.alert(tapiduck.failMsg(resp, data => data.message))
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
    window.alert(tapiduck.failMsg(resp, data => data))
    renderApp() // Re-rendering to remove stale/tmp checkmark in checkbox
    return undefined
  }
  const todo = resp.data
  todos[index] = todo
  renderApp()
}

// README quickstart example, avoid using tapiduck.failMsg() here.
const performDivision = async function (): Promise<void> {
  const numerator = Number(window.prompt('Numerator: ', '1'))
  const denominator = Number(window.prompt('Denominator: ', '1'))
  const resp = await tapiFetch(ept.divisionEndpoint, { numerator, denominator })
  if (resp.status !== 'success') {
    // failMsg() is a util for handling non-success responses
    return window.alert(tapiduck.failMsg(resp, data => data.message))
    //                                         ^^^^ matches zFail
  }
  const { quotient, remainder } = resp.data // matches zSuccess
  window.alert(`Quotient: ${quotient}; Remainder: ${remainder}`)
}

Object.assign(window, { fetchTodos, addTodo, toggleTodo, performDivision })
window.onload = async () => await fetchTodos()// .then(() => performDivision())
