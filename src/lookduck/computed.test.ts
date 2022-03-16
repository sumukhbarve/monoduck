import { observable } from './observable'
import { computed } from './computed'

test('compute y = 2x', function (): void {
  const x = observable(1)
  const y = computed(() => x.get() * 2)
  expect(y.get()).toBe(2)

  x.set(2)
  expect(y.get()).toBe(4)
  x.set(3)
  expect(y.get()).toBe(6)

  const vals: number[] = []
  const push = function (val: number): void {
    vals.push(val)
  }
  const unsub = y.subscribe(push)

  x.set(4)
  expect(y.get()).toBe(8)
  expect(vals).toEqual([8])

  x.set(5)
  expect(y.get()).toBe(10)
  expect(vals).toEqual([8, 10])

  unsub()
  x.set(6)
  expect(y.get()).toBe(12)
  expect(vals).toEqual([8, 10])
})

test('compute z = 2y, where y = 2x', function (): void {
  const x = observable(1)
  const y = computed(() => x.get() * 2)
  const z = computed(() => y.get() * 2)

  x.set(2)
  expect(z.get()).toBe(8)
  x.set(3)
  expect(z.get()).toBe(12)

  const vals: number[] = []
  const push = function (val: number): void {
    vals.push(val)
  }
  const unsub = z.subscribe(push)

  x.set(4)
  expect(z.get()).toBe(16)
  expect(vals).toEqual([16])

  x.set(5)
  expect(z.get()).toBe(20)
  expect(vals).toEqual([16, 20])

  unsub()
  x.set(6)
  expect(z.get()).toBe(24)
  expect(vals).toEqual([16, 20]) // no 24
})

test('compute val = a ? b + c : x ? y + z : "zero"', function (): void {
  const a = observable(true)
  const b = observable(10)
  const c = observable(20)
  const x = observable(true)
  const y = observable(100)
  const z = observable(200)
  const val = computed(function () {
    if (a.get()) { return b.get() + c.get() }
    if (x.get()) { return y.get() + z.get() }
    return 'zero'
  })
  expect(val.get()).toBe(30) // b + c = 10 + 20

  a.set(false)
  expect(val.get()).toBe(300) // y + z = 100 + 200
  x.set(false)
  expect(val.get()).toBe('zero') // 0

  a.set(true)
  expect(val.get()).toBe(30) // b + c = 10 + 20
  b.set(0)
  expect(val.get()).toBe(20) // b + c = 0 + 20
  b.set(10)
  expect(val.get()).toBe(30) // b + c = 10 + 20

  x.set(true)
  expect(val.get()).toBe(30) // b + c = 10 + 20
  x.set(false)
  expect(val.get()).toBe(30) // b + c = 10 + 20

  a.set(false)
  expect(val.get()).toBe('zero') // 0
  x.set(true)
  expect(val.get()).toBe(300) // y + z = 100 + 200
})

test('compute bio = {name}, {gender}, {age} y/o', function (): void {
  const name = observable('John')
  const gender = observable('male')
  const age = observable(25)
  const bio = computed(() => `${name.get()}, ${gender.get()}, ${age.get()} y/o`)
  const vals: string[] = []
  const unsub = bio.subscribe((val) => vals.push(val))

  expect(bio.get()).toBe('John, male, 25 y/o')

  name.set('Jane')
  gender.set('female')
  age.set(30)
  expect(bio.get()).toBe('Jane, female, 30 y/o')
  expect(vals).toEqual([
    'Jane, male, 25 y/o',
    'Jane, female, 25 y/o',
    'Jane, female, 30 y/o'
  ])

  // Clear the vals array in place
  vals.splice(0, vals.length)

  name.set('Robo')
  gender.set('other')
  age.set(5)
  expect(bio.get()).toBe('Robo, other, 5 y/o')
  expect(vals).toEqual([
    'Robo, female, 30 y/o',
    'Robo, other, 30 y/o',
    'Robo, other, 5 y/o'
  ])

  unsub()
})

test('compute z = x && y ? random() : 1000', function (): void {
  const x = observable<boolean | number>(false)
  const y = observable<boolean | number>(true)
  const z = computed(() => x.get() > 0 && y.get() > 0 ? Math.random() : 1000)
  const vals: number[] = []
  const pushval = (val: number): void => { vals.push(val) }
  const unsub = z.subscribe(pushval)

  expect(z.get()).toBe(1000)
  expect(vals).toEqual([])

  // x is falsy, so y shouldn't matter, and shouldn't trigger recomputes
  y.set(true)
  expect(z.get()).toBe(1000)
  expect(vals).toEqual([])
  y.set(false)
  expect(z.get()).toBe(1000)
  expect(vals).toEqual([])
  y.set(true)
  expect(z.get()).toBe(1000)
  expect(vals).toEqual([])

  // on setting x, y should start mattering, and triggering recomputes
  x.set(true)
  const a = z.get()
  expect(a).toBeLessThan(1) // Math.random => [0, 1)
  expect(vals).toEqual([a])
  y.set(1) // while still truthy, y has changed, so we should recomopute z.
  const b = z.get()
  expect(b).toBeLessThan(1)
  expect(vals).toEqual([a, b])
  y.set(2) // while still truthy, y has changed, so we should recomopute z.
  const c = z.get()
  expect(c).toBeLessThan(1)
  expect(vals).toEqual([a, b, c])

  // on clearing x, y should stop mattering, and stop triggering recomputes
  x.set(false)
  expect(z.get()).toBe(1000)
  expect(vals).toEqual([a, b, c, 1000])
  y.set(100)
  expect(z.get()).toBe(1000)
  expect(vals).toEqual([a, b, c, 1000])
  y.set(200)
  y.set(300)
  y.set(true)
  y.set(false)
  expect(z.get()).toBe(1000)
  expect(vals).toEqual([a, b, c, 1000])

  unsub()
})
