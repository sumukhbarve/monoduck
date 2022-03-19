import { z } from 'zod'
import { tapiEndpoint } from '../index-tapiduck'

const zTodo = z.object({
  id: z.number(),
  text: z.string(),
  done: z.boolean()
})
type Todo = z.infer<typeof zTodo>

const addTodo = tapiEndpoint({
  path: '/todo/add',
  zReq: zTodo.pick({ text: true }),
  zRes: zTodo
})

const toggleTodo = tapiEndpoint({
  path: '/todo/toggle',
  zReq: zTodo.pick({ id: true }),
  zRes: zTodo
})

const updateText = tapiEndpoint({
  path: '/todo/updateText',
  zReq: zTodo.pick({ id: true, text: true }),
  zRes: zTodo
})

const getTodos = tapiEndpoint({
  path: '/todo/getAll',
  zReq: z.unknown(),
  zRes: z.array(zTodo)
})

const ept = { addTodo, toggleTodo, updateText, getTodos }

export type { Todo }
export { zTodo, ept }
