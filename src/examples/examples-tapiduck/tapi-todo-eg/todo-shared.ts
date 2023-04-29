import { z } from 'zod'
import { tapiduck } from '../../../index-monoduck'

const SERVER_PORT = 4000

const zTodo = z.object({
  id: z.number(),
  text: z.string(),
  done: z.boolean()
})
type Todo = z.infer<typeof zTodo>

const addTodo = tapiduck.endpoint({
  path: '/todo/add',
  zRequest: zTodo.pick({ text: true }),
  zSuccess: zTodo,
  zFail: z.object({ message: z.string() })
})

const toggleTodo = tapiduck.endpoint({
  path: '/todo/toggle',
  zRequest: zTodo.pick({ id: true }),
  zSuccess: zTodo,
  zFail: z.string()
})

const updateText = tapiduck.endpoint({
  path: '/todo/updateText',
  zRequest: zTodo.pick({ id: true, text: true }),
  zSuccess: zTodo,
  zFail: z.string()
})

const getTodos = tapiduck.endpoint({
  path: '/todo/getAll',
  zRequest: z.object({}),
  zSuccess: z.array(zTodo),
  zFail: z.string()
})

const clearTodos = tapiduck.endpoint({
  path: '/todo/clear',
  zRequest: z.object({}),
  zSuccess: z.object({}),
  zFail: z.string()
})

const divisionEndpoint = tapiduck.endpoint({
  path: '/api/divide',
  // Use Zod to specify request and response shapes:
  zRequest: z.object({ numerator: z.number(), denominator: z.number() }),
  zSuccess: z.object({ quotient: z.number(), remainder: z.number() }),
  zFail: z.object({ message: z.string() })
})

const ept = {
  addTodo, toggleTodo, updateText, getTodos, clearTodos, divisionEndpoint
}

export type { Todo }
export { SERVER_PORT, zTodo, ept }
