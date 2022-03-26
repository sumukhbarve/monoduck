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
- Also, you can always use IDE hints to view input & output shapes of any util.
- The only odd man out is `_.BREAK`. An example of it's usage is included below.

```ts
export const _ = {
  BREAK,
  identity,
  bool,
  not,
  each,
  map,
  filter,
  reduce,
  all,
  any,
  deepFlatten,
  isString,
  isNumber,
  isBoolean,
  isNull,
  isUndefined,
  isPrimitive,
  isArray,
  isPlainObject,
  isClonable,
  deepClone,
  pairs,
  mapObject,
  pick,
  omit
}
```

**Breaking Out:**

You can use `_.BREAK` to break out of `_.each()` loops. In the following example, elements `1` and `2` will be logged in, but not `3` or `4`.
```ts
import { _ } from 'monoduck'

_.each([1, 2, 3, 4], val => {
    console.log(val)
    if (val === 2) {
        return _.BREAK
    }
})
```

Output:
```
1
2
```
