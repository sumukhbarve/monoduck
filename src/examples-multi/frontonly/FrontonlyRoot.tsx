// Prelims:
import React from 'react'
import ReactDOM from 'react-dom'
import { roqsduck, lookduck, _, injectReact } from './indeps-frontonly'
import { io } from 'socket.io-client'
import { nameStore } from './nameStore'
import { useLookables, useLookable } from '../../lookduck/react-hook'
import { atom, useAtom } from '../../lookduck/atom'
import { patchduck } from '../../patchduck/index-patchduck'

_.noop()

injectReact(React)
roqsduck.injectReact(React)
const { LinkFC: Link, useRouteInfo } = roqsduck
lookduck.injectReact(React)

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
    x: useLookable(lkX, { debounce: null }),
    y: useLookable(lkY, { debounce: null }),
    z: useLookable(lkZ, { debounce: null })
  }
  return (
    <div>
      <pre>{_.pretty(xyz)}</pre>
      <button onClick={() => lkX.set(lkX.get() + 1)}>x += 1</button>
    </div>
  )
}
const NewXyzRoute: React.VFC = function () {
  const xyz = useLookables({ x: lkX, y: lkY, z: lkZ })
  return (
    <div>
      <pre>{_.pretty(xyz)}</pre>
      <button onClick={() => lkX.set(lkX.get() + 1)}>x += 1</button>
    </div>
  )
}

const NamesEtc: React.VFC = function () {
  const { f, l, fl, lf, fllf } = lookduck.usePickLookables(nameStore, [
    'f', 'l', 'fl', 'lf', 'fllf'
  ])
  return (
    <div>
      F: <input value={f} onChange={e => nameStore.f.set(e.target.value)} />
      <br />
      L: <input value={l} onChange={e => nameStore.l.set(e.target.value)} />
      <br />
      FL: {fl}
      <br />
      LF: {lf}
      <br />
      FLLF: {fllf}
    </div>
  )
}

export const BrokenCounter: React.VFC = function () {
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

const msgAtom = atom('Sample message')
const countAtom = atom(10)
const doubleAtom = atom(get => get(countAtom) * 2)
const RouteAtom: React.VFC = function () {
  const [msg, setMsg] = useAtom(msgAtom)
  const [count, setCount] = useAtom(countAtom)
  const [doubleCount, setDoubleCount] = useAtom(doubleAtom)
  return (
    <div>
      <p>Show Message: {msg}</p>
      Edit Message: <input value={msg} onChange={e => setMsg(e.target.value)} />
      <hr />
      <p>Count: {count}</p>
      <p>Double Count: {doubleCount}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <p />
      <button onClick={() => setDoubleCount(count + 1)}>
        Attempt setting derived atom. Should throw! Click and see console.
      </button>
    </div>
  )
}

const usePatchable = patchduck.makeUsePatchable(React)
const RoutePatchduckUser: React.FC = function () {
  const JOHN = {
    name: { first: 'John', last: 'Doe' },
    contact: { email: 'john.doe@example.com', phone: '555-555-5555' },
    address: {
      home: { line1: 'Line 1', zip: '10002', city: 'NYC', state: 'NY' },
      work: null
    }
  }
  type User = typeof JOHN
  // _.deepClone can be replaced by _.identity, it's just an optional extra
  const [user, patchUser] = usePatchable<User>(_.deepClone(JOHN))
  return (
    <div>
      <h4>User:</h4>
      <pre>{JSON.stringify(user, null, 4)}</pre>
      <h4>First Name:</h4>
      <input
        value={user.name.first}
        onChange={event => patchUser({ name: { first: event.target.value } })}
      />
    </div>
  )
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
  newXyz: NewXyzRoute,
  nameEtc: NamesEtc,
  atom: RouteAtom,
  patchduckUser: RoutePatchduckUser
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
        <Link to={{ id: 'nameEtc' }}>NameEtc</Link> |{' '}
        <Link to={{ id: 'atom' }}>Atom</Link> |{' '}
        <Link to={{ id: 'patchduckUser' }}>PatchduckUser</Link> |{' '}
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
