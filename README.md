# Monoduck

### What is it?

- Monoduck is a Typescript-first, monolithic repository of subpackages.
- It's _not_ a monorepo, but instead a monolith with a single `package.json`.
- To avoid bloat, it has no hard `dependencies`, and all `peerDependencies` are optional.
- And to keep things tree-shakable, only named exports are used.

### Pre-Alpha Software

- Monoduck is not currently suitable for production use.
- Large sections of it are being (re-)written each weekend.
- Object/function shapes are likely to undergo rapid change.

### What's included?

- [**Lookduck**](/src/lookduck/README.md): React state manager with automatic dependency management for derived state.
- [**Tapiduck**](/src/tapiduck/README.md): End-to-end type-safe APIs with fullstack intillisense. Simple and restful-ish.
- [**Utilduck**](/src/utilduck/README.md): Commonly used, Underscore-style, typed utils like `_.map`, `_.deepClone`, etc.
- [**Sqlduck**](/src/sqlduck/README.md): A thin Sequelize wrapper. Plays well with Zod. Prioritizes simplicity & type-safety.

### Code Style & Preferences

Monoduck uses `ts-standard` for code-styling and linting. This way, one needn't manually configure lint rules. The codebase also has a few additional preferences:

- Functions are strongly preferred over classes. (Avoid OOP.)
- Avoid `this`. If unavoidable, go with `const self = this` and use `self`.
- Prefer `function` over `=>`. (The latter is OK for one-liners like `x => x + 1`.)
- Named exports are strongly preferred over default exports.
- Avoid `*` imports. (Using `*` is OK for docs/examples.)
- Prefer `unknown` over `any`. For return types, prefer `void` over `unknown`.
- Prefer `const` over `let`.
