import { _ } from './indeps-lookduck'
import { observableIdMap } from './observableIdMap'
import { computed } from './computed'

test('observableIdMap of persons', function (): void {
  // Interface & factory:
  interface Person {
    id: string
    name: string
    age: number
  }
  const person = function (id: string): Person {
    return { id, name: id.toUpperCase(), age: 0 }
  }
  // Seed data:
  const plainIdsBatch1 = ['adam', 'brad', 'carl', 'dana']
  const plainIdsBatch2 = ['elle', 'fred', 'greg', 'hank']
  const plainDelIds = ['adam', 'brad']
  const plainFinalIds = ['carl', 'dana', 'elle', 'fred', 'greg', 'hank']

  // Observable, counting subscriber, and dependent comupteds:
  const personMap = observableIdMap(_.map(plainIdsBatch1, person))
  let notifCount = 0
  personMap.subscribe(() => { notifCount += 1 })
  const personCount = computed(() => _.values(personMap.get()).length)
  expect(personCount.get()).toBe(plainIdsBatch1.length)

  // Test getById():
  const adamX = personMap.getById('adam')
  if (adamX === undefined) { // Type guard
    throw new Error('Adam not found. Test failed')
  }
  expect(adamX).toStrictEqual(person('adam'))
  expect(personMap.getById('brad')).toStrictEqual(person('brad'))
  expect(personMap.getById('zeek')).toEqual(undefined)

  // Test updateObjects():
  const adamY = { ...person('adam'), name: 'adamy', age: 10 }
  const bradY = { ...person('brad'), name: 'brady', age: 10 }
  expect(notifCount).toBe(0)
  personMap.updateObjects([adamY, bradY])
  expect(notifCount).toBe(1) // Single notification for both updated objects.
  expect(personMap.getById('adam')).toStrictEqual(adamY)
  expect(personMap.getById('brad')?.name).toStrictEqual('brady')
  expect(personMap.getById('brad')?.age).toStrictEqual(10)
  // Test updateObjects() with clones.
  const carlClone = person('carl')
  const danaClone = person('dana')
  expect(personMap.getById('carl') === carlClone).toBe(false)
  expect(personMap.getById('carl')).toStrictEqual(carlClone)
  personMap.updateObjects([carlClone, danaClone])
  expect(notifCount).toBe(1) // No notification, as no obj change (deep-eq).
  // Test updateObjects() with new objects (insertion):
  personMap.updateObjects(_.map(plainIdsBatch2, person))
  expect(notifCount).toBe(2) // Single notification for update
  expect(personCount.get()).toBe(plainIdsBatch1.length + plainIdsBatch2.length)

  // Test popIds():
  personMap.popByIds(['adam', 'brad'])
  expect(notifCount).toBe(3) // Single notification for both popped objects.
  expect(personMap.getById('adam')).toBe(undefined)
  expect(personMap.getById('brad')).toBe(undefined)
  expect(personCount.get()).toBe(
    plainIdsBatch1.length + plainIdsBatch2.length - plainDelIds.length
  )
  expect(personMap.getById('carl')).toStrictEqual(person('carl'))
  expect(personMap.getById('dana')).toStrictEqual(person('dana'))
  // Test popIds() with non-existent ids:
  personMap.popByIds(['yara', 'zeek'])
  expect(notifCount).toBe(3) // unchanged
  expect(_.map(_.values(personMap.get()), p => p.id)).toStrictEqual(
    plainFinalIds
  )
  expect(personMap.get()).toStrictEqual(
    observableIdMap(_.map([...plainFinalIds].reverse(), person)).get()
  )
})
