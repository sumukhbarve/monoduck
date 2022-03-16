import { observable } from './observable'

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
