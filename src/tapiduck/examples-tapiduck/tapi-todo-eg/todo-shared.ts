import { z } from 'zod'
import { tapiduck } from '../../index-tapiduck'

const SERVER_PORT = 4000

const zTodo = z.object({
  id: z.number(),
  text: z.string(),
  done: z.boolean()
})
type Todo = z.infer<typeof zTodo>

const addTodo = tapiduck.endpoint({
  path: '/todo/add',
  zReq: zTodo.pick({ text: true }),
  zRes: zTodo
})

const toggleTodo = tapiduck.endpoint({
  path: '/todo/toggle',
  zReq: zTodo.pick({ id: true }),
  zRes: zTodo
})

const updateText = tapiduck.endpoint({
  path: '/todo/updateText',
  zReq: zTodo.pick({ id: true, text: true }),
  zRes: zTodo
})

const getTodos = tapiduck.endpoint({
  path: '/todo/getAll',
  zReq: z.unknown(),
  zRes: z.array(zTodo)
})

const ept = { addTodo, toggleTodo, updateText, getTodos }

export type { Todo }
export { SERVER_PORT, zTodo, ept }
