// Prelims:
import React from 'react'
import ReactDOM from 'react-dom'
import { roqsduck, lookduck, _ } from './indeps-frontonly'
import { io } from 'socket.io-client'

_.noop()

const { Link, useRouteInfo } = roqsduck.injectReact(React)
const { useLookable, useLookables } = lookduck.injectReact(React)

// Create (or import) route-specific components:
const RouteAAA: React.VFC = () => <h2>Hello AAA</h2>
const RouteBBB: React.VFC = () => <h2>Hello BBB</h2>
const RouteCCC: React.VFC = () => <h2>Hello CCC</h2>
const NoSuchRoute: React.VFC = () => <h2>No Such Route</h2>

const EmptyRoute: React.VFC = function () {
  roqsduck.setRouteInfo({ id: 'aaa', from: 'empty' })
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

const lkX = lookduck.observable(1)
const lkY = lookduck.computed(() => lkX.get() * 2)
const lkZ = lookduck.computed(() => lkY.get() / 2)
const OldXyzRoute: React.VFC = function () {
  const xyz = {
    x: useLookable(lkX, { debounce: false }),
    y: useLookable(lkY, { debounce: false }),
    z: useLookable(lkZ, { debounce: false })
  }
  return (
    <div>
      <pre>{_.pretty(xyz)}</pre>
      <button onClick={() => lkX.set(lkX.get() + 1)}>x += 1</button>
    </div>
  )
}
const NewXyzRoute: React.VFC = function () {
  const xyz = useLookables({ x: lkX, y: lkY, z: lkZ }, { debounce: 1 })
  return (
    <div>
      <pre>{_.pretty(xyz)}</pre>
      <button onClick={() => lkX.set(lkX.get() + 1)}>x += 1</button>
    </div>
  )
}

export const BrokenCounter: React.VFC = () => {
  const [count, setCount] = React.useState(0)
  setCount(100)
  return <div>Count = {count}</div>
}

const socket = io('http://localhost:3000', { transports: ['websocket'] })
const obSockObjs = lookduck.observable<unknown[]>([])
socket.on('flagNotifFromServer', function (data: unknown) {
  obSockObjs.set([data, ...obSockObjs.get()])
})
const SockViewer: React.VFC = function () {
  return <pre>{_.pretty(useLookable(obSockObjs))}</pre>
}

// Set up a routing map based on query-string id.
const routeMap: Record<string, React.VFC> = {
  aaa: RouteAAA,
  bbb: RouteBBB,
  ccc: RouteCCC,
  '': EmptyRoute,
  counter: CounterRoute,
  sock: SockViewer,
  oldXyz: OldXyzRoute,
  newXyz: NewXyzRoute
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
        <Link to={{ id: 'sock' }}>Sock</Link> |{' '}
        <Link to={{ id: 'oldXyz' }}>oldXyz</Link> |{' '}
        <Link to={{ id: 'newXyz' }}>newXyz</Link> |{' '}
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
