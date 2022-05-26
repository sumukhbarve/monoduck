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
const noop = (): void => {}
const ifel = function <T>(condition: unknown, consequent: T, alternate: T): T {
  return _.bool(condition) ? consequent : alternate
}

const each = function <T>(arr: T[], fn: ItrFn<T>): void {
  for (let i = 0; i < arr.length; i += 1) {
    if (fn(arr[i], i) === BREAK) {
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

type Primitive = string | number | boolean | null | undefined
const primitiveIs = function (x: unknown): x is Primitive {
  return any([stringIs, numberIs, booleanIs, nullIs, undefinedIs], fn => fn(x))
}
const arrayIs = (x: unknown): x is unknown[] => Array.isArray(x)

// const keys = <T>(obj: Obj<T>): string[] => Object.keys(obj)
// const values = <T>(obj: Obj<T>): T[] => Object.values(obj)
const toPairs = <T>(obj: Obj<T>): Array<[string, T]> => Object.entries(obj)
const fromPairs = function <T>(pairs: Array<[string, T]>): Obj<T> {
  const result: Obj<T> = {}
  each(pairs, ([key, val]) => { result[key] = val })
  return result
}
const keyHas = function (obj: Obj<unknown>, key: string): boolean {
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
  const isSame = Object.is(x, y)
  if (depth === 0 || primitiveIs(x) || primitiveIs(y) || isSame) {
    return isSame
  }
  if (arrayIs(x) && arrayIs(y) && x.length === y.length) {
    return all(x, (_xEl, i) => equals(x[i], y[i], depth - 1))
  }
  if (plainObjectIs(x) && plainObjectIs(y)) {
    const xKeys = Object.keys(x)
    const yKeys = Object.keys(y)
    if (xKeys.length !== yKeys.length) { return false }
    return all(xKeys, k => keyHas(y, k) && equals(x[k], y[k], depth - 1))
  }
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
    result[key] = (result[key] ?? [])
    result[key].push(val)
  })
  return result
}
const partition = function <T>(arr: T[], fn: ItrFn<T, boolean>): [T[], T[]] {
  const groupMap = groupBy(arr, (val, i) => String(bool(fn(val, i))))
  return [groupMap.true, groupMap.false]
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
    return cache[key]
  }
  return newFn
}

const never = (never: never): never => never

export type { NoInfer, AnyFn, SameFn }

export const _ = {
  BREAK,
  identity,
  not,
  bool,
  noop,
  ifel,
  each,
  map,
  filter,
  reduce,
  all,
  any,
  deepFlatten,
  stringIs,
  numberIs,
  booleanIs,
  nullIs,
  undefinedIs,
  primitiveIs,
  arrayIs,
  plainObjectIs,
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
  once,
  memoize,
  never
}
