import express from 'express'
import { tapiduck } from '../../../index-monoduck'
import { producerApi, PRODUCER_PORT, CONSUMER_PORT } from './isofetch-shared'
import { z } from 'zod'

const PRODUCER_API_URL = `http://localhost:${PRODUCER_PORT}`
const tapiFetch = tapiduck.fetchUsing(PRODUCER_API_URL)

const app = express()

app.get('/factorial', function (req, res, next) {
  (async function () {
    const n = z.number().parse(Number(req.query.n))
    const resp = await tapiFetch(producerApi.factorial, { n })
    if (resp.status !== 'success') {
      res.json(resp)
      return
    }
    const ans = resp.data.ans
    res.send(`
        <h2>Factorial Page</h2>
        <div>n = ${n}</div>
        <div>n! = ${ans}</div>
      `)
  }()).catch(error => next(error))
})

app.get('/square', function (req, res, next) {
  (async function () {
    const n = z.number().parse(Number(req.query.n))
    const resp = await tapiFetch(producerApi.square, { n })
    if (resp.status !== 'success') {
      res.json(resp)
      return
    }
    const ans = resp.data.ans
    res.send(`
        <h2>Square Page</h2>
        <div>n = ${n}</div>
        <div>n<sup>2</sup> = ${ans}</div>
      `)
  }()).catch(error => next(error))
})

app.get('/', function (req, res) {
  res.send(`
    <p>See:</p>
    <ul>
      <li><a href="/factorial?n=0">Factorial Page</a></li>
      <li><a href="/square?n=0">Square Page</a></li>
    </ul>
    <p>QS: ${typeof req.query.n}</;p>
  `)
})

app.listen(CONSUMER_PORT, function () {
  console.log(`Consumer app listening @ port ${CONSUMER_PORT}...`)
})
