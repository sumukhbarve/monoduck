import { patchduck } from './index-patchduck'

test('that patchduck.patch() deep-patches objects', function () {
  // Base object for a series of tests, without array properties.
  const harry = {
    name: { first: 'Harry', middle: 'James', last: 'Potter' },
    contact: { email: 'harry@example.com', phone: '555-555-5555' }
  }
  // Testing single partial patch:
  const lily = patchduck.patch(harry, {
    name: { first: 'Lily' },
    contact: { email: 'lily@example.com' }
  })
  expect(lily).toStrictEqual({
    name: { first: 'Lily', middle: 'James', last: 'Potter' },
    contact: { email: 'lily@example.com', phone: '555-555-5555' }
  })
  // Testing multiple, non-overwriting patches:
  const harry666 = patchduck.patch(harry,
    { contact: { phone: '666-666-6666' } },
    { contact: { email: 'harry666@example.com' } }
  )
  expect(harry666).toStrictEqual({
    name: { first: 'Harry', middle: 'James', last: 'Potter' },
    contact: { email: 'harry666@example.com', phone: '666-666-6666' }
  })
  // Testing multiple, (partially) overwriting patches:
  const marySmithJohnson = patchduck.patch(harry,
    { name: { first: 'Mary', last: 'Smith' } },
    { name: { last: 'Smith-Johnson' }, contact: { email: 'mary@example.com' } }
  )
  expect(marySmithJohnson).toStrictEqual({
    name: { first: 'Mary', middle: 'James', last: 'Smith-Johnson' },
    contact: { email: 'mary@example.com', phone: '555-555-5555' }
  })
  // Testing non-typesafe usages for pure-JS users, via `as any` to simulate:
  const harryJr = patchduck.patch(harry, { name: { suffix: 'Jr.' } } as any)
  expect(harryJr).toStrictEqual({
    name: { first: 'Harry', middle: 'James', last: 'Potter', suffix: 'Jr.' },
    contact: { email: 'harry@example.com', phone: '555-555-5555' }
  })
})

test('that patchduck.patch() replaces arrays', function () {
  // Testing objects with array properties
  const taskX = {
    title: 'Task',
    creator: 'John Doe',
    steps: [{ text: 'foo', done: false }, { text: 'bar', done: false }]
  }
  const taskXWithEmptySteps = patchduck.patch(taskX, { steps: [] })
  expect(taskXWithEmptySteps).toStrictEqual({
    title: 'Task',
    creator: 'John Doe',
    steps: []
  })
  const taskY = patchduck.patch(taskX, {
    title: 'New Task',
    steps: [{ text: 'abc', done: true }]
  })
  expect(taskY).toStrictEqual({
    title: 'New Task',
    creator: 'John Doe',
    steps: [{ text: 'abc', done: true }]
  })
  // Testing non-typesafe usages for pure-JS users, via `as any` to simulate:
  const taskJ = patchduck.patch(taskX, {
    steps: [{ text: 'the .done prop is missing here' } as any]
  })
  expect(taskJ).toStrictEqual({
    title: 'Task',
    creator: 'John Doe',
    steps: [{ text: 'the .done prop is missing here' }] // missing .done prop
  })
  const taskK = patchduck.patch(taskX, {
    extraSubtitle: 'Extra Subtitle Prop',
    steps: [{ text: 'minus .done, plus .extraStep', extraStep: 'what?' }]
  } as any)
  expect(taskK).toStrictEqual({
    title: 'Task',
    extraSubtitle: 'Extra Subtitle Prop', // extra property
    creator: 'John Doe',
    steps: [{ text: 'minus .done, plus .extraStep', extraStep: 'what?' }]
  })
})
