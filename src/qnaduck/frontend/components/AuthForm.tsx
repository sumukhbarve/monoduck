import React from 'react'
import type { VFC } from 'react'
import * as store from '../qna-store'
import { tapiduck } from '../../indeps-qnaduck'
import * as api from '../../shared/qna-endpoints'
import { Input } from './Input'

export const AuthForm: VFC<{mode: 'Sign Up' | 'Log In'}> = function ({ mode }) {
  const [username, setUsername] = React.useState('')
  const [pw, setPw] = React.useState('')
  const [pw2, setPw2] = React.useState('')

  const endpoint = mode === 'Sign Up' ? api.signup : api.login
  const onSubmit = React.useCallback(async function (evt: React.FormEvent) {
    evt.preventDefault()
    if (mode === 'Sign Up' && pw !== pw2) {
      window.alert("Passwords don't match. Please retry.")
      return null
    }
    store.loading.set('Processing ...')
    const resData = await tapiduck.fetch(endpoint, { username, pw })
    store.me.set({
      type: 'presenter',
      self: resData.user,
      token: resData.userTok
    })
    store.loading.set('')
  }, [mode, endpoint, username, pw, pw2])

  return (
    <form className='pure-form' onSubmit={onSubmit}>
      <Input label='Username' value={username} setValue={setUsername} />
      <Input isPw label='Password' value={pw} setValue={setPw} />
      {mode === 'Sign Up' && <Input isPw label='Repeat Password' value={pw2} setValue={setPw2} />}
      <p>
        <button className='pure-button pure-button-primary'>{mode}</button>
      </p>
    </form>
  )
}
