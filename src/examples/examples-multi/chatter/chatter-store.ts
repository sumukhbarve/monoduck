import React from 'react'
import { lookduck, _ } from '../../../index-monoduck'
import * as shared from './chatter-shared'

export const loading = lookduck.observable('')

type Me = null | {nick: string, tok: string}
export const me = lookduck.observable<Me>(null)

export const channelNames = lookduck.observable<string[]>([])

export const thisChannelName = lookduck.observable<string>('')

export const msgMap = lookduck.observable<Record<string, shared.Msg>>({})

export const theseMsgs = lookduck.computed(function () {
  const channelName = thisChannelName.get()
  const output = _.filter(Object.values(msgMap.get()), function (msg) {
    return msg.channelName === channelName
  })
  // console.log(output)
  return output
})

export const addMsg = function (msg: shared.Msg): void {
  msgMap.set({
    ...msgMap.get(),
    [msg.id]: msg
  })
}
export const addMsgs = (msgs: shared.Msg[]): void => _.each(msgs, m => addMsg(m))

export const use = lookduck.makeUseLookable(React)
