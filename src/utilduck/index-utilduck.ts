/*
Common Abbreviations
--------------------
arr: array
fn: function
val (or v): value
k: key
i (or j): index
seq: sequence
acc: accumulator
el: element
x (or y): unknown
inp (or ip): input
out (or op): output
num(s): number(s)
*/

type RecordKey = string | number | symbol
type Obj<T, K extends RecordKey = string> = Record<K, T>
type ItrFn<X, Y = unknown, I = number> = (val: X, i: I) => Y
type NotIsh = 0 | '' | 0n | null | undefined | false // EXCLUDES NaN
type NoInfer<T> = [T][T extends any ? 0 : never]
type VoidFn = () => void
type AnyFn = (...args: any[]) => any // This is unrelated to `_.any()`
// SameFn<F> produces a function with the same signature as F
type SameFn<F extends AnyFn> = (...args: Parameters<F>) => ReturnType<F>

const BREAK = {} as const
const identity = <T>(x: T): T => x
const not = function (x: unknown): x is NotIsh {
  if (Number.isNaN(x)) {
    throw new Error('_.bool() and _.not() do _not_ expect NaN')
  }
  const isTruthy = Boolean(x)
  return !isTruthy // linter dislikes `!unknownVar`, but accepts `!booleanVar`
}
const bool = <T>(x: T | NotIsh): x is T => !not(x)
const noop = (...args: unknown[]): void => { _.identity(args) }
const ifel = function <T>(condition: unknown, consequent: T, alternate: T): T {
  return _.bool(condition) ? consequent : alternate
}

const assert = function <T>(val: T | undefined, msg?: string): T {
  msg = msg ?? `value=${_.nanIs(val) ? 'NaN' : JSON.stringify(val)}`
  // Check NaN first, as _.not (type guard) does not expect NaN.
  if (_.nanIs(val) || _.not(val)) {
    throw new Error(`Assertion Error:: ${msg}`)
  }
  return val
}
// Like TypeScript's postfix-bang. Throws if undefined, does NOT check null.
// Useful when working with both `noUncheckedIndexedAccess` and ts-standard.
const bang = function <T>(val: T | undefined): T {
  if (!_.undefinedIs(val)) { return val }
  throw new Error('Bang Error:: _.bang() was called with undefined.')
}

const each = function <T>(arr: T[], fn: ItrFn<T>): void {
  for (let i = 0; i < arr.length; i += 1) {
    if (fn(arr[i] as T, i) === BREAK) {
      break
    }
  }
}
const map = function <X, Y>(arr: X[], fn: ItrFn<X, Y>): Y[] {
  const result: Y[] = []
  each(arr, (val, i) => result.push(fn(val, i)))
  return result
}
const filter = function <T>(arr: T[], fn: ItrFn<T> = identity): T[] {
  const result: T[] = []
  each(arr, (val, i) => bool(fn(val, i)) && result.push(val))
  return result
}

type ReduceItrFn<T, A> = (acc: A, val: T) => A
const reduce = function <T, A>(arr: T[], fn: ReduceItrFn<T, A>, acc: A): A {
  each(arr, val => { acc = fn(acc, val) })
  return acc
}
const find = function <T>(arr: T[], fn: ItrFn<T> = identity): T | undefined {
  let foundVal: T | undefined
  _.each(arr, function (val, i) {
    if (_.bool(fn(val, i))) {
      foundVal = val
      return _.BREAK
    }
  })
  return foundVal
}

const all = function <T>(arr: T[], fn: ItrFn<T> = identity): boolean {
  let result = true
  each(arr, function (val, i) {
    if (not(fn(val, i))) {
      result = false
      return BREAK
    }
  })
  return result
}
const any: (typeof all) = function (arr, fn = identity) {
  return not(all(arr, (val, i) => not(fn(val, i))))
}

const rangeOpt = function (
  ...args: [number] | [number, number] | [number, number, number]
): {start: number, end: number, step: number} {
  const length = args.length
  const sign = (n: number): number => n / Math.abs(n)
  switch (length) {
    case 1: return { start: 0, end: args[0], step: sign(args[0] - 0) }
    case 2: return { start: args[0], end: args[1], step: sign(args[1] - args[0]) }
    case 3: return { start: args[0], end: args[1], step: args[2] }
    default: return _.never(length)
  }
}
const range = function (
  ...args: [number] | [number, number] | [number, number, number]
): number[] {
  const { start, end, step } = rangeOpt(...args)
  const sign = (n: number): number => n / Math.abs(n)
  if ((end - start) === 0) { return [] }
  if (step === 0 || Number.isNaN(step) || sign(end - start) !== sign(step)) {
    throw new Error(`Invalid Range:: start=${start}, end=${end}, step=${step}`)
  }
  const result: number[] = []
  for (let i = start; step > 0 ? i < end : i > end; i += step) {
    result.push(i)
  }
  return result
}

