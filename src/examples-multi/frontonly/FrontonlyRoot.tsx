// Prelims:
import React from 'react'
import ReactDOM from 'react-dom'
import { roqsduck } from './indeps-frontonly'

const { Link, useRouteInfo } = roqsduck.injectReact(React)

// Create (or import) route-specific components:
const RouteAAA: React.VFC = () => <h2>Hello AAA</h2>
const RouteBBB: React.VFC = () => <h2>Hello BBB</h2>
const RouteCCC: React.VFC = () => <h2>Hello CCC</h2>
const RouteDefault: React.VFC = () => <h2>Hello Default</h2>

// Set up a routing map based on query-string id.
const routeMap: Record<string, React.ReactElement> = {
  aaa: <RouteAAA />,
  bbb: <RouteBBB />,
  ccc: <RouteCCC />
}

// In your top-level element, pick and reder the route.
const FrontonlyRoot: React.VFC = function () {
  const routeInfo = useRouteInfo()
  const routeEl = routeMap[routeInfo.id] ?? <RouteDefault />
  const [val, setVal] = React.useState('')
  return (
    <div>
      <h1>Frontonly</h1>
      <p>Testing, testing, 1, 2, 3, 4.</p>
      <nav>
        <Link to={{ id: 'aaa' }}>Aaa</Link> |{' '}
        <Link to={{ id: 'bbb' }}>Bbb</Link> |{' '}
        <Link to={{ id: 'ccc' }}>Ccc</Link> |{' '}
        <Link to={{ id: 'other' }}>Other</Link>
      </nav>
      <hr />
      {routeEl}
      <hr />
      <textarea value={val} onChange={evt => setVal(evt.currentTarget.value)} />
      <pre>{val}</pre>
      <button onClick={() => roqsduck.setRouteInfo(JSON.parse(val))}>Set QS</button>
      <pre>{JSON.stringify(routeInfo)}</pre>
    </div>
  )
}

ReactDOM.render(<FrontonlyRoot />, document.querySelector('#root'))
