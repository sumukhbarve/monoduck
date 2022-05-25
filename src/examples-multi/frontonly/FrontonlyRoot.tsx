import React from 'react'
import ReactDOM from 'react-dom'
import type { RouteInfo } from './indeps-frontonly'
import { lookduck, roqsduck } from './indeps-frontonly'

const Link: React.FC<{to: RouteInfo}> = ({ to, children }) => {
  return <a {...roqsduck.hrefAndOnClick(to)}>{children}</a>
}

const useLookable = lookduck.makeUseLookable(React.useState, React.useEffect)
const useRouteInfo = roqsduck.makeUseRouteInfo(useLookable)

const RouteAAA: React.VFC = function () {
  return <h2>I am route AAA</h2>
}

const RouteBBB: React.VFC = function () {
  return <h2>Ich bin Route BBB</h2>
}

const RouteCCC: React.VFC = function () {
  return <h2>Mein hun route CCC</h2>
}

const routeMap: Record<string, React.ReactElement> = {
  aaa: <RouteAAA />,
  bbb: <RouteBBB />,
  ccc: <RouteCCC />
}

const RouteNotFound: React.VFC = function () {
  return <h2>Asa kuthlach route nahi (404ish)</h2>
}

const FrontonlyRoot: React.VFC = function () {
  const routeInfo = useRouteInfo()
  const routeEl = routeMap[routeInfo.id] ?? <RouteNotFound />
  return (
    <div className='clientRoot'>
      <h1>Frontonly</h1>
      <p>Testing, testing, 1, 2, 3, 4.</p>
      <nav>
        <Link to={{ id: 'aaa' }}>aaa</Link> |{' '}
        <Link to={{ id: 'bbb' }}>bbb</Link> |{' '}
        <Link to={{ id: 'ccc' }}>ccc</Link> |{' '}
        <Link to={{ id: 'ddd' }}>ddd</Link>
      </nav>
      <hr />
      {routeEl}
    </div>
  )
}

ReactDOM.render(<FrontonlyRoot />, document.querySelector('#root'))