type NestedArr<T> = Array<T | NestedArr<T>>
const deepFlatten = function <T>(arr: NestedArr<T>): T[] {
  const result: T[] = []
  each(arr, function (el) {
    if (!Array.isArray(el)) {
      result.push(el)
    } else {
      each(deepFlatten(el), function (flatEl) {
        result.push(flatEl)
      })
    }
  })
  return result
}

const stringIs = (x: unknown): x is string => typeof x === 'string'
const numberIs = (x: unknown): x is number => typeof x === 'number'
const booleanIs = (x: unknown): x is boolean => typeof x === 'boolean'
const nullIs = (x: unknown): x is null => x === null
const undefinedIs = (x: unknown): x is undefined => x === undefined
// `nanIs` is _not_ a type guard, as `typeof NaN` -> 'number'
const nanIs = (x: unknown): boolean => Number.isNaN(x)

type Primitive = string | number | boolean | null | undefined
const primitiveIs = function (x: unknown): x is Primitive {
  return any([stringIs, numberIs, booleanIs, nullIs, undefinedIs], fn => fn(x))
}
const arrayIs = (x: unknown): x is unknown[] => Array.isArray(x)
const functionIs = (x: unknown): x is Function => typeof x === 'function'

const keys = <T>(obj: Obj<T>): string[] => Object.keys(obj)
const values = <T>(obj: Obj<T>): T[] => Object.values(obj)
const toPairs = <T>(obj: Obj<T>): Array<[string, T]> => Object.entries(obj)
const fromPairs = function <T>(pairs: Array<[string, T]>): Obj<T> {
  const result: Obj<T> = {}
  each(pairs, ([key, val]) => { result[key] = val })
  return result
}
const keyHas = function (
  obj: Obj<unknown>,
  key: string
): key is keyof typeof obj {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

// This is stricter than lodash.isPlainObject, as we don't travel up the
// prototype chain. We just check if prototype is null or that of literals.
const plainObjectIs = function (x: unknown): x is Obj<unknown> {
  if (not(x)) { return false }
  const tag = Object.prototype.toString.call(x)
  if (tag !== '[object Object]') { return false }
  const proto = Object.getPrototypeOf(x)
  return proto === null || proto === Object.getPrototypeOf({})
}

type Clonable = Primitive | ClonableArr | ClonableObj
interface ClonableArr extends Array<Clonable> {}
interface ClonableObj extends Obj<Clonable> {}
const clonableIs = function (x: unknown): x is Clonable {
  if (primitiveIs(x)) { return true }
  if (arrayIs(x)) { return all(x, clonableIs) }
  if (plainObjectIs(x)) { return clonableIs(Object.values(x)) }
  return false
}
const clone = function<T> (x: T, depth: number): T {
  if (primitiveIs(x)) {
    return x
  }
  if (arrayIs(x)) {
    if (depth === 0) { return x }
    return _.map(x, el => clone(el, depth - 1)) as unknown as T
  }
  if (plainObjectIs(x)) {
    if (depth === 0) { return x }
    return _.mapObject(x, val => clone(val, depth - 1)) as unknown as T
  }
  console.error('Cannot clone: ', x)
  throw new Error(`Cloning failed, as \`${String(x)}\` is not clonable.`)
}
const deepClone = <T> (x: T): T => clone(x, Infinity)
const shallowClone = <T> (x: T): T => clone(x, 1)

const equals = function (x: unknown, y: unknown, depth: number): boolean {
  const isEq = Object.is(x, y)
  if (depth === 0 || primitiveIs(x) || primitiveIs(y) || isEq) { return isEq }
  if (arrayIs(x)) {
    if (!arrayIs(y)) { return false }
    if (x.length !== y.length) { return false }
    return all(x, (_xEl, i) => equals(x[i], y[i], depth - 1))
  }
  if (arrayIs(y)) { return false }
  if (plainObjectIs(x)) {
    if (!plainObjectIs(y)) { return false }
    const xKeys = Object.keys(x)
    const yKeys = Object.keys(y)
    if (xKeys.length !== yKeys.length) { return false }
    return all(xKeys, k => keyHas(y, k) && equals(x[k], y[k], depth - 1))
  }
  if (plainObjectIs(y)) { return false }
  console.error(`Can't check equality of ${String(x)} against ${String(y)}.`)
  throw new Error(`Can't check equality of ${String(x)} against ${String(y)}.`)
}
const deepEquals = (x: unknown, y: unknown): boolean => equals(x, y, Infinity)
const shallowEquals = (x: unknown, y: unknown): boolean => equals(x, y, 1)

const mapObject = function <X, Y>(
  obj: Obj<X>,
  fn: ItrFn<X, Y, string>
): Obj<Y> {
  const result: Obj<Y> = {}
  each(toPairs(obj), function ([key, val]) {
    result[key] = fn(val, key)
  })
  return result
}

const pick = function <T extends Obj<unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result: Partial<T> = {}
  each(keys, key => { result[key] = obj[key] })
  return result as Pick<T, K>
}
const omit = function <T extends Obj<unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result: Partial<T> = {}
  const omitKeys = new Set(keys)
  each(toPairs(obj), function ([key, value]) {
    if (!omitKeys.has(key as K)) {
      result[key as K] = value as T[K]
    }
  })
  return result as Omit<T, K>
}

