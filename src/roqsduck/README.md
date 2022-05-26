# Roqsduck

### What is it?
- Simple, TypeScript firt, routing helper for React apps; based on the query string.
- Pronounced 'rocks duck'. (*'ro'* is short for *ro*uting, and *'qs'* for *q*uery *s*tring.)

### How's it different?
- Roqsduck is *intentionally* simple; far simpler than React Router or React Location.
- It encourages a flat routing structure, but can support nested routing if needed.
- As routing is based on query string, multiple SPAs can be deployed to the same domain.
- It's ideal for apps where content is mostly behind an auth-wall. (Not suitable for SEO.)

### Quick Overview
- For the query string `?id=home`, the corresponding route info is `{id: 'home'}`
- And for `?id=pageEditor&pageId=abc'`, the info is `{id: 'pageEditor', pageId: 'abc'}`
- The `RouteInfo` type is defined as: `{id: string} & Record<string, string>`
- Use the below described `useRouteInfo()` hook to get the route info reactively.
- Call `roqsduck.setRouteInfo({id: 'foo', page: '2'})` to navigate to `?id=foo&page=2`
- Alternatively, for navigation, use the `Link` component described below.

### Indirect React Dependency
- Monoduck (and hence Roqsduck) can't have any hard dependencies. So Roqsduck can't import React.
- But you can pass `React` to `roqsduck.reactIntegration`, thus making it (indirectly) available:
    ```ts
    const { useRouteInfo, Link } = roqsduck.injectReact(React)
    ```
- The `useRouteInfo()` hook reactively returns the latest route info.
- And the `Link` component is for navigation. Eg. `<Link to={{id: 'home'}}>Go Home</Link>`


### Quickstart

**0. Set up a new project via CRA:**
0. `npx create-react-app my-app-roqs --template typescript`
0. `cd my-app-roqs`
0. `npm install monoduck`
0. `npm start`
0. Visit http://localhost:3000, and ensure that the app is running.

**1. Edit (and save) `App.tsx`, and revisit http://localhost:3000**:

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
