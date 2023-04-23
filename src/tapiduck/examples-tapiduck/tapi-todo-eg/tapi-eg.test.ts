import fetch from 'node-fetch' // Imported for testing only, not req'd by tapiduck
import { _ } from '../../indeps-tapiduck'
import { tapiduck } from '../../index-tapiduck'
import type { Todo } from './todo-shared'
import { SERVER_PORT, ept as api } from './todo-shared'

tapiduck.injectIsomorphicFetch(fetch)
const tapiFetch = tapiduck.fetchUsing(`http://localhost:${SERVER_PORT}`)
const expectStatus = tapiduck.expectStatus // local alias

// Helper for sorting todos or their texts
const sortTodos = function<T extends (Todo | string)> (tList: T[]): T[] {
  return _.sortBy(tList, t => _.stringIs(t) ? t : t.text)
}

test(api.clearTodos.path, async function () {
  const { data } = await expectStatus('success', tapiFetch(api.clearTodos, {}))
  expect(data).toStrictEqual({})
})

test(api.getTodos.path, async function () {
  // let's clear all todos, and ensure that they're cleared:
  await expectStatus('success', tapiFetch(api.clearTodos, {}))
  const { data: emptyTodos } = await expectStatus('success',
    tapiFetch(api.getTodos, {})
  )
  expect(emptyTodos).toStrictEqual([])
  // let's add some todos, then fetch 'em and double check:
  const todoTexts = sortTodos(['one', 'two', 'three', 'four', 'five'])
  const arrayOfAddResponses = await Promise.all(todoTexts.map(async function (text) {
    return await expectStatus('success', tapiFetch(api.addTodo, { text }))
  }))
  expect(arrayOfAddResponses.length).toBe(todoTexts.length)
  const addedTodos = sortTodos(arrayOfAddResponses.map(resp => resp.data))
  const addedTodoTexts = addedTodos.map(todo => todo.text)
  expect(todoTexts).toStrictEqual(addedTodoTexts)
  const { data: fetchedTodos } = (await expectStatus(
    'success', tapiFetch(api.getTodos, {})
  ))
  expect(fetchedTodos).toStrictEqual(addedTodos)
})

test(api.addTodo.path, async function () {
  // let's add a todo:
  const { data: addedTodo } = await expectStatus(
    'success', tapiFetch(api.addTodo, { text: 'another todo' })
  )
  expect(addedTodo.text).toBe('another todo')
  expect(addedTodo.done).toBe(false)

  // to test failure, let's try adding a non-addable todo:
  const { data: failData } = await expectStatus(
    'fail', tapiFetch(api.addTodo, { text: 'no-add' })
  )
  expect(failData).toStrictEqual({ message: 'cannot add no-add' })

  // let's try adding another todo:
  const { data: yetAnotherTodo } = await expectStatus(
    'success', tapiFetch(api.addTodo, { text: 'yet another todo' })
  )
  expect(yetAnotherTodo.text).toBe('yet another todo')
  expect(yetAnotherTodo.done).toBe(false)
})

test(api.toggleTodo.path, async function () {
  // first, we add a todo, it will initially be unchecked:
  const { data: addedTodo } = await expectStatus(
    'success', tapiFetch(api.addTodo, { text: 'toggle this' })
  )
  expect(addedTodo.text).toBe('toggle this')
  expect(addedTodo.done).toBe(false)

  // let's toggle it to checked:
  const { data: doneTodo } = await expectStatus(
    'success', tapiFetch(api.toggleTodo, { id: addedTodo.id })
  )
  expect(doneTodo).toStrictEqual({ ...addedTodo, done: _.not(addedTodo.done) })

  // let's toggle it back to unchecked:
  const { data: undoneTodo } = await expectStatus('success', tapiFetch(
    api.toggleTodo, { id: addedTodo.id }
  ))
  expect(undoneTodo).toStrictEqual(addedTodo)

  // to test failure, let's try to (add and) toggle an un-toggleable todo
  const { data: newAddedTodo } = await expectStatus(
    'success', tapiFetch(api.addTodo, { text: 'no-toggle' })
  )
  expect(newAddedTodo.text).toBe('no-toggle')
  expect(newAddedTodo.done).toBe(false)
  const { data: failMsg } = await expectStatus(
    'fail', tapiFetch(api.toggleTodo, { id: newAddedTodo.id })
  )
  expect(failMsg).toBe('cannot toggle no-toggle')
})

test(api.updateText.path, async function () {
  // let's add a todo with some initial text
  const { data: addedTodo } = await expectStatus(
    'success', tapiFetch(api.addTodo, { text: 'initial text' })
  )
  expect(addedTodo.text).toBe('initial text')
  expect(addedTodo.done).toBe(false)

  // let's update the text:
  const { data: updatedTodo } = await expectStatus('success', tapiFetch(
    api.updateText, { id: addedTodo.id, text: 'updated text' }
  ))
  expect(updatedTodo).toStrictEqual({ ...addedTodo, text: 'updated text' })

  // to test failure, let's try to (add and) update an un-updatable todo
  const { data: newAddedTodo } = await expectStatus(
    'success', tapiFetch(api.addTodo, { text: 'no-update' })
  )
  expect(newAddedTodo.text).toBe('no-update')
  const { data: failMsg } = await expectStatus('fail', tapiFetch(
    api.updateText, { id: newAddedTodo.id, text: 'new text' }
  ))
  expect(failMsg).toBe('cannot update no-update')
})
