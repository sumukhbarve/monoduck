import express from 'express'
import { tapiduck } from '../../index-tapiduck'
import { producerApi, PRODUCER_PORT, CONSUMER_PORT } from './isofetch-shared'
import fetch from 'node-fetch'
import { z } from 'zod'

const PRODUCER_API_URL = `http://localhost:${PRODUCER_PORT}`
tapiduck.injectIsomorphicFetch(fetch)
const tapiFetch = tapiduck.fetchUsing(PRODUCER_API_URL)

const app = express()

app.get('/factorial', function (req, res) {
  (async function () {
    const n = z.number().parse(Number(req.query.n))
    const { ans } = await tapiFetch(producerApi.factorial, { n })
    res.send(`
        <h2>Factorial Page</h2>
        <div>n = ${n}</div>
        <div>n! = ${ans}</div>
      `)
  }()).catch(e => { throw new Error(e) })
})

app.get('/square', function (req, res) {
  (async function () {
    const n = z.number().parse(Number(req.query.n))
    const { ans } = await tapiFetch(producerApi.square, { n })
    res.send(`
        <h2>Square Page</h2>
        <div>n = ${n}</div>
        <div>n<sup>2</sup> = ${ans}</div>
      `)
  }()).catch(e => { throw new Error(e) })
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