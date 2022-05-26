# Monoduck

### What is it?

- Monoduck is a Typescript-first, monolithic repository of subpackages.
- To avoid bloat, it has no hard `dependencies`, and all `peerDependencies` are optional.
- And to keep things tree-shakable, only named exports are used.

### Pre-Alpha Software

- Monoduck is not currently suitable for production use.
- Large sections of it are being (re-)written every weekend.
- Object/function shapes are likely to undergo rapid change.

### What's included?

- [**Lookduck**](/src/lookduck/README.md): React state manager with automatic dependency management for derived state.
- [**Tapiduck**](/src/tapiduck/README.md): End-to-end type-safe APIs with fullstack intillisense. Simple and restful-ish.
- [**Utilduck**](/src/utilduck/README.md): Commonly used, Underscore-style, typed utils like `_.map`, `_.deepClone`, etc.
- [**Sqlduck**](/src/sqlduck/README.md): A thin Sequelize wrapper. Plays well with Zod. Prioritizes simplicity & type-safety.
- [**Roqsduck**](/src/roqsduck/README.md): Intentionally simple, query-string based, client-side routing for React apps.

### Code Style & Preferences

Monoduck uses `ts-standard` for code-styling and linting. This way, one needn't manually configure lint rules. The codebase also has a few additional conventions, listed below. While most of these conventions are not strict requirements, the codebase tries to follow all of them.

- Prefer functions over classes.
- Mildly prefer interfaces over types, but prefer types for functions.
- Avoid `this`. If unavoidable, go with `const self = this` and use `self`.
- Prefer `function` over `=>`. (Latter is OK for one-liners like `x => x + 1`)
- Prefer named exports over default exports, and avoid `*` imports.
- Prefer `unknown` over `any`. For return types, prefer `void` over `unknown`.
- Prefer `const` over `let`, and don't use `var`.
- Bool vars should begin with `is`, `has`, etc. (eg. `isAdmin`, `hasAccess`)
- Functions that return bools should end with `is`, `has`, etc. (eg. `oddIs`)
- Strictly prefer `===` over `==`. Never use `==`, not even `== null`.
