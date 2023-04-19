import type { Reacty, JsonValue } from './indeps-patchduck'
import { injectReact, getInjectedReact, _ } from './indeps-patchduck'

type JsonObject = Record<string, JsonValue>

type Patchlet<T extends JsonObject> = {
  [K in keyof T]?: T[K] extends JsonObject ? Patchlet<T[K]> : T[K]
}

const patchBinary = function<T extends JsonObject> (
  original: T, patchlet: Patchlet<T>
): T {
  const output: JsonObject = {}
  Object.keys(original).forEach(function (key): void {
    const origiVal = original[key]
    const patchVal = patchlet[key]
    if (patchVal === undefined) {
      output[key] = _.bang(origiVal)
    } else if (_.primitiveIs(patchVal)) {
      output[key] = patchVal
    } else if (Array.isArray(patchVal)) {
      output[key] = patchVal
    } else if (_.plainObjectIs(patchVal)) {
      output[key] = _.plainObjectIs(origiVal)
        ? patchBinary(origiVal, patchVal)
        : patchVal as JsonValue
    } else {
      _.never(patchVal)
    }
  })
  Object.keys(patchlet).forEach(function (key): void {
    const patchVal = patchlet[key]
    if (!_.keyHas(output, key)) {
      output[key] = patchVal as JsonValue
    }
  })
  return output as T
}

const patch = function<T extends JsonObject> (
  original: T, ...patchlets: Array<Patchlet<T>>
): T {
  let output = original
  patchlets.forEach(function (patchlet) {
    output = patchBinary(output, patchlet ?? {})
  })
  return output
}

const usePatchable = function<S extends JsonObject> (
  initState: S
): [S, (...patchlets: Array<Patchlet<S>>) => void] {
  const React = getInjectedReact()
  const [state, setState] = React.useState(initState)
  const patchState = function (...patchlets: Array<Patchlet<S>>): void {
    setState(state => patch(state, ...patchlets))
  }
  return [state, patchState]
}

const makeUsePatchable = function (React: Reacty): typeof usePatchable {
  injectReact(React)
  return usePatchable
}

export type { Patchlet }
export const patchduck = { patch, injectReact, usePatchable, makeUsePatchable }
