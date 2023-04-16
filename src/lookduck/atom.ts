import type { Lookable } from './lookable'
import type { EqualityMode } from './observable'
import { observable, observableIs } from './observable'
import { computed } from './computed'
import { _ } from './indeps-lookduck'
import { useLookable } from './react-hook'

// The `get` passed to derivation functions:
type GetFn = <T>(atom: Atom<T>) => T
const get: GetFn = function<T> (atom: Atom<T>): T {
  return atom.__lookable.get()
}

// A derivation function that accepts `get`:
type DeriveFn<T> = (get: GetFn) => T

interface Atom<T> {__lookable: Lookable<T>}
const atomize = <T>(lookable: Lookable<T>): Atom<T> => ({ __lookable: lookable })

// Defining atoms:
// ---------------

const atom = function<T> (
  valOrDerive: T | DeriveFn<T>,
  equality?: EqualityMode
): Atom<T> {
  if (typeof valOrDerive !== 'function') {
    return atomize(observable(valOrDerive, equality))
  }
  const derive = valOrDerive as DeriveFn<T>
  if (derive.length !== 1) {
    throw new TypeError('Atom derivation function must take single `get` param')
  }
  return atomize(computed(() => derive(get), equality))
}

// Getting and setting atoms:
// --------------------------

const getAtomValue = <T>(atom: Atom<T>): T => atom.__lookable.get()

const makeAtomSetter = function<T> (
  atom: Atom<T>
): (newVal: T) => void {
  const lookable = atom.__lookable
  if (observableIs(lookable)) {
    return (newVal: T) => lookable.set(newVal)
  }
  // We assume that Observable is the only .set-able Lookable.
  _.assert(!('set' in lookable), 'assert non-Observable Lookable has no .set')
  // Instead of throwing directly, we return a function that throws,
  // so as to allow derived atoms to be used with the `useAtom` hook.
  return function (_newVal: T) {
    throw new TypeError('Attempted to set non-settable (derived) atom.')
  }
}

type AtomValAndSetter<T> = [T, (val: T) => void]

// Similar to useAtom, but doesn't involve React/ivity. Useful for testing.
const atomPair = function<T> (atom: Atom<T>): AtomValAndSetter<T> {
  return [getAtomValue(atom), makeAtomSetter(atom)]
}

// React Hooks:
// ------------

const useAtomValue = <T>(atom: Atom<T>): T => useLookable(atom.__lookable)

const useAtom = function<T> (atom: Atom<T>): AtomValAndSetter<T> {
  return [useAtomValue(atom), makeAtomSetter(atom)]
}

export type { Atom, GetFn, DeriveFn, AtomValAndSetter }
export { atom, getAtomValue, makeAtomSetter, atomPair, useAtomValue, useAtom }
