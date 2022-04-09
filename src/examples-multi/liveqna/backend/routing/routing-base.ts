import express from 'express'
import { tapiduck } from '../../indeps-liveqna'
import { ping as api_ping } from '../../shared/qna-endpoints'

export const expressRouter = express.Router()
export const tapiRoute = tapiduck.routeUsing(expressRouter)

tapiRoute(api_ping, async function (reqData) {
  return { pong: reqData.ping }
})
