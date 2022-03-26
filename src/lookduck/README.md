# Lookduck

### What is it?  
- TypeScript-first, React-oriented state manager.
- Inspired by [Knockout's](https://knockoutjs.com/) observable pattern.

### How's it different?
- No boilerplate needed, not even a wrapping `<Provider>`.
- **Automatic dependency management** for computed values (i.e. derived state).
- No hard dependency on React. Could be used on the server.
- Intentionally simple, highly composable, and strictly typed.

### Quickstart: Duck Counter

**0. Install monoduck:**
```shell
npm install monoduck
```

**1. Create your `store.ts`:**
```ts
import { useEffect, useState } from 'react'
import { lookduck } from 'monoduck'

const LOW_DUCK_MARK = 10;

export const duckCount = lookduck.observable(5)
export const belowMark = lookduck.computed(() => duckCount.get() < LOW_DUCK_MARK)
export const incrDucks = (delta: number) => duckCount.set(duckCount.get() + delta)

export const use = lookduck.makeUseLookable(useState, useEffect)
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

### Lookables, Observables, and Computeds

**Lookables:**
- A lookable is something you can look at.
- To look at it, call `.get()`, and you'll get it's current value.
- To be notified of changes, call `.subscribe()` with a listener of type `() => void`.
- If you use Lookduck with React, in most cases, you shouldn't need to subscribe manually.

**Observables:**
- An observable is a _settable_ lookable.
- To set it's value, call `.set()` with the new value.
- If the new value is different from the previous value, subscribers will be notified.
- Equality is tested via `===`, so for objects, that's referential equality.
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

### Type-Safety & Subscriptions
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

### React Integration:

Lookduck doesn't internally import React. Instead, it includes a helper that returns a React hook:

```ts
import { lookduck } from 'monoduck'
import { useState, useEffect } from 'react'

export const useLookable = lookduck.makeUseLookable(useState, useEffect)
```

The decision to _not_ import react was taken with a view to:
- embrace plugin architecture, and
- keep Monoduck's overall footprint minimal.

The `useLookable` hook accepts a lookable, and returns it's current value. Then, whenever the lookable changes, it triggers a rerender.
