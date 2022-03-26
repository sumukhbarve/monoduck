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

const filter = function <T>(arr: T[], fn: ItrFn<T>): T[] {
  const result: T[] = []
  each(arr, (val, i) => bool(fn(val, i)) && result.push(val))
  return result
}

type ReduceItrFn<T, A> = (acc: A, val: T) => A
const reduce = function <T, A>(arr: T[], fn: ReduceItrFn<T, A>, acc: A): A {
  each(arr, (val, i) => { acc = fn(acc, val) })
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
  filter,
  map,
  reduce,
  all,
  any,
  deepFlatten,
  pairs,
  mapObject,
  pick,
  omit
}
