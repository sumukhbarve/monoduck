# `_ringduck`

- Meant for internal use only.
- Helps accept React as an INJected dependency throughout Monoduck.
    - Ensures that different ducks don't receive different versions of React.
- _rinJduck_ doesn't sound great, so _rinGduck_ instead.

Other ducks can:
- Expose (this duck's) `injectReact()` for accepting React, and
- call (this duck's) `getInjectedReact()` for accessing React.
