import { z } from 'zod'
import { tapiduck } from './indeps-chatter'

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
  zReq: z.object({ desiredNick: z.string() }),
  zRes: z.object({ nick: z.string(), tok: z.string() })
})

// eslint-disable-next-line @typescript-eslint/naming-convention
export const api_joinChannel = tapiduck.endpoint({
  path: '/api/joinChannel',
  zReq: zTok.extend({ channelName: z.string(), socketId: z.string() }),
  zRes: z.object({ channelName: z.string() })
})

// eslint-disable-next-line @typescript-eslint/naming-convention
export const api_getChannelMsgs = tapiduck.endpoint({
  path: '/api/getChannelMsgs',
  zReq: zTok.extend({ channelName: z.string() }),
  zRes: z.object({ msgs: z.array(zMsg) })
})

// eslint-disable-next-line @typescript-eslint/naming-convention
export const api_sendChannelMsg = tapiduck.endpoint({
  path: '/api/sendChannelMsg',
  zReq: zTok.extend({ channelName: z.string(), msgText: z.string() }),
  zRes: zOk
})

// eslint-disable-next-line @typescript-eslint/naming-convention
export const sock_msgFromServer = tapiduck.sockpoint({
  name: 'msgFromServer',
  zData: zMsg
})
