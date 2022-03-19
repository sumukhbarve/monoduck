import React, { useCallback, useState } from 'react'
import type { VFC, FormEvent } from 'react'
import ReactDOM from 'react-dom'
import {
  actAddTodo, Todo,
  obShowDone, coShownTodos, actToggleDone, actToggleShowDone,
  useLookable
} from './todo-store'

const Header: VFC = function () {
  const showDone = useLookable(obShowDone)
  return (
    <header>
      <h1>Todos</h1>
      <div>
        <label>
          <input type='checkbox' checked={!showDone} onChange={() => actToggleShowDone()} />
          Hide Completed
        </label>
      </div>
      <hr />
    </header>
  )
}

const SingleTodo: VFC<{todo: Todo}> = function ({ todo }) {
  return (
    <p>
      <label style={{ textDecoration: todo.done ? 'line-through' : 'initial' }}>
        <input type='checkbox' checked={todo.done} onChange={() => actToggleDone(todo.id)} />
        {todo.text}
      </label>
    </p>
  )
}

const TodoList: VFC = function () {
  const todos = useLookable(coShownTodos)
  return (
    <div>
      {todos.map(todo => (<SingleTodo todo={todo} key={todo.id} />))}
    </div>
  )
}

const TodoAdder: VFC = function () {
  const [text, setText] = useState('')
  const onAdd = useCallback(function (evt: FormEvent) {
    evt.preventDefault()
    if (text !== '') {
      actAddTodo({ id: Date.now(), text: text, done: false })
      setText('')
    }
  }, [text])
  return (
    <form onSubmit={onAdd}>
      <input value={text} placeholder='What needs to be done?' onChange={evt => setText(evt.target.value)} />
      <button>+ Add</button>
    </form>
  )
}

const TodoApp: VFC = function () {
  return (
    <div>
      <Header />
      <TodoList />
      <TodoAdder />
    </div>
  )
}

ReactDOM.render(<TodoApp />, document.querySelector('#root'))
