import type { ZodSchema } from 'zod'
import type { TapiEndpoint } from './tapiEndpoint'
import type { JsonValue } from './indeps-tapiduck'
import { getInjectedZodToJsonSchema, _ } from './indeps-tapiduck'

// We don't `import { z } from 'zod'` as Monoduck should have no hard deps.
// But, during dev, the below snippet can be used for generating (updating)
// RESPONSE_ERROR_CONTENT_OUTER and RESPONSE_ZODFAIL_CONTENT_OUTER
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// import { z } from 'zod'
// const zResError = z.object({
//   status: z.literal('error'),
//   message: z.string(),
//   code: z.number()
// })
// const zResZodFail = z.object({
//   status: z.literal('zodfail'),
//   message: z.string(),
//   where: z.literal('server')
// })
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

type JV = JsonValue // short, local alias
type AnyJsonObject = Record<string, JV>

const RESPONSE_ERROR_CONTENT_OUTER = {
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['error'] },
          message: { type: 'string' },
          code: { type: 'number' }
        },
        required: ['status', 'message', 'code'],
        additionalProperties: false
      }
    }
  }
}

const RESPONSE_ZODFAIL_CONTENT_OUTER = {
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['zodfail'] },
          message: { type: 'string' },
          where: { type: 'string', enum: ['server'] }
        },
        required: [
          'status',
          'message',
          'where'
        ],
        additionalProperties: false
      }
    }
  }
}

const genContent = function (zodSchema: ZodSchema): AnyJsonObject {
  const zodToJsonSchema = getInjectedZodToJsonSchema()
  const schema = zodToJsonSchema(zodSchema, {
    target: 'openApi3', $refStrategy: 'none'
  })
  if (!_.jsonValueIs(schema)) {
    throw new Error()
  }
  return { content: { 'application/json': { schema } } }
}

const genResponses = function<ZReq extends JV, ZSuc extends JV, ZFal extends JV> (
  ept: TapiEndpoint<ZReq, ZSuc, ZFal>
): AnyJsonObject {
  return {
    responses: {
      200: {
        description: 'request succeeded',
        ...genContent(ept.zSuccess)
      },
      422: {
        description: 'request failed',
        ...genContent(ept.zFail)
      },
      500: {
        description: 'request errored unexpectedly',
        ...RESPONSE_ERROR_CONTENT_OUTER // ...genContent(zResError)

      },
      400: {
        description: 'misshaped request',
        ...RESPONSE_ZODFAIL_CONTENT_OUTER // ...genContent(zResZodFail)
      }
    }
  }
}

const genPathRhs = function<ZReq extends JV, ZSuc extends JV, ZFal extends JV> (
  ept: TapiEndpoint<ZReq, ZSuc, ZFal>
): AnyJsonObject {
  return {
    post: {
      summary: ept.path,
      requestBody: {
        required: true,
        ...genContent(ept.zRequest)
      },
      ...genResponses(ept)
    }
  }
}

interface OpenApi3Opt {
  endpoints: Array<TapiEndpoint<JV, JV, JV>>
  title: string
  serverUrls: string[]
  version: string
}

const toOpenApi3 = function (opt: OpenApi3Opt): AnyJsonObject {
  return {
    openapi: '3.0.0',
    info: { title: opt.title, version: opt.version },
    servers: opt.serverUrls.map(url => ({ url })),
    paths: _.fromPairs(opt.endpoints.map(function (ept) {
      return [ept.path, genPathRhs(ept)]
    }))
  }
}

const swaggerUiHtml = function (source: string | Record<string, JV>): string {
  const sourceSnippet = !_.stringIs(source)
    ? `spec: ${JSON.stringify(source)}`
    : (source.startsWith('http') || source.startsWith('/')) && !source.includes('\n')
        ? `url: "${source}"`
        : source.startsWith('{') && source.endsWith('}')
          ? `spec: ${source}`
          : null
  if (sourceSnippet === null) {
    throw new Error(_.singleSpaced(`
      Invalid \`source\` supplied, neither URL nor OpenAPI definition.
    `))
  }
  return (`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content="SwaggerUI" />
      <title>SwaggerUI</title>
      <link
        rel="stylesheet"
        href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css"
        integrity="sha384-pzdBB6iZwPIzBHgXle+9cgvKuMgtWNrBopXkjrWnKCi3m4uJsPPdLQ4IPMqRDirS"
        crossorigin="anonymous"
      />
    </head>
    <body>
    <div id="swagger-ui"></div>
    <script
      src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js"
      integrity="sha384-xy3YXp34ftsoHshRtcUFjOl/M22B5OEHD5S9AjtVzQokz+BxNff8vNW08msKmH46"
      crossorigin="anonymous"
    ></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          ${sourceSnippet},
          dom_id: '#swagger-ui',
        });
      };
    </script>
    </body>
    </html>
  `)
}

export type { OpenApi3Opt }
export { toOpenApi3, swaggerUiHtml }
