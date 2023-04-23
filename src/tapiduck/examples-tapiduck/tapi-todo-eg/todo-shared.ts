import { z } from 'zod'
import { tapiduck } from '../../index-tapiduck'

const SERVER_PORT = 4000

const zTodo = z.object({
  id: z.number(),
  text: z.string(),
  done: z.boolean()
})
type Todo = z.infer<typeof zTodo>

const api = (): void => {} // scope

api.addTodo = tapiduck.endpoint({
  path: '/todo/add',
  zRequest: zTodo.pick({ text: true }),
  zSuccess: zTodo,
  zFail: z.object({ message: z.string() })
})

api.toggleTodo = tapiduck.endpoint({
  path: '/todo/toggle',
  zRequest: zTodo.pick({ id: true }),
  zSuccess: zTodo,
  zFail: z.string()
})

api.updateText = tapiduck.endpoint({
  path: '/todo/updateText',
  zRequest: zTodo.pick({ id: true, text: true }),
  zSuccess: zTodo,
  zFail: z.string()
})

api.getTodos = tapiduck.endpoint({
  path: '/todo/getAll',
  zRequest: z.object({}),
  zSuccess: z.array(zTodo),
  zFail: z.string()
})

api.clearTodos = tapiduck.endpoint({
  path: '/todo/clear',
  zRequest: z.object({}),
  zSuccess: z.object({}),
  zFail: z.string()
})

api.divisionEndpoint = tapiduck.endpoint({
  path: '/api/divide',
  // Use Zod to specify request and response shapes:
  zRequest: z.object({ numerator: z.number(), denominator: z.number() }),
  zSuccess: z.object({ quotient: z.number(), remainder: z.number() }),
  zFail: z.object({ message: z.string() })
})

const ept = { ...api }

export type { Todo }
export { SERVER_PORT, zTodo, ept }
