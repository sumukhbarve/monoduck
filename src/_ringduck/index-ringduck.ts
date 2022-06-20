import type { VoidFn } from './indeps-ringduck'
// import { _ } from './indeps-ringduck'

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

let _React: Reacty | null = null

const injectReact = function (React: Reacty): void {
  if (_React === null) {
    _React = React
  } else if (_React !== React) {
    throw new Error('Monoduck: A different `React` was previously injected.')
  }
}

const getReact = function (): Reacty {
  if (_React !== null) { return _React }
  throw new Error('Monoduck: React not injected. Please call injectReact().')
}

export type { Reacty }
export { injectReact, getReact }
