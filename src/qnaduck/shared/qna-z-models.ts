// Note: Here, 'user' and 'presenter' are used as synonyms.

import { z } from 'zod'

export const zBoolish = z.number() // Use numbers (vs bools) for SQLite compat

// not exported
const zBase = z.object({
  id: z.string(),
  created_at: z.number(),
  updated_at: z.number()
})

export const zUserSensitive = zBase.merge(z.object({
  name: z.string(),
  email: z.string(),
  pw_hash: z.string()
}))

export const zUser = zUserSensitive.omit({
  pw_hash: true
})

export const zMeeting = zBase.merge(z.object({
  presenter_id: z.string(),
  title: z.string(),
  moderated: zBoolish,
  archived: zBoolish
}))

export const zParticipant = zBase.merge(z.object({
  meeting_id: z.string(),
  nickname: z.string()
}))

export const zQuestion = zBase.merge(z.object({
  // meeting_id: z.string(),
  participant_id: z.string(),
  // presenter_id: z.string(),
  text: z.string(),
  approved: zBoolish,
  archived: zBoolish
}))

export const zVote = zBase.merge(z.object({
  question_id: z.string(),
  participant_id: z.string()
  // meeting_id: z.string(),
  // presenter_id: z.string(),
}))
