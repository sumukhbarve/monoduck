import React from 'react'
import type { VFC } from 'react'
import * as store from '../qna-store'
import { AuthForm } from './AuthForm'
import { Input } from './Input'
import { _ } from '../../indeps-qnaduck'

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
        <Input label='Session ID' value={meetingId} setValue={setMeetingId} />
        <p>
          <button className='pure-button'>Go!</button>
        </p>
      </form>
      <p>Paste the Session ID above to join the session.</p>
    </div>
  )
}

const HostMeetings: VFC = function () {
  const [mode, setMode] = React.useState<null | 'Sign Up' | 'Log In'>(null)
  return (
    <div>
      <h2>Host Your Own QnA Sessions</h2>
      <p>Participants can upvote questions, so you know what your audience wants.</p>
      <p>
        <button
          className={`pure-button ${_.ifel(mode === 'Sign Up', 'pure-button-active', '')}`}
          onClick={() => setMode('Sign Up')}
        >
          Sign Up
        </button>
        &nbsp; &nbsp;
        <button
          className={`pure-button ${_.ifel(mode === 'Log In', 'pure-button-active', '')}`}
          onClick={() => setMode('Log In')}
        >
          Log In
        </button>
      </p>
      {mode !== null && <AuthForm mode={mode} />}
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
