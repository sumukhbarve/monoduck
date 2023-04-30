import type { VoidFn } from './indeps-ringduck'
import type { ZodSchema } from 'zod'

// A 2-tuple: [injectFoo, getInjectedFoo]
type DepInjectionTup<T> = [(dep: T) => void, () => T]

const buildInjectionTup = function <T>(depName: string): DepInjectionTup<T> {
  let _dep: T | null = null
  let didInject = false
  const injectDep = function (dep: T): void {
    if (!didInject) {
      _dep = dep
      didInject = true
    } else if (_dep !== dep) {
      throw new Error(`Monoduck: Another ${depName} was previously injected.`)
    }
  }
  const retrieveDep = function (): T {
    if (!didInject) {
      throw new Error(`Monoduck: ${depName} not injected. Please inject it.`)
    }
    return _dep as T
  }
  return [injectDep, retrieveDep]
}

interface Reacty {
  useState: <T>(initVal: T) => [T, (cb: (val: T) => T) => void]
  useEffect: (effect: () => VoidFn, deps?: unknown[]) => void
  useRef: <T>(initVal: T) => {current: T}
  unstable_batchedUpdates?: (fn: VoidFn) => void
  // Note the signature of: React.createElement(component, props, ...children)
  createElement:
  (tag: string, props: Record<string, any>, ...children: any) => any
  // Unused:
  // useCallback: (callback: VoidFn, deps: unknown[]) => VoidFn
  // createRoot?: AnyFn
}
const [injectReact, getInjectedReact] = buildInjectionTup<Reacty>('React')

type FetchyFn = (url: string, data: Record<string, any>) => Promise<{
  status: number
  text: () => Promise<string>
}>
const [injectFetch, getInjectedFetch] = buildInjectionTup<FetchyFn>('fetch')

// On the browser, we auto-inject window.fetch:
if (globalThis.fetch !== undefined) {
  injectFetch(globalThis.fetch)
}

type ZodyToJsonSchemaFn =
  (zodSchema: ZodSchema, options: {target: 'openApi3', $refStrategy: 'none'})
  => Record<string, unknown>

const [injectZodToJsonSchema, getInjectedZodToJsonSchema] =
  buildInjectionTup<ZodyToJsonSchemaFn>('zodToJsonSchema')

export type { Reacty, FetchyFn, ZodyToJsonSchemaFn }
export {
  injectReact, getInjectedReact,
  injectFetch, getInjectedFetch,
  injectZodToJsonSchema, getInjectedZodToJsonSchema
}
