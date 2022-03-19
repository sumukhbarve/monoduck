import express from 'express'
import cors from 'cors'
import { tapiRouter, TapiError } from '../index-tapiduck'
import type { Todo } from './todo-shared'
import { ept } from './todo-shared'

const todos: Todo[] = [] // Temporary, in-memory todo store

const router = tapiRouter()

router.addRoute(ept.addTodo, async function (reqData) {
  const todo = {
    id: Date.now() + Math.random(),
    text: reqData.text,
    done: false
  }
  todos.push(todo)
  return todo
})

router.addRoute(ept.toggleTodo, async function (reqData) {
  const todoIndex = todos.findIndex(todo => todo.id === reqData.id)
  if (todoIndex === -1) {
    throw new TapiError('No such todo.')
  }
  todos[todoIndex].done = !todos[todoIndex].done
  return todos[todoIndex]
})

router.addRoute(ept.updateText, async function (reqData) {
  const todoIndex = todos.findIndex(todo => todo.id === reqData.id)
  if (todoIndex === -1) {
    throw new TapiError('No such todo.')
  }
  todos[todoIndex].text = reqData.text
  return todos[todoIndex]
})

router.addRoute(ept.getTodos, async function () {
  return todos
})

const app = express()
app.use(cors())
app.use(router.middleware())
app.get('/', (req, res) => { res.send('Hello World!') })
app.listen(3000, () => console.log('Listening at port 3000 ...'))
