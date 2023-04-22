import express from 'express'
import cors from 'cors'
import { tapiduck } from '../../index-tapiduck'
import type { Todo } from './todo-shared'
import { ept, SERVER_PORT } from './todo-shared'
import { _ } from '../../indeps-tapiduck'

const todos: Todo[] = [] // Temporary, in-memory todo store

const router = express.Router()

tapiduck.route(router, ept.addTodo, async function (reqData, jsend) {
  // for testing tapCatch @ client
  if (reqData.text === 'aaa') {
    return jsend.fail({ message: 'aaa not allowed' })
  }
  const todo = {
    id: Date.now() + Math.random(),
    text: reqData.text,
    done: false
  }
  todos.push(todo)
  // return { ...todo, id: 123 } for testing down-the-line errors @ client
  return jsend.success(todo)
})

tapiduck.route(router, ept.toggleTodo, async function (reqData, jsend) {
  const todoIndex = todos.findIndex(todo => todo.id === reqData.id)
  const todo = todos[todoIndex]
  if (todoIndex === -1 || todo === undefined) {
    return jsend.fail('toggle failed, no such todo')
  }
  if (todoIndex % 2 === 0) {
    return jsend.fail('sample-error: cannot toggle todo with an even .id')
  }
  todo.done = !todo.done
  return jsend.success(todo)
})

tapiduck.route(router, ept.updateText, async function (reqData, jsend) {
  const todoIndex = todos.findIndex(todo => todo.id === reqData.id)
  const todo = todos[todoIndex]
  if (todoIndex === -1 || todo === undefined) {
    return jsend.fail('update failed, no such todo.')
  }
  todo.text = reqData.text
  return jsend.success(todo)
})

tapiduck.route(router, ept.getTodos, async function (_reqData, jsend) {
  return jsend.success(todos)
})

tapiduck.route(router, ept.divisionEndpoint, async function (reqData, jsend) {
  console.log(reqData)
  if (reqData.denominator === 0) {
    return jsend.fail({ message: 'You cannot divide by zero' })
  }
  const quotient = Math.floor(reqData.numerator / reqData.denominator)
  const remainder = reqData.numerator % reqData.denominator
  return jsend.success({ quotient, remainder })
})

// Non-tapi block for fiddling with sync-v-async express (error) behavior
router.get('/foo/ok/sync', function (_req, res) {
  res.json({ foo: 'ok-sync' })
}).get('/foo/ok/async', function (_req, res) {
  void _.sleep(100).then(() => res.json({ foo: 'ok-async' }))
}).get('/foo/throw/sync', function (_req, _res) {
  throw new Error('foo-throw-sync')
}).get('/foo/throw/async', function (_req, _res, next) {
  void _.sleep(100).then(() => next(new Error('foo-throw-async')))
})

const app = express()
app.use(cors(), express.json(), router)
app.get('/', (_req, res) => { res.send('Hello World!') })
app.listen(SERVER_PORT, () => console.log(`Listening @ port ${SERVER_PORT}...`))
