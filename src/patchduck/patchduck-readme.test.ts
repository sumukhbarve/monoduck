import { patchduck } from './index-patchduck'

test('the README intro example', function () {
  const obj = { foo: { bar: { baz: 'oldValue', x: 1 }, y: 2 }, z: 3 }
  const patchedFoo = patchduck.patch(obj, { foo: { bar: { baz: 'newValue' } } })
  expect(patchedFoo).toStrictEqual(
    { foo: { bar: { baz: 'newValue', x: 1 }, y: 2 }, z: 3 }
  )
  // Same update via spread, for README demo. Test the demo with expect() too!
  const spreadUpdatedFoo = {
    ...obj,
    foo: {
      ...obj.foo,
      bar: {
        ...obj.foo.bar,
        baz: 'newValue'
      }
    }
  }
  expect(spreadUpdatedFoo).toStrictEqual(patchedFoo)
})

test('the README Quickstart example', function () {
  const john = {
    id: 1,
    name: { first: 'John', last: 'Doe' },
    contact: { email: 'john.smartypants@example.com', phone: '555-555-5555' },
    address: {
      home: { line1: 'Line 1', zip: '10001', city: 'NYC', state: 'NY' },
      work: null
    }
  }
  const patchedJohn = patchduck.patch(john, {
    contact: { email: 'john.doe@example.com' },
    address: { home: { zip: '10002' } }
  })
  expect(patchedJohn).toStrictEqual({
    id: 1,
    name: { first: 'John', last: 'Doe' },
    contact: { email: 'john.doe@example.com', phone: '555-555-5555' },
    address: {
      home: { line1: 'Line 1', zip: '10002', city: 'NYC', state: 'NY' },
      work: null
    }
  })
  // Same update via spread, for README demo. Test the demo with expect() too!
  const spreadUpdatedJohn = {
    ...john,
    contact: {
      ...john.contact,
      email: 'john.doe@example.com'
    },
    address: {
      ...john.address,
      home: {
        ...john.address.home,
        zip: '10002'
      }
    }
  }
  expect(spreadUpdatedJohn).toStrictEqual(patchedJohn)
})

test('the README Array Replacement example', function () {
  const jane = {
    id: 8431,
    name: { first: 'Jane', last: 'Doe' },
    contact: { email: 'jane.loves.candy@example.com', phone: '555-123-1234' },
    addresses: [
      { type: 'home', line: { line1: 'Foo', line2: '' }, etc: 'etc ....' },
      { type: 'work', line: { line1: 'Bar', line2: '' }, etc: 'etc ....' },
      { type: 'other', line: { line1: 'Baz', line2: '' }, etc: 'etc ....' }
    ],
    etc: 'etc. ...'
  }
  const patchedJane = patchduck.patch(jane, {
    contact: { email: 'jane.doe@example.com' },
    addresses: jane.addresses.map(
      addr => addr.type === 'home'
        ? patchduck.patch(addr, { line: { line2: 'Apt. 123' } })
        : addr
    )
  })
  expect(patchedJane).toStrictEqual({
    id: 8431,
    name: { first: 'Jane', last: 'Doe' },
    contact: { email: 'jane.doe@example.com', phone: '555-123-1234' },
    addresses: [
      { type: 'home', line: { line1: 'Foo', line2: 'Apt. 123' }, etc: 'etc ....' },
      { type: 'work', line: { line1: 'Bar', line2: '' }, etc: 'etc ....' },
      { type: 'other', line: { line1: 'Baz', line2: '' }, etc: 'etc ....' }
    ],
    etc: 'etc. ...'
  })
  // Same update via spread, for comparison. Test it with expect() too!
  const spreadUpdatedJane = {
    ...jane,
    contact: {
      ...jane.contact,
      email: 'jane.doe@example.com'
    },
    addresses: jane.addresses.map(
      addr => addr.type === 'home'
        ? {
            ...addr,
            line: {
              ...addr.line,
              line2: 'Apt. 123'
            }
          }
        : addr
    )
  }
  expect(spreadUpdatedJane).toStrictEqual(patchedJane)
})
