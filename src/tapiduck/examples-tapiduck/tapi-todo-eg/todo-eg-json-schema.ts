import { _ } from '../../indeps-tapiduck'
import { tapiduck } from '../../index-tapiduck'
import { ept as api, SERVER_PORT } from './todo-shared'
import zodToJsonSchema from 'zod-to-json-schema'
import fs from 'fs'
import path from 'path'

tapiduck.injectZodToJsonSchema(zodToJsonSchema)

export const openApiDefnObj = tapiduck.toOpenApi3({
  endpoints: Object.values(api),
  serverUrls: [`http://localhost:${SERVER_PORT}`],
  title: 'Todo Api',
  version: '0.0.0'
})
export const openApiDefnStr = _.pretty(openApiDefnObj)

export const writeOpenApiJsonToFile = function (): void {
  const filepath = path.join(__dirname, 'todo-eg.generated.json')
  console.log('\n\n\n', filepath, '\n\n\n')
  fs.writeFileSync(filepath, openApiDefnStr)
  const filename = _.last(filepath.split(filepath[0] ?? '/'))
  console.log(`Wrote ${_.bang(filename)}`)
}
