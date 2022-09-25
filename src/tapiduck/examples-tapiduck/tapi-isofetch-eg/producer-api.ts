import express from 'express'
import cors from 'cors'
import { tapiduck } from '../../index-tapiduck'
import { producerApi, PRODUCER_PORT } from './isofetch-shared'

const factorial = (n: number): number => n <= 1 ? 1 : n * factorial(n - 1)
const square = (n: number): number => n * n

const router = express.Router()

tapiduck.route(router, producerApi.factorial, async function (reqData) {
  return { ans: factorial(reqData.n) }
})
tapiduck.route(router, producerApi.square, async function (reqData) {
  return { ans: square(reqData.n) }
})

const app = express()
app.use(cors(), express.json(), router)
app.get('/', (_req, res) => { res.send('Hello World!') })
app.listen(PRODUCER_PORT, function () {
  console.log(`Producer API listening @ port ${PRODUCER_PORT}...`)
})
