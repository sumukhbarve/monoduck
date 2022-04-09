import React from 'react'
import type { VFC } from 'react'
import ReactDOM from 'react-dom'
import * as store from './qna-store'

import { Home } from './components/Home'
import { Participate } from './components/Participate'
import { _ } from '../indeps-liveqna'

const QnaRoot: VFC = function () {
  const me = store.use(store.me)
  const thisMeetingId = store.use(store.thisMeetingId)
  if (_.bool(thisMeetingId)) {
    return <Participate />
  }
  if (_.not(me)) {
    return <Home />
  }
  return <h2>Non-Anon</h2>
}

ReactDOM.render(<QnaRoot />, document.querySelector('#root'))

Object.assign(window, { store: store })
