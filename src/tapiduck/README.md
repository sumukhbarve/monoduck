# Tapiduck

## What is it?
- End-to-end type-safe JSON APIs with TypeScript, Zod, and Express.
- Compile-time type safety, and fullstack intillisense in TS-friendly editors.
- Inspired by [tRPC](https://trpc.io/); but simpler and restful-ish, like [JSend](https://github.com/omniti-labs/jsend).

## Quickstart: Typed API for simple addition
#### 0. Install [Monoduck](./../../README.md), Zod, and Express:
```shell
npm install monoduck zod express
```

#### 1. Define endpoint shapes in `endpoint-shapes.ts`:
```ts
import { tapiduck } from 'monoduck'
import { z } from 'zod'

export const divisionEndpoint = tapiduck.endpoint({
    path: '/api/divide',
    // Define request and response (success & failure) shapes:
    zRequest: z.object({ numerator: z.number(), denominator: z.number() }),
    zSuccess: z.object({ quotient: z.number(), remainder: z.number() }),
    zFail: z.object({message: z.string()})
})
```

#### 2. On the backend, handle endpoint routes:

```ts
import express from 'express'
import { tapiduck } from 'monoduck'
import { divisionEndpoint } from './endpoint-shapes'

const app = express().use(express.json())

tapiduck.route(app, divisionEndpoint, async function (reqData, jsend) {
  const { numerator, denominator } = reqData // matches zRequest
  if (denominator === 0) {
    return jsend.fail({ message: 'You cannot divide by zero' }) // matches zFail
  }
  const quotient = Math.floor(numerator / denominator)
  const remainder = numerator % denominator
  return jsend.success({ quotient, remainder }) // must zSuccess
})

app.listen(3000, () => console.log('Listening at port 3000 ...'))
```

The second param, `jsend` , has typed `jsend.success()` and `jsend.fail()` helpers. In addition to helping with typesafety, they  also produce the [JSend API envelope](#jsend-api-envelope), hence the name `jsend`.

#### 3. Hit your endpoints from the frontend. Done!
```ts
import { tapiduck } from 'monoduck'
import { divisionEndpoint } from './endpoint-shapes'

const performDivision = async function (): Promise<void> {
  const numerator = Number(window.prompt('Numerator: ', '1'))
  const denominator = Number(window.prompt('Denominator: ', '1'))
  const resp = await tapiFetch(divisionEndpoint, { numerator, denominator })
  if (resp.status !== 'success') {
    // failMsg() is a util for handling non-success responses
    return window.alert(tapiduck.failMsg(resp, data => data.message))
    //                                         ^^^^ matches zFail
  }
  const { quotient, remainder } = resp.data // matches zSuccess
  window.alert(`Quotient: ${quotient}; Remainder: ${remainder}`)
}
```

#### Quick notes:
1. For brevity, we defined a single endpoint here; but you could define more!
2. We passed an express app to `tapiduck.route`, but you could pass an express router instead.
3. You needn't pass the app (or router) each time. `tapiduck.routeUsing` helps with that.
4. On the frontend, you can define a common base URL for multiple endpoints.

## JSend API Envelope

[JSend](https://github.com/omniti-labs/jsend) is a lightweight envelope spec for JSON APIs, and Tapiduck adopts it almost exactly.

For an endpoint `ept` created via `tapiduck.endpint()`:
- if a request succeeds:
    - response shape: `{status: "success", data: z.infer<typeof ept.zSuccess>}`
    - HTTP status: 200 OK
- if your code rejects the request for any reason:
    - response shape: `{status: "fail", data: z.infer<typeof ept.zFail>}`
    - HTTP status: 422 Unprocessable Content
- if there's an unexpected (uncaught) server error:
    - response shape: `{status: "error", message: string, code: number}`
    - HTTP status: 500 Internal Server Error
    - the `code` defaults to 500, but is unrelated to the HTTP status
- if Tapiduck can't zod-validate the request on the server, or the response on the client:
    - response shape: `{status: 'zodfail', where: 'server' | 'client', message: string }`
    - HTTP status: 400 Bad Request

Status `zodfail` is Tapiduck-specific; it isn't a part of JSend. If you encounter this error, it essentially means that the client is using a stale version of the endpoint definition; and you should probably ask the user to refresh/update the client app.

## JSON & CORS Middleware

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
