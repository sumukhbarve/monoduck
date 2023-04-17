# Lookduck

### What is it?  
- TypeScript-first, React-oriented state manager.
- Inspired by [Knockout's](https://knockoutjs.com/) observable pattern.

### How's it different?
- No boilerplate needed, not even a wrapping `<Provider>`.
- **Automatic dependency management** for computed values (i.e. derived state).
- No hard dependency on React. Could be used on the server.
- Intentionally simple, highly composable, and strictly typed.

## Quickstart: React Duck Counter

### 0. Install Monoduck:
```shell
npm install monoduck
```

### 1. Create your `store.ts`:
```ts
import React from 'react'
import { lookduck } from 'monoduck'

const MIN_EXPECTED_DUCK_COUNT = 5

export const store = {
  duckCount: lookduck.observable(0),
  duckNoun: lookduck.computed(function (): string {
    return store.duckCount.get() === 1 ? 'duck' : 'ducks'
  }),
  isTooLow: lookduck.computed(function (): boolean {
    return store.duckCount.get() < MIN_EXPECTED_DUCK_COUNT
  })
}

export const useStore = lookduck.makeUseStore(store, React)
```

### 2. Bind your components. That's it!

Call `useStore()` to reactively select any properties from the store.
```tsx
const DuckCountHeading: React.FC = function () {
  const { duckCount, duckNoun } = useStore('duckCount', 'duckNoun')
  return <h3>Duck Count: {duckCount} {duckNoun}</h3>
}
```

Call `.set()` to update observables.
```tsx
const DuckAdder: React.FC<{delta: number, label: string}> = function (props) {
  const { delta, label } = props
  const onAdd = () => store.duckCount.set(store.duckCount.get() + delta)
  return <button onClick={onAdd}>{label}</button>
}
```
(Notice that we didn't call `useStore()` above, as the component needn't rerender when duckCount changes.)

Only select properties that the component needs; this'll prevent unnecessary re-renders.
```tsx
const LowCountWarning: React.FC = function () {
  const { isTooLow } = useStore('isTooLow')
  return isTooLow ? <p>Warning: There are too few ducks. Add some!</p> : null
}
```

For completeness, here's a mini-app, composed of above components.
```tsx
const MiniDuckPondApp: React.VFC = function () {
  return (
    <>
      <DuckCountHeading />
      <DuckAdder delta={+1} label={'Add a duck'} />{' '}
      <DuckAdder delta={-2} label={'Remove two ducks'} />{' '}
      <DuckAdder delta={+5} label={'Add five ducks'} />{' '}
      <LowCountWarning />
    </>
  )
}
```

## The `store` Is Optional

A `store` can help with code organization, and we recommend creating one. But if you prefer, you may work with lookables directly instead. For brevity, code snippets below don't create a store.

## Lookables, Observables, and Computeds

### Lookables:
- A lookable is something you can look at.
- To look at it, call `.get()`, and you'll get it's current value.
- To be notified of changes, call `.subscribe()` with a listener of type `() => void`.
- If you use Lookduck with React, in most cases, you shouldn't need to subscribe manually.

### Observables:
- An observable is a _settable_ lookable.
- To set it's value, call `.set()` with the new value.
- If the new value is different from the previous value, subscribers will be notified.
- By default, equality is tested via `Object.is`, so for objects, that's referential equality.
- Here's a quick example:


```ts
const fisrtName = lookduck.observable('John')
console.log(fisrtName.get()) // John

fisrtName.set('Jane')
console.log(fisrtName.get()) // Jane

const lastName = lookduck.observable('Doe')
console.log(`${fistName.get()} ${lastName.get()}`) // Jane Doe
```


### Computeds:
- A computed is a lookable whose value is determined by a computation.
- If the computation depends on other lookables, the value gets recomputed when any dependency changes.
- Dependencies are automatically tracked and managed by Lookduck.
- Continuing the above example, consider:

```ts
const fullName = lookduck.computed(() => `${firstName.get()} ${lastName.get()}`
console.log(fullName.get()) // Jane Doe

firstName.set('Harry')
console.log(fullName.get()) // Harry Doe

lastName.set('Potter')
console.log(fullName.get()) // Harry Potter
```

## Type-Safety & Subscriptions
Types and subscriptions work the way you'd expect. Consider:
```ts
type User = { id: number, name: string }
const currentUser = lookduck.observable<User | null>(null)

const unsubscribe = currentUser.subscribe(() => {
    const user = currentUser.get()
    if (! user) {
        console.log('The user logged out.')
    } else {
        console.log(`${user.name} logged in.`)
    }
})

currentUser.set({id: 1, name: 'Harry Potter'}) // Harry Potter logged in.
currentUser.set(null) // The user logged out.
currentUser.set({id: 2, name: 'Homer Simpson'}) // Homer Simpson logged in.

unsubscribe() // This'll destroy the logging subscription
```

Quick comments on the above:

 - Just like observables, computeds can also be explicitly typed.
 - And like observables, you can subscribe to computeds too.
 - If you use Lookduck with React, you shouldn't need to manually manage subscriptions.


## Alternative Equality Modes:
By defaults, observables (and computeds), use `Object.is` for equality checking. But both `observable()` and `computed()` functions accept a second parameter, `equality`, which can be:
- `"is"` (the default),
- `"deep"`: (deep-equality),
- `"shallow"`: (shallow-equality), or
- a custom function of type `(x: unknown, y: unknown) => boolean`

To demonstrate this, consider:
```ts
// By default, observables use referential equaity:
const ob1 = observable({name: 'Harry', status: 'Hello World!'})
ob1.subscribe(() => console.log('ob1 updated'))
ob1.set({...ob1.get()}) // logs: ob1 updated
ob1.set({...ob1.get(), status: 'Hi!'}) // logs "ob1 updated"
ob1.set({...ob1.get(), status: 'Hi!'}) // logs "ob1 updated"

// Let's create an observable that uses deep-equality:
const ob2 = observable({name: 'Larry', status: 'Hello World!'}, 'deep')
ob2.subscribe(() => console.log('ob2 updated'))
ob2.set({...ob2.get()}) // doesn't log anything!
ob2.set({...ob2.get(), status: 'Hi!'}) // logs "ob2 updated"
ob2.set({...ob2.get(), status: 'Hi!'}) // doesn't log anything!
```

### Why does the equality mode matter?

The equality mode is used to determine if an observable changed, and whenever it changes, all the computeds that depend on it are recomputed. Those recomputeations can trigger additional recomputations, as computeds can depend on computeds.

If a non-primitive observable (or computed) impacts multiple downstream computeds (or if it has multiple subscribers), it might make sense to use an alternative equality mode. This way, noop-like updates won't trigger a recomputation cascade.

## React Integration:

Lookduck doesn't internally import React; allowing us to embrace plugin architecture, and keep Monoducks' footprint minimal. Instead, Lookduck includes a helpers for React injection.

### With a `store`:

As demonstrated in the quickstart, right after creating the `store`:
- `const useStore = lookduck.makeUseStore(store, React)`
- and then call `useStore()` in your components.

### Without a `store`:

Before the first render (ideally before calling `ReactDOM.createRoot()`), call:
- `lookduck.injectReact(React)`
- and then call `lookduck.useLookable()` in your components. For example:

```tsx
const observableCount = lookduck.observable(0)
const computedDoubleCount = lookduck.computed(() => observableCount.get() * 2)

const Counter: React.FC = function () {
  const count = lookduck.useLookable(observableCount)
  const doubleCount = lookduck.useLookable(computedDoubleCount)
  const onIncrement = React.useCallback(() => {
    observableCount.set(observableCount.get() + 1)
    // If we use `count` instead of `observableCount.get()` above,
    // then we should add add `count` to useCallback's dependency array.
  }, [])
  return (
    <>
      <p>The count is {count}, and twice that is {doubleCount}.</p>      
      <button onClick={onIncrement}>Increment count</button>
    </>
  )
}
```

### Working with Jotai-like `atom`s:

If you've used Jotai (or Recoil), you may've noticed that working directly with lookalbes (without a `store`) feels very similar to working with atoms. You're correct indeed, and in fact, Lookduck includes `atom`, and is highly Jotai-compatible. Repeating the above example with atoms:

```tsx
const countAtom = lookduck.atom(0)
const doubleCountAtom = lookduck.atom(get => get(countAtom) * 2)

const Counter: React.FC = function () {
  const [count, setCount] = lookduck.useAtom(countAtom)
  const [doubleCount] = lookduck.useAtom(doubleCountAtom)
  const onIncrement = React.useCallback(() => {
    setCount(count + 1)
  }, [count])
  return (
    <>
      <p>The count is {count}, and twice that is {doubleCount}.</p>
      <button onClick={onIncrement}>Increment count</button>
    </>
  )
}
```

<!--## Observable ID Maps-->

<!--On the frontend, if your dealing with (database-linked) objects with an `id` property, it might make sense to have an observable of type `Record<IdType, ObjectType>`. And `lookduck.observableIdMap()` can build such an observable for you!-->
