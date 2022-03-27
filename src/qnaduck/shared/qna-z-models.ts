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
  username: z.string(),
  pw_hash: z.string()
}))
export type ZUserSensitive = z.infer<typeof zUserSensitive>

export const zUser = zUserSensitive.omit({
  pw_hash: true
})
export type ZUser = z.infer<typeof zUser>

export const zMeeting = zBase.merge(z.object({
  presenter_id: z.string(),
  title: z.string(),
  moderated: zBoolish,
  archived: zBoolish
}))
export type ZMeeting = z.infer<typeof zMeeting>

export const zParticipant = zBase.merge(z.object({
  meeting_id: z.string(),
  nickname: z.string()
}))
export type ZParticipant = z.infer<typeof zParticipant>

export const zQuestion = zBase.merge(z.object({
  meeting_id: z.string(),
  participant_id: z.string(),
  // presenter_id: z.string(),
  text: z.string(),
  approved: zBoolish,
  archived: zBoolish
}))
export type ZQuestion = z.infer<typeof zQuestion>

export const zVote = zBase.merge(z.object({
  question_id: z.string(),
  participant_id: z.string()
  // meeting_id: z.string(),
  // presenter_id: z.string(),
}))
export type ZVote = z.infer<typeof zVote>
