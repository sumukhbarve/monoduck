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

test('_.noop', function () {
  expect(_.noop()).toBe(undefined)
  expect(_.noop('defined')).toBe(undefined)
  expect(_.noop(true)).toBe(undefined)
  expect(_.noop(1, 'two', [3], null, true, false, { x: 'y' })).toBe(undefined)
})

test('_.last', function () {
  expect(_.last([0, 1, 2, 3])).toBe(3)
  expect(_.last([0, 1, 2, 3, 4])).toBe(4)
  expect(_.last([0, 1, 2, { foo: 'bar' }])).toStrictEqual({ foo: 'bar' })
  const barQuax = { bar: 'quax' }
  expect(_.last([0, 1, 2, barQuax])).toBe(barQuax)
})

test('_.assert', function () {
  expect(_.assert(true)).toBe(true)
  expect(_.assert(123)).toBe(123)
  expect(_.assert('foo')).toBe('foo')
  expect(_.assert([])).toStrictEqual([])
  expect(_.assert({})).toStrictEqual({})

  expect(() => _.assert(false)).toThrow('Assertion Error:: value=false')
  expect(() => _.assert(null)).toThrow('Assertion Error:: value=null')
  expect(() => _.assert(undefined)).toThrow('Assertion Error:: value=undefined')
  expect(() => _.assert('')).toThrow('Assertion Error:: value=""')
  expect(() => _.assert(0)).toThrow('Assertion Error:: value=0')
  expect(() => _.assert(NaN)).toThrow('Assertion Error:: value=NaN')

  expect(() => _.assert(false, 'custom')).toThrow('Assertion Error:: custom')
})

test('_.bang', function () {
  expect(_.bang(true)).toBe(true)
  expect(_.bang(123)).toBe(123)
  expect(_.bang('foo')).toBe('foo')
  expect(_.bang([])).toStrictEqual([])
  expect(_.bang({})).toStrictEqual({})

  expect(_.bang(false)).toBe(false)
  expect(_.bang(null)).toBe(null)
  expect(_.bang(0)).toBe(0)
  expect(_.bang(NaN)).toBe(NaN)

  // _.bang() only throws on undefined. Not on false/null/other-falsey.
  expect(() => _.bang(undefined)).toThrow('Bang Error')
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
  expect(_.map([1, 2, 3], x => 2 * x)).toStrictEqual([2, 4, 6])
  expect(_.map([1, 2, 3], x => x * x)).toStrictEqual([1, 4, 9])
})

test('_.filter', function () {
  // With explicit filtering fn:
  expect(_.filter([1, 2, 3, 4], x => x % 2 === 0)).toStrictEqual([2, 4])
  // With default (bool) filtering:
  expect(_.filter([0, 1, null, {}, false, 'foo'])).toStrictEqual([1, {}, 'foo'])
})

test('_.reject', function () {
  expect(_.reject([1, 2, 3, 4], n => n % 2 === 0)).toStrictEqual([1, 3])
  expect(_.reject([1, 2, 3, 4], n => n % 3 === 0)).toStrictEqual([1, 2, 4])
})

