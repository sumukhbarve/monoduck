# Monoduck

### What is it?

- Monoduck is a Typescript-first, monolithic repository of subpackages.
- To avoid bloat, it has absolutely no `dependencies`, and all `peerDependencies` are _optional_.
- And to keep things tree-shakable, only named exports are used.

### Nearly Production-Ready

- Monoduck is not _fully_ ready for production use yet, but it's getting there.
- It is already stable enough for use in internal apps, and even customer-facing POCs.
- If things go as per plan, it'll become fully production-ready by Q4 of 2023.

### What's included?

- [**Lookduck**](/src/lookduck/README.md): React state manager with automatic dependency management for derived state.
- [**Tapiduck**](/src/tapiduck/README.md): End-to-end type-safe APIs with fullstack intillisense. Simple and restful-ish.
- [**Patchduck**](/src/patchduck/README.md): TS-first, React-friendly utility for deep-patching (deep-spreading) objects.
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
- Prefer `if`..`else` over `switch`. (Latter is OK if each `case` just returns.)
