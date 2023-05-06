import type { TappableHtml } from '../../../index-monoduck'
import { rainduck, _ } from '../../../index-monoduck'
import { Todo, store } from './rain-todo-eg-store'

const { html, onClick, onChange, onSubmit, onInput } = rainduck

const checked = function (isChecked: boolean): string {
  return isChecked ? 'checked' : ''
}
const $val = function (selector: string): string | undefined {
  const elOrNull = document.querySelector(selector)
  if (elOrNull === null) { return undefined }
  const el = elOrNull as {value?: unknown}
  if (typeof el.value !== 'string') { return undefined }
  return el.value
}
_.noop($val)

const headerFC = function (): TappableHtml {
  const hideDone = store.hideDone.get()
  const onToggle = (): void => store.hideDone.set(!store.hideDone.get())
  return (html`
    <header>
      <h1>Todos</h1>
      <label>
        <input type='checkbox' ${checked(hideDone)} ${onChange(onToggle)} />
        Hide Done Todos
      </label>
      <hr />
    </header>
  `)
}

const singleTodoFC = function ({ todo }: {todo: Todo}): TappableHtml {
  const currentId = todo.id
  const onToggle = function (): void {
    store.allTodos.set(store.allTodos.get().map(
      (todo) => todo.id === currentId ? { ...todo, done: !todo.done } : todo
    ))
  }
  const onRemove = function (event: MouseEvent): void {
    console.log(event, { cTgt: event.currentTarget, tgt: event.target })
    store.allTodos.set(store.allTodos.get().filter(
      (todo) => todo.id !== currentId
    ))
  }
  return (html`
    <p>
      <label style="textDecoration: ${todo.done ? 'line-through' : 'initial'}">
        <input type='checkbox' ${checked(todo.done)} ${onChange(onToggle)} />
        ${todo.text}
      </label>
      <span style="cursor: pointer; paddingLeft: 1rem;" ${onClick(onRemove)}>
        (x <del>delete</del> me x)
      </span>
    </p>
  `)
}

const todoListFC = function (): TappableHtml {
  return (html`
    <div>
      ${store.visibleTodos.get().map(todo => singleTodoFC({ todo }))}
    </div>
  `)
}

const todoAdderFC = function (): TappableHtml {
  const onTextChange = function (event: Event): void {
    console.log('todoAdder input event', { cTgt: event.currentTarget, tgt: event.target })
    store.newTodoText.set((event.target as any).value)
  }
  const onAdd = function (event: SubmitEvent): void {
    console.log('la la la entered callback')
    event.preventDefault()
    // const text = $val('#add-todo-text')
    const text = store.newTodoText.get()
    console.log('text', text)
    if (_.bool(text)) {
      const newTodo: Todo = { id: Date.now(), text: text, done: false }
      console.log('newTodo', newTodo)
      store.allTodos.set([...store.allTodos.get(), newTodo])
      store.newTodoText.set('')
    } else {
      console.log('text is empty, skipping.')
    }
  }
  return (html`
    <form ${onSubmit(onAdd)}>
      <input
        id='add-todo-text'
        value="${store.newTodoText.get()}"
        placeholder='What needs to be done?'
        ${onInput(onTextChange)}
      />
      <button>+ Add Todo</button> ${store.newTodoText.get()}
    </form>
  `)
}

const footerFC = function (): TappableHtml {
  const clearAll = function (): void {
    store.allTodos.set([])
  }
  return (html`
    <footer>
      <hr />
      <button ${onClick(clearAll)}>Clear all</button>
    </footer>
  `)
}

const todoAppFC = function (): TappableHtml {
  return (html`
      ${headerFC()}
      ${todoListFC()}
      ${todoAdderFC()}
      ${footerFC()}
  `)
}

const rootElement = _.bang(document.querySelector('#root') ?? undefined)
rainduck.render(todoAppFC, rootElement)
