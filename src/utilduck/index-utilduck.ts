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
*/

type RecordKey = string | number | symbol
type Obj<T, K extends RecordKey = string> = Record<K, T>
type ItrFn<X, Y = unknown, I = number> = (val: X, i: I) => Y

const BREAK = {} as const
const identity = function <T>(x: T): T { return x }
const bool = (x: unknown): boolean => Boolean(x)
const not = (x: unknown): boolean => !bool(x)

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

const isString = (x: unknown): x is string => typeof x === 'string'
const isNumber = (x: unknown): x is number => typeof x === 'number'
const isBoolean = (x: unknown): x is boolean => typeof x === 'boolean'
const isNull = (x: unknown): x is null => x === null
const isUndefined = (x: unknown): x is undefined => x === undefined

type Primitive = string | number | boolean | null | undefined
const isPrimitive = function (x: unknown): x is Primitive {
  return any([isString, isNumber, isBoolean, isNull, isUndefined], fn => fn(x))
}
const isArray = (x: unknown): x is unknown[] => Array.isArray(x)

// This is stricter than lodash.isPlainObject, as we don't travel up the
// prototype chain. We just check if prototype is null or that of literals.
const isPlainObject = function (x: unknown): x is Obj<unknown> {
  if (not(x)) { return false }
  const tag = Object.prototype.toString.call(x)
  if (tag !== '[object Object]') { return false }
  const proto = Object.getPrototypeOf(x)
  return proto === null || proto === Object.getPrototypeOf({})
}

type Clonable = Primitive | ClonableArr | ClonableObj
interface ClonableArr extends Array<Clonable> {}
interface ClonableObj extends Obj<Clonable> {}
const isClonable = function (x: unknown): x is Clonable {
  if (isPrimitive(x)) { return true }
  if (isArray(x)) { return all(x, isClonable) }
  if (isPlainObject(x)) { return isClonable(Object.values(x)) }
  return false
}
const deepClone = function<T> (x: T): T {
  if (isPrimitive(x)) { return x }
  if (isArray(x)) { return _.map(x, deepClone) as unknown as T }
  if (isPlainObject(x)) { return _.mapObject(x, deepClone) as unknown as T }
  console.error('Cannot clone: ', x)
  throw new Error(`Cloning failed, as \`${String(x)}\` is not clonable.`)
}
const shallowClone = function<T> (x: T): T {
  if (isPrimitive(x)) { return x }
  if (isArray(x)) { return _.map(x, identity) as unknown as T }
  if (isPlainObject(x)) { return _.mapObject(x, identity) as unknown as T }
  console.error('Cannot clone: ', x)
  throw new Error(`Cloning failed, as \`${String(x)}\` is not clonable.`)
}

// const keys = function <T>(obj: Obj<T>): string[] {
//   return Object.keys(obj)
// }
// const values = function <T>(obj: Obj<T>): T[] {
//   return Object.values(obj)
// }
const pairs = function <T>(obj: Obj<T>): Array<[string, T]> {
  return Object.entries(obj)
}

const mapObject = function <X, Y>(
  obj: Obj<X>,
  fn: ItrFn<X, Y, string>
): Obj<Y> {
  const result: Obj<Y> = {}
  each(pairs(obj), function ([key, val]) {
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
  each(pairs(obj), function ([key, value]) {
    if (!omitKeys.has(key as K)) {
      result[key as K] = value as T[K]
    }
  })
  return result as Omit<T, K>
}

export const _ = {
  BREAK,
  identity,
  bool,
  not,
  each,
  map,
  filter,
  reduce,
  all,
  any,
  deepFlatten,
  isString,
  isNumber,
  isBoolean,
  isNull,
  isUndefined,
  isPrimitive,
  isArray,
  isPlainObject,
  isClonable,
  deepClone,
  shallowClone,
  pairs,
  mapObject,
  pick,
  omit
}
