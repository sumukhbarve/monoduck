# Patchduck

Typescript-first, React-friendly utility for deep-patching (deep-spreading) objects.

#### Instead of this:
```ts
const newObj = {
  ...obj,
  foo: {
    ...obj.foo,
    bar: {
      ...obj.foo.bar,
      baz: 'newValue'
    }
  }
}
```

#### You can just:
```ts
const newObj = patchduck.patch(obj, { foo: { bar: { baz: 'newValue' } } })
```



Like with `...spread`, the origianl object is left unchanged; a new object is created instead.


## QuickStart

1. Install [Monoduck](./../../README.md): `npm install monoduck`
2. Import `patchduck`: `import { patchduck } from 'monoduck'`
3. Call `patchduck.patch()` instead of `...spread`

Consider:

```ts
const john = {
  id: 1,
  name: { first: 'John', last: 'Doe' },
  contact: { email: 'john.smartypants@example.com', phone: '555-555-5555' },
  address: {
    home: { line1: 'Line 1', zip: '10001', city: 'NYC', state: 'NY' },
    work: null
  }
}
```
Let's say John wants to:
- update his email to `john.doe@example.com` to look more professional, and
- correct his residential zip code to `10002`.

#### Using Patchduck:
```ts
const patchedJohn = patchduck.patch(john, {
  contact: { email: 'john.doe@example.com' },
  address: { home: { zip: '10002' } }
})
```

#### Without Patchduck:

```ts
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
```

## React Hook

Create the `usePatchable()` hook by injecting React:
```ts
export const usePatchable = patchduck.makeUsePatchable(React)
```

The `usePatchable()` hook is similar to `useState()`, but returns `patchState()` instead of `setState()`.

Consider:
```ts
const [user, patchUser] = usePatchable<User>({
  name: { first: 'John', last: 'Doe' },
  contact: { email: 'john.doe@example.com', phone: '555-555-5555' },
  address: {
    home: { line1: 'Line 1', zip: '10002', city: 'NYC', state: 'NY' },
    work: null
  }
})
```

Then, to update the email address in response to user input, consider:
```tsx
<input
  value={user.name.first}
  onChange={event => patchUser({ name: { first: event.target.value } })}
/>
```

## Array Replacement

Nested arrays are _not_ patched, they're replaced outright. Thus, you should use map/filter/concat/etc to achieve the effect you want.

Consider:

```ts
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
```

Let's say Jane wants to update her email address, and the second line for her home address:

#### Using Patchduck:
```ts
const patchedJane = patchduck.patch(jane, {
  contact: { email: 'jane.doe@example.com' },
  addresses: jane.addresses.map(
    addr => addr.type === 'home'
      ? patchduck.patch(addr, { line: { line2: 'Apt. 123' } })
      : addr
  )
})
```

#### Without Patchduck:
```ts
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
```

## More Examples
For more examples, please see: [`patchduck.test.ts`](./patchduck.test.ts)
