import express from 'express'
import cors from 'cors'
import { tapiduck, TapiError } from '../../index-tapiduck'
import type { Todo } from './todo-shared'
import { ept, SERVER_PORT } from './todo-shared'

const todos: Todo[] = [] // Temporary, in-memory todo store

const router = express.Router()

tapiduck.route(router, ept.addTodo, async function (reqData) {
  if (reqData.text === 'aaa') {
    // for testing tapCatch @ client
    throw new TapiError('aaa not allowed')
  }
  const todo = {
    id: Date.now() + Math.random(),
    text: reqData.text,
    done: false
  }
  todos.push(todo)
  // for testing, should cause down-the-line errors on the client
  return { ...todo, id: 123 }
})

tapiduck.route(router, ept.toggleTodo, async function (reqData) {
  const todoIndex = todos.findIndex(todo => todo.id === reqData.id)
  const todo = todos[todoIndex]
  if (todoIndex === -1 || todo === undefined) {
    throw new TapiError('No such todo.')
  }
  todo.done = !todo.done
  return todo
})

tapiduck.route(router, ept.updateText, async function (reqData) {
  const todoIndex = todos.findIndex(todo => todo.id === reqData.id)
  const todo = todos[todoIndex]
  if (todoIndex === -1 || todo === undefined) {
    throw new TapiError('No such todo.')
  }
  todo.text = reqData.text
  return todo
})

tapiduck.route(router, ept.getTodos, async function () {
  return todos
})

const app = express()
app.use(cors(), express.json(), router)
app.get('/', (_req, res) => { res.send('Hello World!') })
app.listen(SERVER_PORT, () => console.log(`Listening @ port ${SERVER_PORT}...`))
