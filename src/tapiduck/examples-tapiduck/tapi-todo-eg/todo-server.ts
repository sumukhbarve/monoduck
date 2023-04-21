import express from 'express'
import cors from 'cors'
import { tapiduck } from '../../index-tapiduck'
import type { Todo } from './todo-shared'
import { ept, SERVER_PORT } from './todo-shared'

const todos: Todo[] = [] // Temporary, in-memory todo store

const router = express.Router()

// import { _ } from '../../indeps-tapiduck'
// router.get('/foo/ok/sync', function (_req, res) {
//   res.json({ foo: 'ok-sync' })
// })
// router.get('/foo/ok/async', async function (_req, res) {
//   await _.sleep(100)
//   res.json({ foo: 'ok-async' })
// })
// router.get('/foo/throw/sync', function (_req, res) {
//   throw new Error('foo-throw-sync')
// })
// router.get('/foo/throw/async', async function (_req, res, next) {
//   await _.sleep(100)
//   next()
//   next(new Error('foo-throw-async'))
// })

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

const app = express()
app.use(cors(), express.json(), router)
app.get('/', (_req, res) => { res.send('Hello World!') })
app.listen(SERVER_PORT, () => console.log(`Listening @ port ${SERVER_PORT}...`))
