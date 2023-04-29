import { z } from 'zod'
import { tapiduck } from '../../../index-monoduck'

export interface User {
  nick: string
}

export interface Channel {
  name: string
}

export const zMsg = z.object({
  id: z.string(),
  fromNick: z.string(),
  channelName: z.string(),
  msgText: z.string()
})
export type Msg = z.infer<typeof zMsg>

const zTok = z.object({ tok: z.string() })
const zOk = z.object({ ok: z.literal(true) })

// eslint-disable-next-line @typescript-eslint/naming-convention
export const api_claimNick = tapiduck.endpoint({
  path: '/api/claimNick',
  zRequest: z.object({ desiredNick: z.string() }),
  zSuccess: z.object({ nick: z.string(), tok: z.string() }),
  zFail: z.string()
})

// eslint-disable-next-line @typescript-eslint/naming-convention
export const api_joinChannel = tapiduck.endpoint({
  path: '/api/joinChannel',
  zRequest: zTok.extend({ channelName: z.string(), socketId: z.string() }),
  zSuccess: z.object({ channelName: z.string() }),
  zFail: z.string()
})

// eslint-disable-next-line @typescript-eslint/naming-convention
export const api_getChannelMsgs = tapiduck.endpoint({
  path: '/api/getChannelMsgs',
  zRequest: zTok.extend({ channelName: z.string() }),
  zSuccess: z.object({ msgs: z.array(zMsg) }),
  zFail: z.string()
})

// eslint-disable-next-line @typescript-eslint/naming-convention
export const api_sendChannelMsg = tapiduck.endpoint({
  path: '/api/sendChannelMsg',
  zRequest: zTok.extend({ channelName: z.string(), msgText: z.string() }),
  zSuccess: zOk,
  zFail: z.string()
})

// eslint-disable-next-line @typescript-eslint/naming-convention
export const sock_msgFromServer = tapiduck.sockpoint({
  name: 'msgFromServer',
  zData: zMsg
})
