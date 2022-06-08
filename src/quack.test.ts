import * as monoduck from './index-monoduck'

test('monoduck.quack', function () {
  expect(monoduck.quack()).toBe('Quack!')
})

// The above import and test ensure that monoduck can be imported w/o errors.
// This is relevant for node.js compat, where the globalThis is not window.
