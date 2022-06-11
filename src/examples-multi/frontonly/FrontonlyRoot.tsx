// Prelims:
import React from 'react'
import ReactDOM from 'react-dom'
import { roqsduck, lookduck } from './indeps-frontonly'

const { Link, useRouteInfo } = roqsduck.injectReact(React)
const useLookable = lookduck.makeUseLookable(React)

// Create (or import) route-specific components:
const RouteAAA: React.VFC = () => <h2>Hello AAA</h2>
const RouteBBB: React.VFC = () => <h2>Hello BBB</h2>
const RouteCCC: React.VFC = () => <h2>Hello CCC</h2>
const NoSuchRoute: React.VFC = () => <h2>No Such Route</h2>

const EmptyRoute: React.VFC = function () {
  roqsduck.setRouteInfo({ id: 'aaa', from: 'EmptyRoute' })
  return null
}

const obCount = lookduck.observable(0)
const CounterRoute: React.VFC = function () {
  const count = useLookable(obCount)
  if (count === 0) { obCount.set(100) }
  // React.useEffect(() => obCount.set(100), [])
  return (
    <div>
      Count = {count}<br />
      <button onClick={() => obCount.set(count + 1)}>+1</button>
    </div>
  )
}

export const BrokenCounter: React.VFC = () => {
  const [count, setCount] = React.useState(0)
  setCount(100)
  return <div>Count = {count}</div>
}

// Set up a routing map based on query-string id.
const routeMap: Record<string, React.VFC> = {
  aaa: RouteAAA,
  bbb: RouteBBB,
  ccc: RouteCCC,
  '': EmptyRoute,
  counter: CounterRoute
}

const ActiveRoute: React.VFC = function () {
  const routeInfo = useRouteInfo()
  const RouteComponent = routeMap[routeInfo.id] ?? NoSuchRoute
  return <RouteComponent />
}

// In your top-level element, pick and reder the route.
const FrontonlyRoot: React.VFC = function () {
  const routeInfo = useRouteInfo()
  const [val, setVal] = React.useState('')
  return (
    <div>
      <h1>Frontonly</h1>
      <p>Testing, testing, 1, 2, 3, 4.</p>
      <nav>
        <Link to={{ id: 'aaa' }}>Aaa</Link> |{' '}
        <Link to={{ id: 'bbb' }}>Bbb</Link> |{' '}
        <Link to={{ id: 'ccc' }}>Ccc</Link> |{' '}
        <Link to={{ id: 'counter' }}>Counter</Link> |{' '}
        <Link to={{ id: 'other' }}>Other</Link>
      </nav>
      <hr />
      <ActiveRoute />
      <hr />
      <textarea value={val} onChange={evt => setVal(evt.currentTarget.value)} />
      <pre>{val}</pre>
      <button onClick={() => roqsduck.setRouteInfo(JSON.parse(val))}>
        Set QS
      </button>
      <pre>{JSON.stringify(routeInfo)}</pre>
    </div>
  )
}

ReactDOM.render(<FrontonlyRoot />, document.querySelector('#root'))
