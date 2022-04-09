import { z } from 'zod'
import {
  zBoolish, zUser, zMeeting, zParticipant, zQuestion, zVote
} from './qna-z-models'
import { tapiduck } from '../indeps-liveqna'

const zUserTok = z.object({ userTok: z.string() })
const zParticipantTok = z.object({ participantTok: z.string() })

export const ping = tapiduck.endpoint({
  path: '/api/ping',
  zReq: z.object({ ping: z.string() }),
  zRes: z.object({ pong: z.string() })
})

export const signup = tapiduck.endpoint({
  path: '/api/signup',
  zReq: z.object({
    username: z.string(),
    pw: z.string()
  }),
  zRes: zUserTok.merge(z.object({
    user: zUser
  }))
})

export const login = tapiduck.endpoint({
  ...signup,
  path: '/api/login'
})

export const listMeetings = tapiduck.endpoint({
  path: '/api/listMeetings',
  zReq: zUserTok,
  zRes: z.array(zMeeting)
})

export const createMeeting = tapiduck.endpoint({
  path: '/api/createMeeting',
  zReq: zUserTok.merge(z.object({
    meeting_title: z.string()
  })),
  zRes: zMeeting
})

export const updateMeeting = tapiduck.endpoint({
  path: '/api/updateMeeting',
  zReq: zUserTok.merge(z.object({
    meeting: zMeeting.pick({
      id: true,
      title: true,
      moderated: true,
      archived: true
    })
  })),
  zRes: zMeeting
})

// Participant-oriented routes follow '*AsParticipant' nomenclature.
export const joinAsParticipant = tapiduck.endpoint({
  path: '/api/joinAsParticipant',
  zReq: z.object({
    meeting_id: z.string(),
    participant_nickname: z.string()
  }),
  zRes: zParticipantTok.merge(z.object({
    participant: zParticipant
  }))
})

export const askQuestionAsParticipant = tapiduck.endpoint({
  path: '/api/askQuestionAsParticipant',
  zReq: zParticipantTok.merge(z.object({
    text: z.string()
  })),
  zRes: zQuestion
})

export const updateQuestionAsParticipant = tapiduck.endpoint({
  path: '/api/updateQuestionAsParticipant',
  zReq: zParticipantTok.merge(z.object({
    question: zQuestion.pick({
      id: true,
      text: true,
      archived: true
    })
  })),
  zRes: zQuestion
})

export const moderateQuestion = tapiduck.endpoint({
  path: '/api/approveQuestion',
  zReq: zUserTok.merge(z.object({
    question_id: z.string()
  })),
  zRes: zQuestion
})

export const toggleVoteAsParticipant = tapiduck.endpoint({
  path: '/api/toggleVoteAsParticipant',
  zReq: zParticipantTok.merge(z.object({
    question_id: z.string(),
    upvote: zBoolish
  })),
  zRes: zVote
})
