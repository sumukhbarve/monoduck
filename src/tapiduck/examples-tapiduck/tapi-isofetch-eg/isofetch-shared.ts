import { z } from 'zod'
import { tapiduck } from '../../index-tapiduck'

export const PRODUCER_PORT = 5050
export const CONSUMER_PORT = 5055

export const producerApi = {
  factorial: tapiduck.endpoint({
    path: '/papi/factorial',
    zRequest: z.object({ n: z.number() }),
    zSuccess: z.object({ ans: z.number() }),
    zFail: z.string()
  }),
  square: tapiduck.endpoint({
    path: '/papi/square',
    zRequest: z.object({ n: z.number() }),
    zSuccess: z.object({ ans: z.number() }),
    zFail: z.string()
  })
} as const
