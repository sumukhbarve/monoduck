import React from 'react'
import { store, useStore } from './duckpond-store'
import ReactDOM from 'react-dom'

import { lookduck } from '../../../index-monoduck'

const DuckCountHeading: React.FC = function () {
  const { duckCount, duckNoun } = useStore('duckCount', 'duckNoun')
  return <h3>Duck Count: {duckCount} {duckNoun}</h3>
}

const DuckAdder: React.FC<{delta: number, label: string}> = function (props) {
  const { delta, label } = props
  const onAdd = (): void => store.duckCount.set(store.duckCount.get() + delta)
  return <button onClick={onAdd}>{label}</button>
}

const LowCountWarning: React.FC = function () {
  const { isTooLow } = useStore('isTooLow')
  return isTooLow ? <p>Warning: There are too few ducks. Add some!</p> : null
}

const countAtom = lookduck.atom(0)
const doubleCountAtom = lookduck.atom(get => get(countAtom) * 2)

const Counter: React.FC = function () {
  const [count, setCount] = lookduck.useAtom(countAtom)
  const [doubleCount] = lookduck.useAtom(doubleCountAtom)
  const onIncrement = React.useCallback(() => {
    setCount(count + 1)
  }, [count])
  return (
    <>
      <hr />
      <h4>Unrelated Counter:</h4>
      <p>The count is {count}, and twice that is {doubleCount}.</p>
      <button onClick={onIncrement}>Increment count</button>
    </>
  )
}

const DuckPondApp: React.VFC = function () {
  return (
    <>
      <DuckCountHeading />
      <DuckAdder delta={+1} label='Add a duck' />{' '}
      <DuckAdder delta={-2} label='Remove two ducks' />{' '}
      <DuckAdder delta={+5} label='Add five ducks' />{' '}
      <LowCountWarning />
      <Counter />
    </>
  )
}

ReactDOM.render(<DuckPondApp />, document.querySelector('#root'))
