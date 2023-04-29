import express from 'express'
import cors from 'cors'
import { tapiduck } from '../../../index-monoduck'
import { producerApi, PRODUCER_PORT } from './isofetch-shared'

const factorial = (n: number): number => n <= 1 ? 1 : n * factorial(n - 1)
const square = (n: number): number => n * n

const router = express.Router()

tapiduck.route(router, producerApi.factorial, async function (reqData, jsend) {
  // if (reqData.n > 100) {
  //   return jsend.fail('Not supported, for n greater than 100.')
  // }
  const ans = factorial(reqData.n)
  console.log(`factorial(${reqData.n}) -> ${ans}`)
  if (ans === 100) {
    return jsend.fail('Max n is 100')
  }
  return jsend.success({ ans })
})
tapiduck.route(router, producerApi.square, async function (reqData, jsend) {
  return jsend.success({ ans: square(reqData.n) })
})

const app = express()
app.use(cors(), express.json(), router)
app.get('/', (_req, res) => { res.send('Hello World!') })
app.listen(PRODUCER_PORT, function () {
  console.log(`Producer API listening @ port ${PRODUCER_PORT}...`)
})
