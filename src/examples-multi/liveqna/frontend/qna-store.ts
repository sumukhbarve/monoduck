import React from 'react'
import { lookduck, _ } from '../indeps-liveqna'
import type {
  ZUser, ZMeeting, ZParticipant, ZQuestion, ZVote
} from '../shared/qna-z-models'

// Text associated with the loading spinner. '' => not loading.
export const loading = lookduck.observable('')

type Me =
  | null
  | {type: 'presenter', self: ZUser, token: string}
  | {type: 'participant', self: ZParticipant, token: string}

export const me = lookduck.observable<Me>(null)

// All meetings accessible to `me`, meant for presenters.
export const allMeetings = lookduck.observable<ZMeeting[]>([])

// allMeetings, but sorted in DESC order.
export const sortedMeetings = lookduck.computed(function (): ZMeeting[] {
  const meetings = _.deepClone(allMeetings.get())
  return meetings.sort((a, b) => b.created_at - a.created_at)
})

// The currently active meeting. Meant for presenters and participants.
export const thisMeetingId = lookduck.observable('')
export const thisMeeting = lookduck.computed(function () {
  const meetingId = thisMeetingId.get()
  const meetings = allMeetings.get()
  if (_.not(meetingId)) { return null }
  return _.filter(meetings, m => m.id === meetingId)[0] ?? null
})

// All questions globally accessible to `me`. (Presenters and participants.)
export const allQuestions = lookduck.observable<ZQuestion[]>([])

// Questions belonging to thisMeeting.
export const theseQuestions = lookduck.computed(function () {
  const meeting = thisMeeting.get()
  const questions = allQuestions.get()
  if (meeting === null) { return [] }
  return _.filter(questions, q => q.meeting_id === meeting.id)
})

// Helper for grouping questions into 'incoming', 'approved' and 'archived'.
interface QuestionGrouping {
  incoming: ZQuestion[]
  approved: ZQuestion[]
  archived: ZQuestion[]
}
const qGrouper = function (questions: ZQuestion[]): QuestionGrouping {
  const result: QuestionGrouping = {
    incoming: [],
    approved: [],
    archived: []
  }
  _.each(questions, function (q) {
    if (_.bool(q.archived)) {
      result.archived.push(q)
    } else if (_.bool(q.approved)) {
      result.approved.push(q)
    } else {
      result.incoming.push(q)
    }
  })
  return result
}

// Questions belonging to thisMeeting, grouped.
export const theseQGroups = lookduck.computed(function () {
  return qGrouper(theseQuestions.get())
})

// All votes accessible to `me`. (Presenters and participants.)
export const allVotes = lookduck.observable<ZVote[]>([])

// Mapping from question_id to vote-count
export const qvMap = lookduck.computed(function (): Record<string, number> {
  const fmap: Record<string, number> = {}
  _.each(allVotes.get(), function (vote) {
    fmap[vote.question_id] = 1 + (fmap[vote.question_id] ?? 0)
  })
  return fmap
})

// Desc sorted curreny approved questions, first by votes, then by created_at.
export const topQuestions = lookduck.computed(function () {
  const questions = _.shallowClone(theseQGroups.get().approved)
  const qvm = qvMap.get()
  return questions.sort(function (a, b) {
    const voteDiff = (qvm[b.id] ?? 0) - (qvm[a.id] ?? 0)
    const timeDiff = b.created_at - a.created_at
    return _.bool(voteDiff) ? voteDiff : timeDiff
  })
})

export const use = lookduck.makeUseLookable(React)