const groupBy = function <T>(arr: T[], fn: ItrFn<T, string>): Obj<T[]> {
  const result: Obj<T[]> = {}
  each(arr, function (val, i) {
    const key = fn(val, i)
    result[key] = result[key] ?? []
    _.bang(result[key]).push(val)
  })
  return result
}
const partition = function <T>(arr: T[], fn: ItrFn<T, boolean>): [T[], T[]] {
  const groupMap = groupBy(arr, (val, i) => String(bool(fn(val, i))))
  return [_.bang(groupMap.true), _.bang(groupMap.false)]
}
const sortBy = function <T>(arr: T[], fn: ItrFn<T, number | string>): T[] {
  const duos = map(arr, (val, i) => ({ val, sortv: fn(val, i) }))
  duos.sort((a, b) => a.sortv === b.sortv ? 0 : a.sortv < b.sortv ? -1 : +1)
  return map(duos, duo => duo.val)
}

const once = function<F extends AnyFn> (fn: F): SameFn<F> {
  type Cache<T> = {ran: false} | {ran: true, result: T}
  let cache: Cache<ReturnType<F>> = { ran: false }
  const newFn = function (...args: Parameters<F>): ReturnType<F> {
    if (!cache.ran) {
      cache = { ran: true, result: fn(...args) }
    }
    return cache.result
  }
  return newFn
}
const memoize = function<F extends AnyFn> (
  fn: F, hasher?: (...args: Parameters<F>) => string
): SameFn<F> {
  const hashFn = hasher ?? ((...args: Parameters<F>) => JSON.stringify(args))
  const cache: Record<string, ReturnType<F>> = {}
  const newFn = function (...args: Parameters<F>): ReturnType<F> {
    const key = hashFn(...args)
    if (!keyHas(cache, key)) {
      cache[key] = fn(...args)
    }
    return _.bang(cache[key])
  }
  return newFn
}
const debounce = function (fn: VoidFn, waitMs: number): VoidFn {
  let prevCallAt = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  const cancelTimeout = function (): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }
  const debouncedFn = function (): void {
    const currentCallAt = Date.now()
    const waitedMs = currentCallAt - prevCallAt
    prevCallAt = currentCallAt // for next call
    const isLeadingCall = timeoutId === null
    if (!isLeadingCall && waitedMs >= waitMs) {
      cancelTimeout()
      return fn()
    }
    // Otherwise
    cancelTimeout()
    timeoutId = setTimeout(debouncedFn, waitMs)
  }
  return debouncedFn
}

const delay = (fn: VoidFn, waitMs: number): void => { setTimeout(fn, waitMs) }
const defer = (fn: VoidFn, waitMs = 0): void => { setTimeout(fn, waitMs) }
// const makeDeferred = (fn: VoidFn, ms = 0): VoidFn => () => defer(fn, ms)
const sleep = async function (waitMs: number): Promise<void> {
  return await new Promise(resolve => setTimeout(resolve, waitMs))
}
const sleepSync = function (waitMs: number): void {
  const START = Date.now()
  while (Date.now() - START < waitMs) { _.noop() }
}
const now = (): number => Date.now()

const prefixCountMap: Record<string, number> = {} // NOT to be exported
const uniqueId = function (prefix = ''): string {
  prefixCountMap[prefix] = (prefixCountMap[prefix] ?? 0) + 1
  const sep = prefix === '' ? '' : '_'
  return `${prefix}${sep}${_.bang(prefixCountMap[prefix])}`
}

const pretty = (x: unknown, space = 4): string => JSON.stringify(x, null, space)
const singleSpaced = (s: string): string => s.trim().split(/\s+/).join(' ')
const never = (never: never): never => never

type JsonPrimitive = string | number | boolean | null
interface JsonArray extends Array<JsonValue> {}
interface JsonObject extends Record<string, JsonValue> {}
type JsonValue = JsonPrimitive | JsonArray | JsonObject

export type {
  NoInfer, VoidFn, AnyFn, SameFn,
  JsonPrimitive, JsonArray, JsonObject, JsonValue
}

export const _ = {
  BREAK,
  identity,
  not,
  bool,
  noop,
  ifel,
  assert,
  bang,
  each,
  map,
  filter,
  reduce,
  find,
  all,
  any,
  rangeOpt,
  range,
  deepFlatten,
  stringIs,
  numberIs,
  booleanIs,
  nullIs,
  undefinedIs,
  nanIs,
  primitiveIs,
  arrayIs,
  functionIs,
  plainObjectIs,
  keys,
  values,
  toPairs,
  fromPairs,
  keyHas,
  clonableIs,
  // clone,
  deepClone,
  shallowClone,
  // equals,
  shallowEquals,
  deepEquals,
  mapObject,
  pick,
  omit,
  groupBy,
  partition,
  sortBy,
  once,
  memoize,
  debounce,
  delay,
  defer,
  // makeDeferred,
  sleep,
  sleepSync,
  now,
  uniqueId,
  pretty,
  singleSpaced,
  never
}
