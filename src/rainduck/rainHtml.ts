import { JsonPrimitive, _ } from './indeps-rainduck'

const interpolate = function (val?: JsonPrimitive): string {
  if (val === '' || val === false || val === null || val === undefined) {
    return ''
  }
  return _.escape(String(val))
}

interface TappableHtml {
  codeStrings: string[]
  expressions: TappableExpression[]
}
type TappableExpression = JsonPrimitive | undefined | TappableHtml | TappableHtml[]

const html = function (
  codeStrings: TemplateStringsArray,
  ...expressions: TappableExpression[]
): TappableHtml {
  return {
    codeStrings: Array.from(codeStrings),
    expressions
  }
}

const tapHtml = function (tappable: TappableHtml): string {
  let output = ''; let i = 0; let j = 0
  while (i < tappable.codeStrings.length && j < tappable.expressions.length) {
    output += _.bang(tappable.codeStrings[i])
    i += 1
    output += tapExpression(tappable.expressions[j])
    j += 1
  }
  while (i < tappable.codeStrings.length) {
    output += _.bang(tappable.codeStrings[i])
    i += 1
  }
  while (j < tappable.expressions.length) {
    output += tapExpression(tappable.expressions[j])
    j += 1
  }
  return output
}

const tapExpression = function (expr: TappableExpression): string {
  if (_.primitiveIs(expr)) {
    return interpolate(expr)
  }
  if (_.arrayIs(expr)) {
    return _.map(expr, tappableMember => tapHtml(tappableMember)).join('')
  }
  return tapHtml(expr)
}

type FC<T extends undefined | Record<string, any> = undefined> =
  T extends undefined
    ? (props?: undefined) => TappableHtml
    : (props: T) => TappableHtml

// Typed identity function
const component = function<
  T extends undefined | Record<string, any> = undefined
> (fc: FC<T>): FC<T> {
  return fc
}

export type { TappableHtml, FC }
export { interpolate, html, tapHtml, component }
