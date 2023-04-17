import React from 'react'
import { Todo, store, useStore } from './todopond-store'
import ReactDOM from 'react-dom'

const Header: React.VFC = function () {
  const { hideDone } = useStore('hideDone')
  const onToggle = React.useCallback(() => store.hideDone.set(!hideDone), [hideDone])
  return (
    <header>
      <h1>Todos</h1>
      <label>
        <input type='checkbox' checked={hideDone} onChange={onToggle} />
        Hide Done Todos
      </label>
      <hr />
    </header>
  )
}

const SingleTodo: React.VFC<{todo: Todo}> = function ({ todo }) {
  const currentId = todo.id
  const onToggle = React.useCallback(function () {
    store.allTodos.set(store.allTodos.get().map(
      (todo) => todo.id === currentId ? { ...todo, done: !todo.done } : todo
    ))
  }, [currentId])
  return (
    <p>
      <label style={{ textDecoration: todo.done ? 'line-through' : 'initial' }}>
        <input type='checkbox' checked={todo.done} onChange={onToggle} />
        {todo.text}
      </label>
    </p>
  )
}

const TodoList: React.VFC = function () {
  const { visibleTodos } = useStore('visibleTodos')
  return (
    <div>
      {visibleTodos.map(todo => (<SingleTodo todo={todo} key={todo.id} />))}
    </div>
  )
}

const TodoAdder: React.VFC = function () {
  const [text, setText] = React.useState('')
  const onAdd = React.useCallback(function (event: React.FormEvent) {
    event.preventDefault()
    if (text !== '') {
      const newTodo: Todo = { id: Date.now(), text: text, done: false }
      store.allTodos.set([...store.allTodos.get(), newTodo])
      setText('')
    }
  }, [text])
  return (
    <form onSubmit={onAdd}>
      <input
        value={text}
        placeholder='What needs to be done?'
        onChange={event => setText(event.target.value)}
      />
      <button>+ Add Todo</button>
    </form>
  )
}

const TodoApp: React.VFC = function () {
  return (
    <>
      <Header />
      <TodoList />
      <TodoAdder />
    </>
  )
}

ReactDOM.render(<TodoApp />, document.querySelector('#root'))
