import React from 'react'
import type { VFC } from 'react'
import * as store from '../qna-store'

export const Participate: VFC = function () {
  const thisMeeting = store.use(store.thisMeeting)
  if (thisMeeting == null) {
    return <h2>Access Denied</h2>
  }
  return (
    <div className='home'>
      <h1>Session ID: {thisMeeting.id}</h1>
      <p>Live QnAs for online/hybrid meetings.</p>
      <hr />
    </div>
  )
}
