import { _ } from './indeps-lookduck'
import { observable, shallowObservable } from './observable'

test('observable', function (): void {
  const str = observable('foo')
  expect(str.get()).toBe('foo')

  str.set('bar')
  expect(str.get()).toBe('bar')

  const vals: string[] = []
  const pushVal = function (something: string): void {
    vals.push(something)
  }
  const unsub = str.subscribe(pushVal)

  str.set('a')
  expect(vals).toEqual(['a'])
  str.set('b')
  expect(vals).toEqual(['a', 'b'])
  str.set('b') // 'b' again
  expect(vals).toEqual(['a', 'b']) // just one 'b'

  unsub()
  str.set('c')
  expect(vals).toEqual(['a', 'b']) // no 'c'
  expect(str.get()).toBe('c')

  str.subscribe(pushVal)
  str.set('d')
  expect(vals).toEqual(['a', 'b', 'd'])
  str.set('e')
  expect(vals).toEqual(['a', 'b', 'd', 'e'])

  str.unsubscribe(pushVal)
  str.set('f')
  expect(vals).toEqual(['a', 'b', 'd', 'e']) // no 'f'
  expect(str.get()).toBe('f')
})

test('observable.reset()', function () {
  const name = observable('adam')
  expect(name.get()).toBe('adam')
  name.set('brad')
  expect(name.get()).toBe('brad')
  name.reset()
  expect(name.get()).toBe('adam')
})

test('observable with deep equality only', function () {
  interface Foo {a: {b: string}}
  const foo = shallowObservable<Foo>({ a: { b: 'c' } })
  let vals: Foo[] = []
  const pushVal = function (something: Foo): void {
    vals.push(something)
  }
  const unsub = foo.subscribe(pushVal)

  foo.set(_.shallowClone(foo.get()))
  expect(vals.length).toBe(0)

  foo.set({ a: { b: 'ccc' } })
  expect(vals.length).toBe(1)
  vals = []
  expect(vals.length).toBe(0)

  foo.set({ a: foo.get().a })
  expect(vals.length).toBe(0)

  unsub()
})
