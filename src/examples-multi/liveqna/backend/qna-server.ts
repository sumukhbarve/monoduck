import path from 'path'
import express from 'express'
import cors from 'cors'
import { expressRouter } from './routing/routing-base'
import { liveqnaDir } from '../shared/qna-misc'

const app = express().use(cors(), express.json(), expressRouter)

app.use('/', express.static(path.join(liveqnaDir, '/frontend/dist')))

app.get('/', (_req, res) => res.redirect('/qna-client.html'))

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Listening at port ${PORT} ...`)
})
