# Lookduck

### What is it?  
- TypeScript-first, React-oriented state manager.
- Inspired by [Knockout's](https://knockoutjs.com/) observable pattern.

### How's it different?
- No boilerplate needed, not even a wrapping `<Provider>`.
- **Automatic dependency management** for computed values (i.e. derived state).
- No hard dependency on React. Could be used on the server.
- Intentionally simple, highly composable, and strictly typed.

## Quickstart: Duck Counter

**0. Install monoduck:**
```shell
npm install monoduck
```

**1. Create your `store.ts`:**
```ts
import React from 'react'
import { lookduck } from 'monoduck'

const LOW_DUCK_MARK = 10;

export const duckCount = lookduck.observable(5)
export const belowMark = lookduck.computed(() => duckCount.get() < LOW_DUCK_MARK)
export const incrDucks = (delta: number) => duckCount.set(duckCount.get() + delta)

export const use = lookduck.makeUseLookable(React)
```

**2. Bind your components. Done!**
```tsx
import React from 'react'
import * as store from './store'

export const DuckCounter: React.VFC = () => {
    const duckCount = store.use(store.duckCount)
    const belowMark = store.use(store.belowMark)
    return (
        <div>
            <h3>There are {duckCount} ducks in the park.</h3>
            {belowMark && <h4>Oh no, that's below the low-duck-mark!</h4>}
            <button onClick={() => store.incrDucks(1)}>
                Add a duck
            </button>
        </div>
    )
}
```

## Lookables, Observables, and Computeds

**Lookables:**
- A lookable is something you can look at.
- To look at it, call `.get()`, and you'll get it's current value.
- To be notified of changes, call `.subscribe()` with a listener of type `() => void`.
- If you use Lookduck with React, in most cases, you shouldn't need to subscribe manually.

**Observables:**
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


**Computeds:**
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
By defaults, observables (and computes), use `Object.is` for equality checking. But both `observable()` and `computed()` functions accept a second parameter, `equality`, which can be:
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

**Why does the equality mode matter?**

The equality mode is used to determine if the observable changed, and whenever it changes, all the computes that depend on it are recomputed. Those recomputeations can trigger additional recomputations, as computes can depend on computes.

If an observable (or computed) impacts multiple downstream computes (or if it has multiple subscribers), it might make sense to an alternative equality mode. This way, noop-like updates won't trigger a recomputation cascade.

## React Integration:

Lookduck doesn't internally import React. Instead, it includes a helper that returns a React hook:

```ts
import { lookduck } from 'monoduck'
import React from 'react'

export const useLookable = lookduck.makeUseLookable(React)
```

The decision to _not_ import react was taken with a view to:
- embrace plugin architecture, and
- keep Monoduck's overall footprint minimal.

The `useLookable` hook accepts a lookable, and returns it's current value. Then, whenever the lookable changes, it triggers a rerender.

<!--## Observable ID Maps-->

<!--On the frontend, if your dealing with (database-linked) objects with an `id` property, it might make sense to have an observable of type `Record<IdType, ObjectType>`. And `lookduck.observableIdMap()` can build such an observable for you!-->
