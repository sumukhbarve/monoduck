import path from 'path'
import http from 'http'
import express from 'express'
import cors from 'cors'
import { Server } from 'socket.io'
import { tapiduck, _ } from '../../../index-monoduck'
import * as shared from './chatter-shared'

// Prelims:
const app = express()
app.use(cors())
app.use(express.json())
const httpServer = http.createServer(app)
const io = new Server(httpServer)
app.use(express.static(path.join(__dirname, '/dist')))
app.get('/', (_req, res) => res.redirect('/chatter-client.html'))

// Backend data model:
const nickSet = new Set<string>()
const joinInfoSet = new Set<string>()
const msgList = new Array<shared.Msg>()

// API Routing:
const apiRouter = express.Router()
app.use(apiRouter)
const tapiRoute = tapiduck.routeUsing(apiRouter)

tapiRoute(shared.api_claimNick, async function (reqData, jsend) {
  const dNick = reqData.desiredNick
  const nick = nickSet.has(dNick) ? String(Date.now()) : dNick
  const tok = JSON.stringify({ toy: true, nick: nick })
  // console.log({ nick, tok })
  return jsend.success({ nick, tok })
})

const readTok = function (tok: string): string | null {
  let d: unknown
  try {
    d = JSON.parse(tok)
    if (_.plainObjectIs(d) && _.stringIs(d.nick)) { return d.nick }
  } catch (e: unknown) {
    _.noop()
  }
  return null
}

tapiRoute(shared.api_joinChannel, async function (reqData, jsend) {
  const { tok, channelName, socketId } = reqData
  const nick = readTok(tok)
  if (_.not(nick)) { return jsend.fail('auth error') }
  const joinInfo = JSON.stringify({ nick, channelName })
  joinInfoSet.add(joinInfo)
  io.in(socketId).socketsJoin(channelName)
  return jsend.success({ channelName })
})

tapiRoute(shared.api_getChannelMsgs, async function (reqData, jsend) {
  const { tok, channelName } = reqData
  const nick = readTok(tok)
  if (_.not(nick)) { return jsend.fail('auth error') }
  const joinInfo = JSON.stringify({ nick, channelName })
  if (_.not(joinInfoSet.has(joinInfo))) {
    return jsend.fail('You have not yet joined this channel')
  }
  return jsend.success({
    msgs: _.filter(msgList, msg => msg.channelName === channelName)
  })
})

tapiRoute(shared.api_sendChannelMsg, async function (reqData, jsend) {
  const { tok, channelName, msgText } = reqData
  const nick = readTok(tok)
  if (_.not(nick)) { return jsend.fail('auth error') }
  const joinInfo = JSON.stringify({ nick, channelName })
  if (_.not(joinInfoSet.has(joinInfo))) {
    return jsend.fail('You have not yet joined this channel')
  }
  const id = `${Date.now()}-${Math.random()}`
  const msg = { id, channelName, fromNick: nick, msgText: msgText }
  msgList.push(msg)
  // io.in(channelName).emit('msgFromServer', msg)
  tapiduck.sockEmit(io.in(channelName), shared.sock_msgFromServer, msg)
  // console.log(msg)
  return jsend.success({ ok: true } as const)
})

app.get('/debug', function (_req, res) {
  res.json(Array.from(joinInfoSet))
})

// Socket:
io.on('connection', function (socket) {
  console.log('user connected ', socket.id)
  socket.on('disconnect', function () {
    console.log('user disconnected ', socket.id)
  })
})

// Running:
const PORT = 3000
httpServer.listen(PORT, () => {
  console.log(`Listening at port ${PORT} ...`)
})
