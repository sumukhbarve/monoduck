import React from 'react'
import ReactDOM from 'react-dom'
import { io } from 'socket.io-client'
import { tapiduck, _ } from '../../../index-monoduck'
import * as shared from './chatter-shared'
import * as store from './chatter-store'

// Socket Realted: /////////////////////////////////////////////////////////////
const socket = io()

const joinChannel = async function (channelName: string): Promise<void> {
  const me = store.me.get()
  if (_.not(me)) { return undefined }
  const joinRes = await tapiduck.fetch(shared.api_joinChannel, {
    channelName,
    tok: me.tok,
    socketId: socket.id
  })
  if (joinRes.status !== 'success') {
    alert('Joining failed')
    return undefined
  }
  store.thisChannelName.set(joinRes.data.channelName)

  const getRes = await tapiduck.fetch(shared.api_getChannelMsgs, {
    channelName: joinRes.data.channelName,
    tok: me.tok
  })
  if (getRes.status !== 'success') {
    alert('could not get channel messages')
    return undefined
  }
  store.addMsgs(getRes.data.msgs)
}

socket.on('connect', function () {
  const channelName = store.thisChannelName.get()
  if (_.bool(channelName)) {
    joinChannel(channelName).catch(_.noop)
  }
})
// socket.on('msgFromServer', function (sdata: unknown) {
//   const msg: shared.Msg = shared.zMsg.parse(sdata)
//   console.log(msg)
//   store.addMsg(msg)
// })
tapiduck.sockOn(socket, shared.sock_msgFromServer, function (msg) {
  console.log(msg)
  store.addMsg(msg)
})

// Components: /////////////////////////////////////////////////////////////////
export const Print: React.VFC<{obj: unknown, label?: string}> = function ({ obj, label }) {
  console.log(label, obj)
  return (
    <div>
      <div>{label}</div>
      <pre>{JSON.stringify(obj, null, 4)}</pre>
    </div>
  )
}

const ClaimNick: React.VFC = function () {
  const onClick = async function (): Promise<void> {
    const desiredNick = window.prompt('Desired Nick: ')
    if (!_.stringIs(desiredNick)) { return undefined }
    const resData = await tapiduck.fetch(shared.api_claimNick, { desiredNick })
    if (resData.status !== 'success') {
      alert('could not claim')
      return undefined
    }
    store.me.set(resData.data)
  }
  return <button onClick={onClick}>Claim a nickname</button>
}

const ChannelSelector: React.VFC = function () {
  const me = store.use(store.me)
  const thisChannelName = store.use(store.thisChannelName)
  if (_.not(me)) { return null }
  const onClick = async function (): Promise<void> {
    const channelName = window.prompt('Channel Name: ')
    if (!_.stringIs(channelName)) { return undefined }
    joinChannel(channelName).catch(_.noop)
  }
  return (
    <div>
      <h4>Channel: {_.bool(thisChannelName) ? thisChannelName : <i>(blank)</i>}</h4>
      <button onClick={onClick}>
        Join {_.bool(thisChannelName) ? 'another' : 'a'} channel
      </button>
      <hr />
    </div>
  )
}

const ChatMsgLi: React.VFC<{msg: shared.Msg}> = function ({ msg }) {
  return <li><i>@{msg.fromNick}</i>: {msg.msgText}</li>
}

const ChatMsgList: React.VFC = function () {
  const theseMsgs = store.use(store.theseMsgs)
  return (
    <ul>
      {theseMsgs.map(msg => <ChatMsgLi msg={msg} key={msg.id} />)}
    </ul>
  )
}

const ChatForm: React.VFC = function () {
  const me = store.use(store.me)
  const thisChannelName = store.use(store.thisChannelName)
  if (_.not(me)) { return null }
  const onClick = async function (): Promise<void> {
    const msgText = window.prompt('Message Text: ')
    if (!_.stringIs(msgText)) { return undefined }
    await tapiduck.fetch(shared.api_sendChannelMsg, {
      channelName: thisChannelName,
      msgText: msgText,
      tok: me.tok
    })
  }
  return <button onClick={onClick}>Add message</button>
}

const ChatRoot: React.VFC = function () {
  const me = store.use(store.me)
  if (_.not(me)) {
    return <ClaimNick />
  }
  return (
    <>
      <ChannelSelector />
      <ChatForm />
      <ChatMsgList />
    </>
  )
}

// Finally: ////////////////////////////////////////////////////////////////////
ReactDOM.render(<ChatRoot />, document.querySelector('#root'))

// Debug aid:
Object.assign(window, { store })
