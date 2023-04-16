import { atom, atomPair, getAtomValue, makeAtomSetter } from './atom'

test('atom', function (): void {
  const strAtom = atom('foo')
  const [str, setStr] = atomPair(strAtom)
  expect(str).toBe('foo')

  setStr('bar')
  expect(getAtomValue(strAtom)).toBe('bar')

  const numAtom = atom(10)
  const doubleAtom = atom(get => get(numAtom) * 2)
  expect(getAtomValue(doubleAtom)).toBe(20)

  const setNum = makeAtomSetter(numAtom)
  setNum(11)
  expect(getAtomValue(numAtom)).toBe(11)
  expect(getAtomValue(doubleAtom)).toBe(22)

  const [double, setDouble] = atomPair(doubleAtom)
  expect(double).toBe(22)
  expect(() => setDouble(48))
    .toThrow('Attempted to set non-settable (derived) atom.')
  expect(getAtomValue(doubleAtom)).toBe(22)
})
