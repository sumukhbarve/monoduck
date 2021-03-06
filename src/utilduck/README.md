# Utilduck

- Typescript-first, Underscore-style utilities.
- Used by other Monoduck subpackages, and **can be used independently**.
- Includes common utils like `_.map`, `_.filter`, `_.reduce`, `_.deepClone` etc.
    - But includes fewer utils than Underscore, and _far_ fewer utils than Lodash.
    - Aims to include only those utils which'll likely be used by most non-toy apps.

### Quickstart

1. **Install:** `npm install monoduck`
2. **Import:** `import { _ } from 'monoduck'`
3. **Hints:** Type `_.` in your TS-frindly IDE to get hinting!

### Exported Utils

- Most of the utils below should be familiar to most JS/TS users.
- A few utils are monoduck specific, and their usage is documented below.
- Also, you can always use IDE hints to view input & output shapes of any util.

```ts
export const _ = {
  BREAK,
  identity,
  not,
  bool,
  noop,
  ifel,
  assert,
  bang,
  each,
  map,
  filter,
  reduce,
  find,
  all,
  any,
  deepFlatten,
  stringIs,
  numberIs,
  booleanIs,
  nullIs,
  undefinedIs,
  nanIs,
  primitiveIs,
  arrayIs,
  plainObjectIs,
  keys,
  values,
  toPairs,
  fromPairs,
  keyHas,
  clonableIs,
  deepClone,
  shallowClone,
  shallowEquals,
  deepEquals,
  mapObject,
  pick,
  omit,
  groupBy,
  partition,
  sortBy,
  once,
  memoize,
  sleep,
  now,
  never
}
```

### Offbeat Utils/Behaviour

**1. Breaking Out:**

You can use `_.BREAK` to break out of `_.each()` loops. In the following example, elements `1` and `2` will be logged, but not `3` or `4`.
```ts
import { _ } from 'monoduck'

_.each([1, 2, 3, 4], val => {
    console.log(val)
    if (val === 2) {
        return _.BREAK
    }
})
```

**2. Exhaustiveness Checking**:

You can use `_.never()` for explicit (compile-time) exhaustiveness checking. While TS often doesn't need this, it can improve readability. For example:

```ts
export const getPx = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm': return '200px'
    case 'md': return '400px'
    case 'lg': return '800px'
    default: return _.never(size)
  }
}
```

**3. Async Sleep**:

You can use `await _.sleep(wait_milliseconds)` to sleep asynchronously. Useful for local testing/debugging too.

**4. Safe Bang!**

To assert that a value is NOT undefined, you can use `_.bang(value)`. This is similar to TypeScript's postfix `!` (non-null assertion) operator. But unlike `value!`, `_.bang(value)`:
- only asserts that `value` is non-undefined, does not assert non-null.
- throws an error if `value` is undefined, instead of leading to silent failures.

If you use TypeScript with `--noUncheckedIndexedAccess`, then `_.bang()` is handy for safely force-excluding `undefined`. If you also use `ts-standard` for linting (or `@typescript-eslint/no-non-null-assertion`), then `_.bang` is especially useful; as postfix `!` operator is disallowed.

For example, here's a an implementation of a grouping utility (assuming `--noUncheckedIndexedAccess`):
```ts
const groupBy = function <T>(arr: T[], fn: (val: T) => string) {
  const result: Record<string, T[]> = {}
  _.each(arr, function (val) {
    const key = fn(val)
    result[key] = result[key] ?? []
    _.bang(result[key]).push(val) // safe alternative to result[key]!.push(val)
  })
  return result
}
```
