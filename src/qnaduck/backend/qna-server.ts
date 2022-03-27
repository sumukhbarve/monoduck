import express from 'express'
import cors from 'cors'
import { expressRouter } from './routing/routing-base'

const app = express().use(cors(), express.json(), expressRouter)

app.get('/', (_req, res) => res.send('Hello World!'))

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Listening at port ${PORT} ...`)
})
