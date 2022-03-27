import React from 'react'
import type { VFC } from 'react'
import * as store from '../qna-store'

const JoinAMeeting: VFC = function () {
  const [meetingId, setMeetingId] = React.useState('')
  const onSubmit = React.useCallback(async function (event) {
    event.preventDefault()
    alert(meetingId)
    store.thisMeetingId.set(meetingId)
  }, [store.thisMeetingId, meetingId])
  return (
    <div>
      <h2>Join A Live QnA Session</h2>
      <form className='pure-form' onSubmit={onSubmit}>
        <p>
          <input
            type='text' style={{ width: 320 }} placeholder='Session ID'
            onChange={evt => setMeetingId(evt.target.value)}
          />
        </p>
        <p>
          <button className='pure-button'>Go!</button> {JSON.stringify(meetingId)}
        </p>
      </form>
      <p>Paste the Session ID above to join the session.</p>
    </div>
  )
}

const HostMeetings: VFC = function () {
  const [username, setUsername] = React.useState('')
  const [pw, setPw] = React.useState('')
  return (
    <div>
      <h2>Host Your Own QnA Sessions</h2>
      <p>Participants can upvote questions, so you know what your audience wants.</p>
      <form className='pure-form'>
        <p>
          <input type='text' style={{ width: 320 }} placeholder='Username' onChange={evt => setUsername(evt.target.value)} />
          {username}
        </p>
        <p>
          <input type='password' style={{ width: 320 }} placeholder='Password' onChange={evt => setPw(evt.target.value)} />
          {pw}
        </p>
        <p>
          <button className='pure-button pure-button-primary'>Sign Up / Log In</button>
        </p>
      </form>
      <p>The form for signing up and logging in is the same. Give it a whirl!</p>
    </div>
  )
}

export const Home: VFC = function () {
  return (
    <div className='home'>
      <h1>QnaDuck</h1>
      <p>Live QnAs for online/hybrid meetings.</p>
      <hr />
      <JoinAMeeting />
      <hr />
      <HostMeetings />
    </div>
  )
}
