import express from 'express'
import cors from 'cors'
import { tapiduck, _ } from '../../../index-monoduck'
import type { Todo } from './todo-shared'
import { ept, SERVER_PORT } from './todo-shared'
import { zodToJsonSchema } from 'zod-to-json-schema'
import fs from 'fs'
import path from 'path'

const todos: Todo[] = [] // Temporary, in-memory todo store

const router = express.Router()

tapiduck.route(router, ept.addTodo, async function (reqData, jsend) {
  // for testing failures @ client
  if (reqData.text === 'no-add') {
    return jsend.fail({ message: 'cannot add no-add' })
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
  if (todo.text === 'no-toggle') {
    return jsend.fail('cannot toggle no-toggle')
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
  if (todo.text === 'no-update') {
    return jsend.fail('cannot update no-update')
  }
  todo.text = reqData.text
  return jsend.success(todo)
})

tapiduck.route(router, ept.getTodos, async function (_reqData, jsend) {
  return jsend.success(todos)
})

tapiduck.route(router, ept.clearTodos, async function (_reqData, jsend) {
  todos.splice(0, todos.length)
  return jsend.success({})
})

tapiduck.route(router, ept.divisionEndpoint, async function (reqData, jsend) {
  const { numerator, denominator } = reqData // matches zRequest
  if (denominator === 0) {
    return jsend.fail({ message: 'You cannot divide by zero' }) // matches zFail
  }
  const quotient = Math.floor(numerator / denominator)
  const remainder = numerator % denominator
  return jsend.success({ quotient, remainder }) // must zSuccess
})

const getOpenApiDefn = tapiduck.swaggerfy(router, zodToJsonSchema)
fs.writeFileSync(
  path.join(__dirname, 'todo-eg.generated.json'),
  _.pretty(getOpenApiDefn())
)

// Non-tapi block for fiddling with sync-v-async express (error) behavior
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
router.get('/foo/ok/sync', function (_req, res) {
  res.json({ foo: 'ok-sync' })
}).get('/foo/ok/async', function (_req, res) {
  void _.sleep(100).then(() => res.json({ foo: 'ok-async' }))
}).get('/foo/throw/sync', function (_req, _res) {
  throw new Error('foo-throw-sync')
}).get('/foo/throw/async', function (_req, _res, next) {
  void _.sleep(100).then(() => next(new Error('foo-throw-async')))
})
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

const app = express()
app.use(cors(), express.json(), router)
app.get('/', (_req, res) => { res.send('Hello World!') })
app.listen(SERVER_PORT, () => console.log(`Listening @ port ${SERVER_PORT}...`))
