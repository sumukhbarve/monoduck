# Tapiduck

### What is it?
- End-to-end type-safe APIs with TypeScript, Zod, and Express.
- Fullstack type-hinting (intillisense) in TS-friendly editors.
- Inspired by [tRPC](https://trpc.io/) but simpler, and restful-ish.

### Quickstart: Typed API for simple addition
**0. Install Monoduck, Zod, and Express:**
```shell
npm install monoduck zod express
```

**1. Define endpoint shapes in `endpoint-shapes.ts`:**
```ts
import { tapiduck } from 'monoduck'
import { z } from 'zod'

export const sumEndpoint = tapiduck.endpoint({
    path: '/api/sum',
    // Use Zod to specify request and response shapes:
    zReq: z.object({ augend: z.number(), addend: z.number() }),
    zRes: z.object({ sum: z.number() })
})
```

**2. On the backend, handle endpoint routes:**
```ts
import express from 'express'
import { tapiduck } from 'monoduck'
import { sumEndpoint } from './endpoint-shapes'

const app = express().use(express.json())

tapiduck.route(app, sumEndpoint, function (reqData) {
    // Here, typeof reqData: { augend: number, addend: number }
    // And your IDE will know this, so you'll get proper hinting!
    return { sum: reqData.augend + reqData.addend }
})

app.listen(3000, () => console.log('Listening at port 3000 ...'))
```

**3. Hit your endpoints from the frontend. Done!**
```ts
import { tapiduck } from 'monoduck'
import { sumEndpoint } from './endpoint-shapes'

const getSum = async function () {
    const augend = Number(window.prompt('Enter augend:')) || 0
    const addend = Number(window.prompt('Enter addend:')) || 0
    const resData = await tapiduck.fetch(sumEndpoint, { augend, addend })
    // Here, typeof resData: { sum: number }, and your IDE knows it!
    window.alert(`${augend} + ${addend} = ${resData.sum}`)
}
```

**Quick notes:**
1. For brevity, we defined a single endpoint here; but you could define more!
2. We passed an express app to `tapiduck.route`, but you could pass an express router instead.
3. You needn't pass the app (or router) each time. `tapiduck.routeUsing` helps with that.
4. On the frontend, you can define a common base URL for multiple endpoints.

### JSON & CORS Middleware

Tapiduck expects JSON requests, and always produces a JSON response. You should _always_ install the `express.json()` middleware on your express app (or router). To allow CORS, `npm install cors` and add the `cors()` middleware first.

```ts
import express from 'express'
import cors from 'cors'
import { tapiduck } from monoduck

const app = express()
app.use(cors()) // optional
app.use(express.json()) // required

tapiduck.route(app, <your-endpoint-here>, <your-handler-here>)
```