test('_.reduce', function () {
  expect(_.reduce([1, 2, 3, 4], (acc, val) => acc + val, 0)).toBe(10)
  expect(_.reduce([1, 2, 3, 4], (acc, val) => acc * val, 1)).toBe(24)
  const blankAcc: Record<string, unknown> = {}
  expect(_.reduce(
    [{ foo: 1 }, { bar: 2 }, { baz: 3 }],
    (acc, val) => ({ ...acc, ...val }),
    blankAcc
  )).toStrictEqual({ foo: 1, bar: 2, baz: 3 })
  expect(blankAcc).toStrictEqual({})
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

test('_.rangeOpt', function () {
  expect(_.rangeOpt(8)).toStrictEqual({ start: 0, end: 8, step: 1 })
  expect(_.rangeOpt(8, 16)).toStrictEqual({ start: 8, end: 16, step: 1 })
  expect(_.rangeOpt(8, 16, 2)).toStrictEqual({ start: 8, end: 16, step: 2 })

  expect(_.rangeOpt(20, 10)).toStrictEqual({ start: 20, end: 10, step: -1 })
  expect(_.rangeOpt(20, 0)).toStrictEqual({ start: 20, end: 0, step: -1 })
  expect(_.rangeOpt(20, -1)).toStrictEqual({ start: 20, end: -1, step: -1 })
  expect(_.rangeOpt(20, -1, -2)).toStrictEqual({ start: 20, end: -1, step: -2 })

  expect(_.rangeOpt(-4)).toStrictEqual({ start: 0, end: -4, step: -1 })
  expect(_.rangeOpt(-4, -8)).toStrictEqual({ start: -4, end: -8, step: -1 })
  expect(_.rangeOpt(-4, -8, -2)).toStrictEqual({ start: -4, end: -8, step: -2 })
})

test('_.range', function () {
  expect(_.range(4)).toStrictEqual([0, 1, 2, 3])
  expect(_.range(4, 8)).toStrictEqual([4, 5, 6, 7])
  expect(_.range(4, 8, 2)).toStrictEqual([4, 6])
  expect(_.range(4, 8, 3)).toStrictEqual([4, 7])

  expect(_.range(8, 4)).toStrictEqual([8, 7, 6, 5])
  expect(_.range(8, 4, -2)).toStrictEqual([8, 6])
  expect(_.range(8, 4, -3)).toStrictEqual([8, 5])
  expect(_.range(-4)).toStrictEqual([0, -1, -2, -3])

  expect(() => _.range(1, 10, -1)).toThrow('Invalid Range::')
  expect(() => _.range(10, 1, +1)).toThrow('Invalid Range::')
  expect(() => _.range(-1, -10, +1)).toThrow('Invalid Range::')
  expect(() => _.range(-10, -1, -1)).toThrow('Invalid Range::')

  expect(_.range(0, 0)).toStrictEqual([])
  expect(_.range(10, 10)).toStrictEqual([])
})

test('_.deepFlatten', function () {
  expect(_.deepFlatten([1, [2, [3, [4, [5]]]]])).toStrictEqual([1, 2, 3, 4, 5])
  expect(_.deepFlatten([1, [[[[[[[[2]]]]]]]], 3])).toStrictEqual([1, 2, 3])
})

test('_.stringIs, etc. (mostly primitives)', function () {
  type Trio = [(x: unknown) => boolean, unknown, boolean]
  const trios: Trio[] = [
    [_.stringIs, 'foo', true],
    [_.stringIs, 123, false],

    [_.numberIs, 123, true],
    [_.stringIs, 'foo', false],

    [_.booleanIs, true, true],
    [_.booleanIs, 'foo', false],

    [_.nullIs, null, true],
    [_.nullIs, 'foo', false],

    [_.undefinedIs, undefined, true],
    [_.undefinedIs, 'foo', false]
  ]
  // _.each(trios, ([fn, inp, out]) => expect(fn(inp)).toBe(out))
  _.each(trios, ([, inp]) => expect(_.primitiveIs(inp)).toBe(true))
  _.each(trios, ([, inp]) => expect(_.arrayIs(inp)).toBe(false))
  _.each(trios, ([, inp]) => expect(_.plainObjectIs(inp)).toBe(false))
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
  expect(alias.arr).toStrictEqual([1, 2, 3, 4])
  expect(clone.arr).toStrictEqual([1, 2, 3])

  obj.num = 456
  expect(alias.num).toBe(456)
  expect(clone.num).toBe(123)

  obj.inner.foo = 'bar'
  expect(alias.inner.foo).toBe('bar')
  expect(clone.inner.foo).toBe('foo')

  const voidFn = (): void => {}
  expect(() => _.deepClone([0, 1, voidFn])).toThrow('Cloning failed')
  expect(() => _.deepClone([0, 1, [2, voidFn]])).toThrow('Cloning failed')
})

test('_.shallowClone', function () {
  const obj = { foo: 'foo', arr: [1, 2, 3], num: 123, inner: { foo: 'foo' } }
  const alias = obj
  const clone = _.shallowClone(obj)

  obj.foo = 'bar'
  expect(alias.foo).toBe('bar')
  expect(clone.foo).toBe('foo')

  obj.arr.push(4)
  expect(alias.arr).toStrictEqual([1, 2, 3, 4])
  expect(clone.arr).toStrictEqual([1, 2, 3, 4])
  expect(alias.arr).toBe(clone.arr)

  obj.num = 456
  expect(alias.num).toBe(456)
  expect(clone.num).toBe(123)

  obj.inner.foo = 'bar'
  expect(alias.inner.foo).toBe('bar')
  expect(clone.inner.foo).toBe('bar')
  expect(alias.inner).toBe(clone.inner)

  const voidFn = (): void => {}
  expect(() => _.shallowClone([1, 2, voidFn])).toThrow('Cloning failed')
  const originalArr = [0, 1, [2, voidFn]]
  const clonedArr = _.shallowClone(originalArr)
  expect(clonedArr).toStrictEqual(originalArr)
  expect(clonedArr).not.toBe(originalArr)
  expect(clonedArr[2]).toBe(originalArr[2])
})

test('_.deepEquals', function () {
  const obj = { foo: 'foo', arr: [1, 2, 3], num: 123, inner: { foo: 'foo' } }
  const dClone = _.deepClone(obj)
  const sClone = _.shallowClone(obj)
  expect(_.deepEquals(obj, dClone)).toBe(true)
  expect(_.deepEquals(obj, sClone)).toBe(true)

  sClone.inner.foo = 'foobar'
  expect(obj.inner.foo).toBe('foobar')
  expect(dClone.inner.foo).toBe('foo')

  expect(_.deepEquals(obj, dClone)).toBe(false)
  expect(_.deepEquals(obj, sClone)).toBe(true)

  expect(_.deepEquals([], {})).toBe(false)
  expect(_.deepEquals({}, [])).toBe(false)
  expect(_.deepEquals([], new Date())).toBe(false)
  expect(_.deepEquals(new Date(), {})).toBe(false)
  expect(_.deepEquals({}, /regexp/)).toBe(false)
  expect(_.deepEquals(/regexp/, [])).toBe(false)

  const voidFnA = (): void => {}
  const voidFnB = (): void => {}
  expect(_.deepEquals(voidFnA, 'primitiveish')).toBe(false)
  expect(_.deepEquals(voidFnA, voidFnA)).toBe(true)
  expect(_.deepEquals([1, 2, voidFnA], [1, 2, voidFnA])).toBe(true)
  expect(() => _.deepEquals(voidFnA, voidFnB)).toThrow('Cannot check eq')
  expect(() => _.deepEquals([1, 2, voidFnA], [1, 2, voidFnB]))
    .toThrow('Cannot check eq')
  const dateA = new Date(1234567890123)
  const dateB = new Date(1234567890123)
  expect(_.deepEquals(dateA, 'primitiveish')).toBe(false)
  expect(() => _.deepEquals(dateA, dateB)).toThrow('Cannot check eq')
  expect(() => _.deepEquals([1, dateA], [1, dateB])).toThrow('Cannot check eq')
})

test('_.shallowEquals', function () {
  const obj = { foo: 'foo', arr: [1, 2, 3], num: 123, inner: { foo: 'foo' } }
  const sClone = _.shallowClone(obj)
  const dClone = _.deepClone(obj)
  expect(_.shallowEquals(obj, sClone)).toBe(true)
  expect(_.shallowEquals(obj, dClone)).toBe(false) // as === fails @ high depth

  sClone.inner.foo = 'foobar'
  expect(obj.inner.foo).toBe('foobar')
  expect(dClone.inner.foo).toBe('foo')

  expect(_.shallowEquals(obj, sClone)).toBe(true)
  expect(_.shallowEquals(obj, dClone)).toBe(false) // continues to remain false

  expect(_.shallowEquals([], {})).toBe(false)
  expect(_.shallowEquals({}, [])).toBe(false)
  expect(_.shallowEquals([], new Date())).toBe(false)
  expect(_.shallowEquals(new Date(), {})).toBe(false)
  expect(_.shallowEquals({}, /regexp/)).toBe(false)
  expect(_.shallowEquals(/regexp/, [])).toBe(false)

  const voidFnA = (): void => {}
  const voidFnB = (): void => {}
  expect(_.shallowEquals(voidFnA, 'primitiveish')).toBe(false)
  expect(_.shallowEquals(voidFnA, voidFnA)).toBe(true)
  expect(_.shallowEquals([1, 2, voidFnA], [1, 2, voidFnA])).toBe(true)
  expect(() => _.shallowEquals(voidFnA, voidFnB)).toThrow('Cannot check eq')
  expect(_.shallowEquals([1, 2, voidFnA], [1, 2, voidFnB])).toBe(false)
  const num = 1234567890123
  const dateA = new Date(num)
  const dateB = new Date(num)
  expect(_.shallowEquals(dateA, 'primitiveish')).toBe(false)
  expect(() => _.shallowEquals(dateA, dateB)).toThrow('Cannot check eq')
  expect(_.shallowEquals([1, dateA], [1, dateB])).toBe(false)
})

test('_.mapObject', function () {
  expect(_.mapObject({ a: 1 }, v => 2 * v)).toStrictEqual({ a: 2 })
  expect(_.mapObject({ a: 1, b: 2 }, v => 2 * v)).toStrictEqual({ a: 2, b: 4 })
})

test('_.pick', function () {
  const fbb = { foo: 1, bar: 2, baz: 3, quax: 4 }
  const fb = _.pick(fbb, ['foo', 'bar'])
  expect(Object.keys(fb)).toStrictEqual(['foo', 'bar'])
  expect(fb.foo).toBe(1)
  expect(fb.bar).toBe(2)
})

test('_.omit', function () {
  const fbb = { foo: 1, bar: 2, baz: 3, quax: 4 }
  const bq = _.omit(fbb, ['foo', 'bar'])
  expect(Object.keys(bq)).toStrictEqual(['baz', 'quax'])
  expect(bq.baz).toBe(3)
  expect(bq.quax).toBe(4)
})

test('_.groupBy', function () {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]

  expect(_.groupBy(arr, function (num) {
    if (num % 15 === 0) { return 'fizzbuzz' }
    if (num % 5 === 0) { return 'buzz' }
    if (num % 3 === 0) { return 'fizz' }
    return 'plain'
  })).toStrictEqual({
    plain: [1, 2, 4, 7, 8, 11, 13, 14],
    fizz: [3, 6, 9, 12],
    buzz: [5, 10],
    fizzbuzz: [15]
  })

  expect(_.groupBy(arr, num => num % 2 === 0 ? 'even' : 'odd')).toStrictEqual({
    even: [2, 4, 6, 8, 10, 12, 14],
    odd: [1, 3, 5, 7, 9, 11, 13, 15]
  })
})

test('_.partition', function () {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
  const oddIs = (n: number): boolean => n % 2 === 1
  expect(_.partition(arr, oddIs)).toStrictEqual([
    [1, 3, 5, 7, 9, 11, 13, 15],
    [2, 4, 6, 8, 10, 12, 14]
  ])
})

test('_.sortBy', function () {
  const uNums = [2, 6, 8, 0, 9, 7, 5, 3, 4, 1] // unsorted
  const sNums = _.sortBy(uNums, v => v) // sorted
  expect(sNums).toStrictEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

  const uStrs = ['hh', 'gg', 'jj', 'ff', 'dd', 'cc', 'bb', 'aa', 'ii', 'ee']
  const sStrs = _.sortBy(uStrs, v => v)
  expect(sStrs).toStrictEqual('aa bb cc dd ee ff gg hh ii jj'.split(' '))

  const buildPerson = function (name: string): { name: string, eman: string } {
    return { name, eman: name.split('').reverse().join('') }
  }
  const namesSrc = 'amy brad carl dan elle fred greg hank igor jane'
  const ascEmans = 'darb derf elle enaj gerg knah lrac nad rogi yma'.split(' ')
  const ascNames = namesSrc.split(' ')
  const descNames = namesSrc.split(' ').reverse()
  const descPersonsByName = descNames.map(buildPerson)
  const sPersonsByName = _.sortBy(descPersonsByName, p => p.name)
  expect(sPersonsByName.map(p => p.name)).toStrictEqual(ascNames)
  const sPersonsByEman = _.sortBy(descPersonsByName, p => p.eman)
  expect(sPersonsByEman.map(p => p.eman)).toStrictEqual(ascEmans)
})

test('_.once', function () {
  let count = 0
  const rawIncr = (delta: number): number => { count += delta; return count }
  const onceIncr = _.once(rawIncr)

  expect(count).toBe(0) // Initial state

  // Only 1st call to onceIncr() should increment (and return) count.
  // Furture calls should _not_ increment, and should return 1st returned count.

  expect(onceIncr(1)).toBe(1) // First call
  expect(count).toBe(1)

  expect(onceIncr(100)).toBe(1) // Subsequent call, o/p should remain 1
  expect(count).toBe(1) // And the count shouldn't be incremented either.

  expect(onceIncr(1000)).toBe(1)
  expect(count).toBe(1)

  expect(rawIncr(200)).toBe(201) // Forcefully changes the `count`.
  expect(count).toBe(201) // The var `count` now has a newer value.
  expect(onceIncr(2000)).toBe(1) // But o/p of onceIncr() should remain same.
  expect(count).toBe(201) // And running onceIncr shouldn't affect `count`.
})

test('_.memoize', function () {
  let rawCallCount = 0
  const rawFacto = function (n: number): number {
    rawCallCount += 1
    return n === 1 ? 1 : n * rawFacto(n - 1)
  }
  let memCallCount = 0
  const memFacto = _.memoize(function (n: number): number {
    memCallCount += 1
    return n === 1 ? 1 : n * memFacto(n - 1)
  })

  expect(rawCallCount).toBe(0)
  expect(memCallCount).toBe(0)

  expect(rawFacto(5)).toBe(120)
  expect(rawCallCount).toBe(5)
  expect(memFacto(5)).toBe(120)
  expect(memCallCount).toBe(5)

  rawCallCount = 0
  memCallCount = 0

  expect(rawFacto(10)).toBe(3628800)
  expect(rawCallCount).toBe(10)
  expect(memFacto(10)).toBe(3628800)
  expect(memCallCount).toBe(5) // Not 10, as 1! to 5! should be memoized
})

test('_.timedMemoize', async function () {
  let rawCallCount = 0
  const rawHello = function (): void {
    rawCallCount += 1
  }
  let memCallCount = 0
  const ttl = 50 // ms
  const memHello = _.timedMemoize(ttl, function (): void {
    memCallCount += 1
  })

  expect(rawCallCount).toBe(0)
  expect(memCallCount).toBe(0)

  for (const i of _.range(10)) {
    rawHello()
    expect(rawCallCount).toBe(i + 1)
  }

  for (const _i of _.range(10)) {
    _.noop(_i) // pacify linter no-unused-vars
    memHello()
    expect(memCallCount).toBe(1) // should remain 1, assume ttl not crossed
  }

  memCallCount = 0 // reset memCallCount
  expect(memCallCount).toBe(0)

  for (const i of _.range(4)) {
    await _.sleep(ttl + 10)
    memHello()
    expect(memCallCount).toBe(i + 1) // should _not_ remain 1, as ttl crossed
  }
})

test('_.debounce', async function () {
  let count = 0
  const originalFn = (): void => { count += 1 }
  _.each([1, 2, 3, 4, 5], originalFn)
  expect(count).toBe(5)

  count = 0 // reset count
  expect(count).toBe(0)
  const shortWaitMs = 10
  const shortDebouncedFn = _.debounce(originalFn, shortWaitMs)
  _.each([1, 2, 3, 4, 5], shortDebouncedFn)
  expect(count).toBe(0) // no immediate diff, as no sync-exec
  _.sleepSync(100)
  expect(count).toBe(0) // still no immediate diff, as no sync-exec
  await _.sleep(shortWaitMs + 1) // +1 margin
  expect(count).toBe(1)

  count = 0 // reset count
  expect(count).toBe(0)
  const longerWaitMs = 200
  const longerDebouncedFn = _.debounce(originalFn, longerWaitMs)
  _.each([10, 20, 30, 40, 45, 50], (n) => setTimeout(longerDebouncedFn, n))
  expect(count).toBe(0) // no immediate diff, as no sync-exec
  _.sleepSync(100)
  expect(count).toBe(0) // still no immediate diff, as no sync-exec
  await _.sleep(longerWaitMs + 50 + 10) // +50 as max(n) -> 50, +10 margin
  expect(count).toBe(1)
})

test('_.sleep', async function () {
  const errorMargin = 10 // miliseconds
  const periods = [400, 600]
  for (const period of periods) {
    const t0 = _.now()
    await _.sleep(period)
    const diff = _.now() - t0
    expect(Math.abs(diff - period)).toBeLessThanOrEqual(errorMargin)
  }
})

test('_.sleepSync', function () {
  const errorMargin = 5 // miliseconds
  const periods = [400, 600]
  for (const period of periods) {
    const t0 = _.now()
    _.sleepSync(period)
    const diff = _.now() - t0
    expect(Math.abs(diff - period)).toBeLessThanOrEqual(errorMargin)
  }
})

test('_.uniqueId', function () {
  _.each('apple banana cat donkey'.split(' '), function (prefix) {
    _.each([1, 2, 3, 4, 5], function (n) {
      expect(_.uniqueId(prefix)).toBe(`${prefix}_${n}`)
    })
    _.each([1, 2, 3, 4, 5], function (n) {
      expect(_.uniqueId(prefix)).toBe(`${prefix}_${n + 5}`)
    })
  })
  _.each([1, 2, 3, 4, 5], (n) => expect(_.uniqueId()).toBe(String(n)))
  _.each([1, 2, 3, 4, 5], (n) => expect(_.uniqueId()).toBe(String(n + 5)))
})

test('_.jsonValueIs', function () {
  const yesJson: unknown[] = [
    1, null, 'some-string', true, false, [], {},
    [1, 2, 3, 'four', 'five', true, null, { foo: 'bar' }],
    { foo: { bar: { baz: ['one', { two: 3 }, [true, false]] } } }
  ]
  _.each(yesJson, val => expect(_.jsonValueIs(val)).toBe(true))
  const nonJson = [
    undefined, () => {}, () => null, new Date(),
    [1, 2, 3, undefined, 5], [1, 2, 3, () => null, 5],
    globalThis.NaN, globalThis, /regularExpression/,
    { fn: () => null, foo: { bar: { baz: ['one', { two: 3 }] } } }
  ]
  _.each(nonJson, val => expect(_.jsonValueIs(val)).toBe(false))
})

test('_.escape', function () {
  expect(_.escape('foo')).toBe('foo')
  expect(_.escape('&')).toBe('&amp;')
  expect(_.escape('<b>')).toBe('&lt;b&gt;')
  expect(_.escape('"')).toBe('&quot;')
  expect(_.escape("'")).toBe('&#39;')
  expect(_.escape('<b> foo </b>')).toBe('&lt;b&gt; foo &lt;/b&gt;')
  expect(_.escape('I <3 chai & coffee')).toBe('I &lt;3 chai &amp; coffee')
})
