import { z } from 'zod'
import { tapiduck } from '../../index-tapiduck'

export const PRODUCER_PORT = 5050
export const CONSUMER_PORT = 5055

export const producerApi = {
  factorial: tapiduck.endpoint({
    path: '/papi/factorial',
    zReq: z.object({ n: z.number() }),
    zRes: z.object({ ans: z.number() })
  }),
  square: tapiduck.endpoint({
    path: '/papi/square',
    zReq: z.object({ n: z.number() }),
    zRes: z.object({ ans: z.number() })
  })
} as const
