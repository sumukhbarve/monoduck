import fetch from 'node-fetch' // Imported for testing only, not req'd by tapiduck
import { _ } from '../../indeps-tapiduck'
import { tapiduck } from '../../index-tapiduck'
import { SERVER_PORT, ept as api } from './todo-shared'

tapiduck.injectIsomorphicFetch(fetch)
const tapiFetch = tapiduck.fetchUsing(`http://localhost:${SERVER_PORT}`)

test(api.clearTodos.path, async function () {
  const resp = await tapiFetch(api.clearTodos, {})
  expect(resp.status === 'success')
})

test(api.getTodos.path, async function () {
  // let's clear all todos
  await tapiFetch(api.clearTodos, {})
  // let's get (empty list of) todos
  let resp = await tapiFetch(api.getTodos, {})
  expect(resp.status).toBe('success')
  if (resp.status !== 'success') { throw new Error() }
  expect(resp.data).toStrictEqual([]) // Assume we're starting afresh
  // let's add some todos
  const todoTexts = ['one', 'two', 'three', 'four', 'five']
  await Promise.all(todoTexts.map(async text => await tapiFetch(api.addTodo, { text })))
  resp = await tapiFetch(api.getTodos, {})
  if (resp.status !== 'success') { throw new Error() }
  const textSet = new Set(todoTexts)
  _.each(resp.data, function (todo) {
    // set.delete() returns true only if (previously existed and) was deleted
    expect(textSet.delete(todo.text)).toBe(true)
  })
  expect(textSet.size).toBe(0)
})

test(api.addTodo.path, async function () {
  // let's add a todo
  let resp = await tapiFetch(api.addTodo, { text: 'another todo' })
  expect(resp.status).toBe('success')
  if (resp.status !== 'success') { throw new Error() }
  expect(resp.data.text).toBe('another todo')
  expect(resp.data.done).toBe(false)

  // to test failure, let's try adding a non-addable todo
  resp = await tapiFetch(api.addTodo, { text: 'no-add' })
  expect(resp.status).toBe('fail')
  if (resp.status !== 'fail') { throw new Error() }
  expect(resp.data).toStrictEqual({ message: 'cannot add no-add' })

  // let's try adding another todo
  resp = await tapiFetch(api.addTodo, { text: 'yet another todo' })
  expect(resp.status).toBe('success')
  if (resp.status !== 'success') { throw new Error() }
  expect(resp.data.text).toBe('yet another todo')
  expect(resp.data.done).toBe(false)
})

test(api.toggleTodo.path, async function () {
  // First, we add a todo, it should have {done: false}
  const addResp = await tapiFetch(api.addTodo, { text: 'toggle this' })
  expect(addResp.status).toBe('success')
  if (addResp.status !== 'success') { throw new Error() }
  const addedTodo = addResp.data
  expect(addedTodo.text).toBe('toggle this')
  expect(addedTodo.done).toBe(false)

  // Let's toggle it to {done: true}
  const toggleResp = await tapiFetch(api.toggleTodo, { id: addedTodo.id })
  expect(toggleResp.status).toBe('success')
  if (toggleResp.status !== 'success') { throw new Error() }
  const doneTodo = toggleResp.data
  expect(doneTodo).toStrictEqual({ ...addedTodo, done: _.not(addedTodo.done) })

  // Let's toggle it back to {done: false}
  const retoggleResp = await tapiFetch(api.toggleTodo, { id: addedTodo.id })
  expect(retoggleResp.status).toBe('success')
  if (retoggleResp.status !== 'success') { throw new Error() }
  const undoneTodo = retoggleResp.data
  expect(undoneTodo).toStrictEqual(addedTodo)

  // To test failure, let's try to (add and) toggle an un-toggleable todo
  const newAddResp = await tapiFetch(api.addTodo, { text: 'no-toggle' })
  expect(newAddResp.status).toBe('success')
  if (newAddResp.status !== 'success') { throw new Error() }
  const newAddedTodo = newAddResp.data
  expect(newAddedTodo.text).toBe('no-toggle')
  expect(newAddedTodo.done).toBe(false)
  const newToggleResp = await tapiFetch(api.toggleTodo, { id: newAddedTodo.id })
  expect(newToggleResp.status).toBe('fail')
  if (newToggleResp.status !== 'fail') { throw new Error() }
  expect(newToggleResp).toStrictEqual({
    status: 'fail', data: 'cannot toggle no-toggle'
  })
})

test(api.updateText.path, async function () {
  // First, we add a todo with some initial text
  const addResp = await tapiFetch(api.addTodo, { text: 'initial text' })
  expect(addResp.status).toBe('success')
  if (addResp.status !== 'success') { throw new Error() }
  const addedTodo = addResp.data
  expect(addedTodo.text).toBe('initial text')
  expect(addedTodo.done).toBe(false)

  // Let's update the text
  const updateResp = await tapiFetch(api.updateText, {
    id: addedTodo.id, text: 'updated text'
  })
  expect(updateResp.status).toBe('success')
  if (updateResp.status !== 'success') { throw new Error() }
  const updatedTodo = updateResp.data
  expect(updatedTodo).toStrictEqual({ ...addedTodo, text: 'updated text' })

  // To test failure, let's try to (add and) update an un-updatable todo
  const newAddResp = await tapiFetch(api.addTodo, { text: 'no-update' })
  expect(newAddResp.status).toBe('success')
  if (newAddResp.status !== 'success') { throw new Error() }
  const newAddedTodo = newAddResp.data
  expect(newAddedTodo.text).toBe('no-update')
  const newUpdateResp = await tapiFetch(api.updateText, {
    id: newAddedTodo.id, text: 'new text'
  })
  expect(newUpdateResp.status).toBe('fail')
  if (newUpdateResp.status !== 'fail') { throw new Error() }
  expect(newUpdateResp).toStrictEqual({
    status: 'fail', data: 'cannot update no-update'
  })
})
