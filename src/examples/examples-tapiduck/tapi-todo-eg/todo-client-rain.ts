import { tapiduck, rainduck, lookduck, _ } from '../../../index-monoduck'
import type { Todo } from './todo-shared'
import { ept, SERVER_PORT } from './todo-shared'

const tapiFetch = tapiduck.fetchUsing(`http://localhost:${SERVER_PORT}`)

const { html, component, onChange, onSubmit, onClick } = rainduck

const $val = function (selector: string): string | undefined {
  const elOrNull = document.querySelector(selector)
  if (elOrNull === null) { return undefined }
  const el = elOrNull as {value?: unknown}
  if (typeof el.value !== 'string') { return undefined }
  return el.value
}

const todos = lookduck.observable<Todo[]>([])
todos.subscribe(function () {
  console.log(todos.get())
})

const headerFC = component(function () {
  return html`
    <header>
      <h2>Todos <small>(Tapi+Rainduck)</small></h2>
      <hr />
    </header>
  `
})

const todoFC = component<{todo: Todo}>(function (props) {
  const { todo } = props
  const toggleTodo = async function (): Promise<void> {
    const resp = await tapiFetch(ept.toggleTodo, { id: todo.id })
    if (resp.status !== 'success') {
      const oldTodos = todos.get()
      todos.set([]) // helps force UX update. TODO: Investigate
      todos.set(oldTodos)
      return window.alert(tapiduck.failMsg(resp, data => data))
    }
    const newTodo = resp.data
    todos.set(todos.get().map(t => t.id === newTodo.id ? newTodo : t))
  }
  return html`
    <p>
      <label style="text-decoration: ${todo.done ? 'line-through' : 'initial'}">
        <input
          type="checkbox" ${todo.done ? 'checked' : ''}
          ${onChange(() => { void toggleTodo() })}
        />
        ${todo.text}
      </label>
    </p>
  `
})

const todoListFC = component(function () {
  const fetchTodos = async function (): Promise<void> {
    if (todos.get().length > 0) { return undefined }
    const resp = await tapiFetch(ept.getTodos, {})
    if (resp.status !== 'success') {
      return window.alert(tapiduck.failMsg(resp, data => data))
    }
    if (resp.data.length > 0) {
      todos.set(resp.data)
    }
  }
  if (todos.get().length === 0) {
    void fetchTodos()
  }
  return html`${todos.get().map(todo => todoFC({ todo }))}`
})

const todoAdderFC = component(function () {
  const addTodo = async function (text: string): Promise<void> {
    const resp = await tapiFetch(ept.addTodo, { text })
    if (resp.status !== 'success') {
      return window.alert(tapiduck.failMsg(resp, data => data.message))
    }
    const todo = resp.data
    todos.set([...todos.get(), todo])
  }
  const onAddTodo = function (event: SubmitEvent): void {
    event.preventDefault()
    void addTodo(_.bang($val('#todoText')))
  }
  return html`
    <form ${onSubmit(onAddTodo)}>
      <input id="todoText" name="todoText" placeholder='What needs to be done?' />
      <button>+ Add</button>
    </form>
  `
})

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

const appFC = component(function () {
  return html`
    ${headerFC()}
    ${todoListFC()}
    ${todoAdderFC()}

    <hr />
    <button ${onClick(() => { void performDivision() })}>perform division</button>
  `
})

rainduck.render(appFC, _.bang(document.getElementById('root') ?? undefined))
