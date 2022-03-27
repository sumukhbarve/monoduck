import { _ } from './index-utilduck'

interface RunCounter {
  fn: (...args: unknown[]) => unknown
  getCount: () => number
  resetCount: () => void
}
const buildRunCounter = function (fn: Function = _.identity): RunCounter {
  let count = 0
  const newFn = function (...args: unknown[]): unknown {
    count += 1
    return fn(...args)
  }
  return { fn: newFn, getCount: () => count, resetCount: () => { count = 0 } }
}

test('_.identity', function () {
  expect(_.identity(123)).toBe(123)
  const tmpObjRef = { foo: 'bar' }
  expect(_.identity(tmpObjRef)).toBe(tmpObjRef)
})

test('_.each without _.BREAK', function () {
  const runCounter = buildRunCounter()
  _.each([1, 2, 3, 4, 5], runCounter.fn)
  expect(runCounter.getCount()).toBe(5)
})

test('_.each with _.BREAK', function () {
  const runCounter = buildRunCounter((v: number) => v === 3 ? _.BREAK : 'foo')
  _.each([1, 2, 3, 4, 5], runCounter.fn)
  expect(runCounter.getCount()).toBe(3)
})

test('_.map', function () {
  expect(_.map([1, 2, 3], x => 2 * x)).toEqual([2, 4, 6])
})

test('_.filter', function () {
  // With explicit filtering fn:
  expect(_.filter([1, 2, 3, 4], x => x % 2 === 0)).toEqual([2, 4])
  // With default (bool) filtering:
  expect(_.filter([0, 1, null, {}, false, 'foo'])).toEqual([1, {}, 'foo'])
})

test('_.reduce', function () {
  expect(_.reduce([1, 2, 3, 4], (acc, val) => acc + val, 0)).toBe(10)
  expect(_.reduce([1, 2, 3, 4], (acc, val) => acc * val, 1)).toBe(24)
  const blankAcc: Record<string, unknown> = {}
  expect(_.reduce(
    [{ foo: 1 }, { bar: 2 }, { baz: 3 }],
    (acc, val) => ({ ...acc, ...val }),
    blankAcc
  )).toEqual({ foo: 1, bar: 2, baz: 3 })
  expect(blankAcc).toEqual({})
})

test('_.all', function () {
  expect(_.all([1, 2, 3, true, {}, [], 'foo'])).toBe(true)
  expect(_.all([1, 0, 3])).toBe(false)

  const runCounter = buildRunCounter(_.bool)
  expect(_.all([1, 2, 3, 4, 5], runCounter.fn)).toBe(true)
  expect(runCounter.getCount()).toBe(5)

  runCounter.resetCount()
  expect(_.all([1, 2, 0, 4, 5], runCounter.fn)).toBe(false)
  expect(runCounter.getCount()).toBe(3)
})

test('_.any', function () {
  expect(_.any([0, '', null, false])).toBe(false)
  expect(_.any([0, 1, 0])).toBe(true)

  const runCounter = buildRunCounter(_.bool)
  expect(_.any([0, false, null, '', 0, false, 0], runCounter.fn)).toBe(false)
  expect(runCounter.getCount()).toBe(7)

  runCounter.resetCount()
  expect(_.any([0, 0, 1, 0, 0], runCounter.fn)).toBe(true)
  expect(runCounter.getCount()).toBe(3)
})

test('_.deepFlatten', function () {
  expect(_.deepFlatten([1, [2, [3, [4, [5]]]]])).toEqual([1, 2, 3, 4, 5])
  expect(_.deepFlatten([1, [[[[[[[[2]]]]]]]], 3])).toEqual([1, 2, 3])
})

test('_.is* (mostly primitive trios)', function () {
  type Trio = [(x: unknown) => boolean, unknown, boolean]
  const trios: Trio[] = [
    [_.isString, 'foo', true],
    [_.isString, 123, false],

    [_.isNumber, 123, true],
    [_.isString, 'foo', false],

    [_.isBoolean, true, true],
    [_.isBoolean, 'foo', false],

    [_.isNull, null, true],
    [_.isNull, 'foo', false],

    [_.isUndefined, undefined, true],
    [_.isUndefined, 'foo', false]
  ]
  // _.each(trios, ([fn, inp, out]) => expect(fn(inp)).toBe(out))
  _.each(trios, ([, inp]) => expect(_.isPrimitive(inp)).toBe(true))
  _.each(trios, ([, inp]) => expect(_.isArray(inp)).toBe(false))
  _.each(trios, ([, inp]) => expect(_.isPlainObject(inp)).toBe(false))
  _.each(trios, ([fn]) => expect(fn(['array'])).toBe(false))
  _.each(trios, ([fn]) => expect(fn({ ob: 'ject' })).toBe(false))
})

test('_.deepClone', function () {
  const obj = { foo: 'foo', arr: [1, 2, 3], num: 123, inner: { foo: 'foo' } }
  const alias = obj
  const clone = _.deepClone(obj)

  obj.foo = 'bar'
  expect(alias.foo).toBe('bar')
  expect(clone.foo).toBe('foo')

  obj.arr.push(4)
  expect(alias.arr).toEqual([1, 2, 3, 4])
  expect(clone.arr).toEqual([1, 2, 3])

  obj.num = 456
  expect(alias.num).toBe(456)
  expect(clone.num).toBe(123)

  obj.inner.foo = 'bar'
  expect(alias.inner.foo).toBe('bar')
  expect(clone.inner.foo).toBe('foo')
})

test('_.shallowClone', function () {
  const obj = { foo: 'foo', arr: [1, 2, 3], num: 123, inner: { foo: 'foo' } }
  const alias = obj
  const clone = _.shallowClone(obj)

  obj.foo = 'bar'
  expect(alias.foo).toBe('bar')
  expect(clone.foo).toBe('foo')

  obj.arr.push(4)
  expect(alias.arr).toEqual([1, 2, 3, 4])
  expect(clone.arr).toEqual([1, 2, 3, 4])
  expect(alias.arr).toBe(clone.arr)

  obj.num = 456
  expect(alias.num).toBe(456)
  expect(clone.num).toBe(123)

  obj.inner.foo = 'bar'
  expect(alias.inner.foo).toBe('bar')
  expect(clone.inner.foo).toBe('bar')
  expect(alias.inner).toBe(clone.inner)
})

test('_.mapObject', function () {
  expect(_.mapObject({ a: 1 }, v => 2 * v)).toEqual({ a: 2 })
  expect(_.mapObject({ a: 1, b: 2 }, v => 2 * v)).toEqual({ a: 2, b: 4 })
})

test('_.pick', function () {
  const fbb = { foo: 1, bar: 2, baz: 3, quax: 4 }
  const fb = _.pick(fbb, ['foo', 'bar'])
  expect(Object.keys(fb)).toEqual(['foo', 'bar'])
  expect(fb.foo).toBe(1)
  expect(fb.bar).toBe(2)
})

test('_.omit', function () {
  const fbb = { foo: 1, bar: 2, baz: 3, quax: 4 }
  const bq = _.omit(fbb, ['foo', 'bar'])
  expect(Object.keys(bq)).toEqual(['baz', 'quax'])
  expect(bq.baz).toBe(3)
  expect(bq.quax).toBe(4)
})
