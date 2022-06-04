import express from 'express'
import cors from 'cors'
import { tapiduck, TapiError } from '../index-tapiduck'
import type { Todo } from './todo-shared'
import { ept } from './todo-shared'

const todos: Todo[] = [] // Temporary, in-memory todo store

const router = express.Router()

tapiduck.route(router, ept.addTodo, async function (reqData) {
  const todo = {
    id: Date.now() + Math.random(),
    text: reqData.text,
    done: false
  }
  todos.push(todo)
  return todo
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
app.listen(3000, () => console.log('Listening at port 3000 ...'))
