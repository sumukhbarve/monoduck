# Roqsduck

### What is it?
- TypeScript-first routing for React apps; based on the query string.
- Intentionally simple; far simpler than React Router or React Location.
- Ideal for client-rendered apps where most content is behind auth-walls.

### Query Strings & `RouteInfo`
- For the query string `?id=home`, the corresponding route info is `{id: 'home'}`
- And for `?id=pageEditor&pageId=abc'`, the info is `{id: 'pageEditor', pageId: 'abc'}`
- The `RouteInfo` type is defined as: `{id: string} & Record<string, string>`

### Injecting React (Dependency Injection)
- Passing `React` to Roqsduck produces a hook and the link component:
  - `const { useRouteInfo, Link } = roqsduck.injectReact(React)`
- The `useRouteInfo` hook *reactively* returns the current route info.
- The `Link` component is for navigation. Eg. `<Link to={id: 'home'}>Go Home</Link>`
- Alternatively, you can call `roqsduck.setRouteInfo()` to navigate.

### Quickstart
[Create a new React app with TypeScript](https://create-react-app.dev/docs/adding-typescript/#installation), `npm install monoduck`, and edit the `App.tsx`:

```ts
// Prelims:
import React from 'react'
import { roqsduck } from 'monoduck'

const { Link, useRouteInfo } = roqsduck.injectReact(React)

// Create (or import) route-specific components:
const RouteAAA = () => <h2>Hello AAA</h2>
const RouteBBB = () => <h2>Hello BBB</h2>
const RouteCCC = () => <h2>Hello CCC</h2>
const RouteDefault = () => <h2>Hello Default</h2>

// Set up a routing map based on routeInfo.id:
const routeMap: Record<string, React.ReactElement> = {
  aaa: <RouteAAA />,
  bbb: <RouteBBB />,
  ccc: <RouteCCC />
}

// Pick and render the proper route component from the top-level.
export default function App() {
  const routeInfo = useRouteInfo()
  const routeEl = routeMap[routeInfo.id] ?? <RouteDefault />
  return (
    <div>
      <h1>My App Roqs</h1>
      <nav>
        <Link to={{ id: 'aaa' }}>Aaa</Link> |{' '}
        <Link to={{ id: 'bbb' }}>Bbb</Link> |{' '}
        <Link to={{ id: 'ccc' }}>Ccc</Link> |{' '}
        <Link to={{ id: 'other' }}>Other</Link>
      </nav>
      <hr />
      {routeEl}
    </div>
  )
}
```

### Quick Summary

- Calling `roqsduck.injectReact(React)` returns `{ useRouteInfo, Link }`
- The `useRouteInfo` hook tracks the route info corresponding to the current query string.
- To navigate to `id=foo&bar=baz`, call `roqsduck.setRouteInfo({id: 'foo', bar: 'baz'})`
- Alternatively, just use `<Link to={{id: 'foo', bar: 'baz'}}>Visit Foo!</Link>`
