import React from 'react'
import type { VFC } from 'react'
import ReactDOM from 'react-dom'
import { useLookable } from '../index-lookduck'
import { obCount, actIncrementCount } from './counter-store'

const ClickCounter: VFC = function () {
  const count = useLookable(obCount)
  return (
    <p>
      <button onClick={actIncrementCount}>Click Count: {count}</button>
    </p>
  )
}

ReactDOM.render(<ClickCounter />, document.querySelector('#root'))
