# Tapiduck

## What is it?
- End-to-end type-safe JSON APIs with TypeScript, Zod, and Express.
- Compile-time type safety, and fullstack IDE intillisense.
- Inspired by [tRPC](https://trpc.io/); but simpler and restful,  like [JSend](https://github.com/omniti-labs/jsend).
- OpenAPI compatible; can auto-generate API docs (Swagger UI)

## Motivation

TypeScript is leaps and bounds ahead of JavaScript. Yes, TypeScript can catch/prevent errors, and that’s good. And intillisense is a complete game changer. Thanks to IDE auto-complete, you don’t even need to leave your editor to lookup object properties or function params.

While intillisense works great with objects and fucntions that’re defined in TS, it doesn’t quite work with HTTP APIs. On the server, you can’t trust the shape of the request data sent by the client. And you need to perform type-narrowing before intellisense kicks in. On the client, nothing really stops you form accidentally making misshpaed API requests.

Wouldn’t it be nice to have automatic type-validation on the server, so that intellisense kicks in right away? And on the client, wouldn’t it be nice to enforce request shapes at compile-time? That’s exactly what Tapiduck can do for you. It’s a tool for achieving end-to-end typesafety and intellisense.

## Quickstart: Typesafe Division API & UI

In this quickstart, we'll start from scratch and build a typesafe API for simple (arithmetic) division, and a typesafe UI for consuming it. Let's get started by setting up the project.

### 0) Project setup:

Create a directory, and change into it:
```sh
mkdir tapiduck-quickstart && cd tapiduck-quickstart;
```

Set up minimal `package.json` and `tsconfig.json` files:
```sh
echo '{}' > package.json;
echo '{"compilerOptions":{"esModuleInterop":true,"strict": true}}' > tsconfig.json;
```

Install dependencies:
```sh
npm install --save monoduck zod express cors;
npm install --save-dev typescript @types/express @types/cors parcel ts-node-dev;
```

Let's create the `src/` directory and some empty files:
```
mkdir src && cd src && touch shared.ts backend.ts frontend.ts frontend.html && cd ..;
```


### 1) Define shared endpoint shapes:
In `src/shared.ts`:
```ts
import { tapiduck } from 'monoduck'
import { z } from 'zod'

export const SERVER_PORT = 3000

export const divisionEndpoint = tapiduck.endpoint({
    path: '/api/divide',
    // Define request and response (success & failure) shapes:
    zRequest: z.object({ numerator: z.number(), denominator: z.number() }),
    zSuccess: z.object({ quotient: z.number(), remainder: z.number() }),
    zFail: z.object({message: z.string()})
})
```

### 2) On the backend, handle endpoint routes:
In `src/backend.ts`:
```ts
import express from 'express'
import cors from 'cors'
import { tapiduck } from 'monoduck'
import { SERVER_PORT, divisionEndpoint } from './shared'

const app = express().use(cors()).use(express.json())

tapiduck.route(app, divisionEndpoint, async function (reqData, jsend) {
  const { numerator, denominator } = reqData // matches zRequest
  if (denominator === 0) {
    return jsend.fail({ message: 'You cannot divide by zero' }) // matches zFail
  }
  const quotient = Math.floor(numerator / denominator)
  const remainder = numerator % denominator
  return jsend.success({ quotient, remainder }) // must zSuccess
})

app.listen(SERVER_PORT, () => console.log(`Listening @ port ${SERVER_PORT} ...`))
```

The route handler's first param, `reqData`, is fully type-validated and intillisense-able. Try typing `reqData.`, and your IDE should suggest `numerator` and `denominator` as options.

The second param, `jsend` , has typed `jsend.success()` and `jsend.fail()` helpers. (They also produce the [JSend API envelope](#jsend-api-envelope), hence the name `jsend`.)

### 2.5) Start the backend server:
From the project directory (`tapiduck-quickstart`), run:
```sh
npx ts-node-dev src/backend.ts
```

### 3) Hit your endpoints from the frontend!
In `src/frontend.ts`:
```ts
import { tapiduck } from 'monoduck'
import { SERVER_PORT, divisionEndpoint } from './shared'

const tapiFetch = tapiduck.fetchUsing(`http://localhost:${SERVER_PORT}`)

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

window.onload = () => { performDivision() };
```

`tapiFetch` is a fetching/request utility bound to the supplied base URL. The first param is an endpoint object (defined via `tapiduck.endpoint()`). The second param is must match the endpoint's `.zRequest` shape.

### 3.5) Start the frontend client:

To try our frontend code, we'll use a minimal HTML webpage and serve it with `parcel`.

In `src/frontend.html`:
```html
<h4>Tapiduck Quickstart - Minimal Frontend</h4>
<p>Plesse refresh the page to re-perform division.</p>
<script type="module" src="./frontend.ts"></script>
```

In a new terminal window, from the project directory (`tapiduck-quickstart`), run:
```sh
npx parcel serve src/frontend.html
```

Visit the URL reported by `parcel` (usually http://localhost:1234); and try out the division app!

### 4) Optional: Auto-Generate API Docs via Swagger UI

Install `zod-to-json-schema`:
```sh
npm install zod-to-json-schema
```

Import it on the backend (in `src/backend.ts`):
```ts
import { zodToJsonSchema } from 'zod-to-json-schema'
```

And then, typically right before `app.listen()`:
```ts
tapiduck.swaggerfy(app, zodToJsonSchema)
```

Visit `/swagger-ui` (i.e. http://localhost:3000/swagger-ui) to check out the API docs! And to see the generated OpenAPI definition, visit `/openapi.json`.


### Quick notes:
1. For brevity, we defined a single endpoint above; but you could define more!
1. We used vanilla TS for the frontend here, but you could use React, Vue, Angular etc.
1. In larger apps, you'd typically have separate `frontend/`, `backend/` and `shared/` directories.
    - And yes, instead of separate directories, they could be separate packages.
1. We passed an express app to `tapiduck.route()`, but you could pass an express router instead.
1. You needn't pass the app (or router) each time. `tapiduck.routeUsing()` helps with that.

## Larger Example (FlagLeap)

Looking for a larger example of using Tapiduck for end-to-end typesafety? See [FlagLeap](https://github.com/sumukhbarve/flagleap) (a feature flag management service):

- Endpoint definitions are in [`src/shared/endpoints.ts`](https://github.com/sumukhbarve/flagleap/blob/main/src/shared/endpoints.ts)
- Backend route handlers are defined in [`src/backend/controllers`](https://github.com/sumukhbarve/flagleap/tree/main/src/backend/controllers)
    - for example, internal (flag-management) routes are defined in [`flag-inapi.ts`](https://github.com/sumukhbarve/flagleap/blob/main/src/backend/controllers/flag-inapi.ts)
- Frontend components are in [`src/frontend/components`](https://github.com/sumukhbarve/flagleap/tree/main/src/frontend/components), and many of them hit the API
    - for example, [`<LoginRoute />`](https://github.com/sumukhbarve/flagleap/blob/main/src/frontend/components/LoginRoute.tsx) hits the `api.internal.login` endpoint.

## JSend API Envelope

[JSend](https://github.com/omniti-labs/jsend) is a lightweight envelope spec for JSON APIs, and Tapiduck adopts it almost exactly.

For an endpoint `ept` created via `tapiduck.endpoint()`:
- if a request succeeds:
    - response shape: `{status: "success", data: z.infer<typeof ept.zSuccess>}`
    - HTTP status: 200 OK
- if your code rejects the request for any reason:
    - response shape: `{status: "fail", data: z.infer<typeof ept.zFail>}`
    - HTTP status: 422 Unprocessable Content
- if there's an unexpected (uncaught) server error:
    - response shape: `{status: "error", message: string, code: number}`
    - HTTP status: 500 Internal Server Error
    - the `code` defaults to 500, and is unrelated to the HTTP status
- if Tapiduck can't zod-validate the request on the server, or the response on the client:
    - response shape: `{status: 'zodfail', where: 'server' | 'client', message: string }`
    - HTTP status: 400 Bad Request

Status `zodfail` is Tapiduck-specific; it isn't a part of JSend. If you encounter this error, it's likely that the client is using a stale endpoint definition. You should ask the user to refresh/update the client app.

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

## OpenAPI Compatibility

To generate an OpenAPI definition for your Tapiduck API:

#### Step 1: Install zod-to-json-schema
```
npm install zod-to-json-schema
```

#### Step 2:  Provide it to tapiduck (dependency injection):
```ts
import { tapiduck } from 'monoduck'
import zodToJsonSchema from 'zod-to-json-schema'

tapiduck.injectZodToJsonSchema(zodToJsonSchema)
```

#### Step 3: Generate the definition:
```ts
const myOpenApiDefinition = tapiduck.toOpenApi3({
    endpoints: [divisionEndpoint], // Array of TapiEndpoint objects
    serverUrls: [`http://localhost:3000`], // Array of base URLs for the API
    title: 'Todo API', // API title
    version: '0.0.0' // API version
  })
```
