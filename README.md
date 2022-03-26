# Monoduck

### What is it?

- Monoduck is a Typescript-first, monolithic repository of subpackages.
- It's _not_ a monorepo, but instead a monolith with a single `package.json`.
- To avoid bloat, it has no hard `dependencies`, and all `peerDependencies` are optional.

### What's included?

- [**Lookduck**](/src/lookduck/README.md): React state manager with automatic dependency management for derived state.
- [**Tapiduck**](/src/tapiduck/README.md): End-to-end type-safe APIs with fullstack intillisense. Simple and restful-ish.
- [**Utilduck**](/src/utilduck/README.md): Commonly used, Underscore-style, typed utils like `_.map`, `_.deepClone`, etc.

### House Keeping

- Code Style: ts-standard
- Testing Framework: jest
