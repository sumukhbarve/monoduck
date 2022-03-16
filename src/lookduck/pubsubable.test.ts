import { pubsubable } from './pubsubable'

test('pubsub with numbers', function (): void {
  const stream = pubsubable<number>()
  stream.publish(-1)
  const valArr: number[] = []
  const pushVal = (val: number): void => { valArr.push(val) }
  stream.publish(-0)
  expect(valArr).toEqual([])

  const unsubscribe = stream.subscribe(pushVal)

  stream.publish(1)
  expect(valArr).toEqual([1])
  stream.publish(2)
  expect(valArr).toEqual([1, 2])

  unsubscribe()

  stream.publish(3)
  expect(valArr).toEqual([1, 2])
  stream.publish(4)
  expect(valArr).toEqual([1, 2])

  stream.subscribe(pushVal)

  stream.publish(5)
  expect(valArr).toEqual([1, 2, 5])
  stream.publish(6)
  expect(valArr).toEqual([1, 2, 5, 6])

  stream.unsubscribe(pushVal)

  stream.publish(7)
  expect(valArr).toEqual([1, 2, 5, 6])
  stream.publish(8)
  expect(valArr).toEqual([1, 2, 5, 6])
})
