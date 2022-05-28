import type { RouteInfo } from './qs-base-tracker'
import {
  prefixQmark, unprefixQmark, parseQs, stringifyQs
} from './qs-base-tracker'
import { _ } from './indeps-roqsduck'

test('roqsduck.prefixQmark', function () {
  expect(prefixQmark('foo=bar')).toBe('?foo=bar')
  expect(prefixQmark('?foo=bar')).toBe('?foo=bar')
})
test('roqsduck.unprefixQmark', function () {
  expect(unprefixQmark('?foo=bar')).toBe('foo=bar')
  expect(unprefixQmark('foo=bar')).toBe('foo=bar')
})

const e = globalThis.encodeURIComponent
const commonTestCases: Array<[RouteInfo, string]> = [
  [{ id: '', a: 'apple' }, 'id=&a=apple'],
  [{ id: 'foo', a: 'app', b: 'bat' }, 'id=foo&a=app&b=bat'],
  [{ id: 'bar', 'a==>': '#$%' }, `id=bar&${e('a==>')}=${e('#$%')}`],
  [{ id: '', 'a==>': '#$%' }, `id=&${e('a==>')}=${e('#$%')}`],
  [{ id: 'baz', dict: 'a=app&b=ball' }, `id=baz&dict=${e('a=app&b=ball')}`]
]

test('roqsduck.parseQs', function () {
  const otherTestCases: Array<[string, RouteInfo]> = [
    ['', { id: '' }]
  ]
  _.each(commonTestCases, tc => expect(parseQs(tc[1])).toStrictEqual(tc[0]))
  _.each(otherTestCases, tc => expect(parseQs(tc[0])).toStrictEqual(tc[1]))
})
test('roqsduck.stringifyQs', function () {
  _.each(commonTestCases, tc => expect(stringifyQs(tc[0])).toStrictEqual(tc[1]))
})
