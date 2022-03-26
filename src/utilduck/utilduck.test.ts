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
  expect(_.filter([1, 2, 3, 4], x => x % 2 === 0)).toEqual([2, 4])
})

test('_.reduce', function () {
  expect(_.reduce([1, 2, 3, 4], (acc, val) => acc + val, 0)).toBe(10)
  expect(_.reduce([1, 2, 3, 4], (acc, val) => acc * val, 1)).toBe(24)
  const accObj: Record<string, unknown> = {}
  expect(_.reduce(
    [{ foo: 1 }, { bar: 2 }, { baz: 3 }],
    (acc, val) => ({ ...acc, ...val }),
    accObj
  )).toEqual({ foo: 1, bar: 2, baz: 3 })
  expect(accObj).toEqual({ foo: 1, bar: 2, baz: 3 })
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
  expect(_.any([0, false, null, '', 0, false, null], runCounter.fn)).toBe(false)
  expect(runCounter.getCount()).toBe(7)

  runCounter.resetCount()
  expect(_.any([0, 0, 1, 0, 0], runCounter.fn)).toBe(true)
  expect(runCounter.getCount()).toBe(3)
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
