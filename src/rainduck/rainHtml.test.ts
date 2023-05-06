import type { TappableHtml } from './index-rainduck'
import { rainduck } from './index-rainduck'

const { interpolate, html, tap } = rainduck

test('rainduck.interpolate', function () {
  // first, test _.escape()-like behavior with strings.
  expect(interpolate('')).toBe('')
  expect(interpolate('foo')).toBe('foo')
  expect(interpolate('&')).toBe('&amp;')
  expect(interpolate('<b>')).toBe('&lt;b&gt;')
  expect(interpolate('"')).toBe('&quot;')
  expect(interpolate("'")).toBe('&#39;')
  expect(interpolate('<b> foo </b>')).toBe('&lt;b&gt; foo &lt;/b&gt;')
  expect(interpolate('I <3 chai & coffee')).toBe('I &lt;3 chai &amp; coffee')

  // next, testing w/ non-string vals
  expect(interpolate(undefined)).toBe('')
  expect(interpolate(false)).toBe('')
  expect(interpolate(null)).toBe('')
  expect(interpolate(true)).toBe('true')
  expect(interpolate(0)).toBe('0')
  expect(interpolate(1234)).toBe('1234')
})

test("rainduck's html`foo` by itself", function () {
  expect(html`foo`).toStrictEqual({
    codeStrings: ['foo'],
    expressions: []
  })
  expect(html`<div>foo</div>`).toStrictEqual({
    codeStrings: ['<div>foo</div>'],
    expressions: []
  })
  expect(html`<div>${'foo'}</div>`).toStrictEqual({
    codeStrings: ['<div>', '</div>'],
    expressions: ['foo']
  })
  expect(html`<div>${'foo'}</div>`).toStrictEqual({
    codeStrings: ['<div>', '</div>'],
    expressions: ['foo']
  })
  expect(html`<div>${html`foo`}</div>`).toStrictEqual({
    codeStrings: ['<div>', '</div>'],
    expressions: [{
      codeStrings: ['foo'],
      expressions: []
    }]
  })
  expect(html`<div>${html`<span>foo</span>`}</div>`).toStrictEqual({
    codeStrings: ['<div>', '</div>'],
    expressions: [{
      codeStrings: ['<span>foo</span>'],
      expressions: []
    }]
  })
  expect(html`<div>${html`<span>${'foo'}</span>`}</div>`).toStrictEqual({
    codeStrings: ['<div>', '</div>'],
    expressions: [{
      codeStrings: ['<span>', '</span>'],
      expressions: ['foo']
    }]
  })
})

test('rainduck.tap with html`foo`', function () {
  expect(tap(html`foo`)).toBe('foo')
  expect(tap(html`<div>foo</div>`)).toBe('<div>foo</div>')
  expect(tap(html`<div>${'foo'}</div>`)).toBe('<div>foo</div>')

  expect(tap(html`<div>${html`<span>foo</span>`}</div>`))
    .toBe('<div><span>foo</span></div>')
  expect(tap(html`<div>${'<span>foo</span>'}</div>`))
    .toBe('<div>&lt;span&gt;foo&lt;/span&gt;</div>')

  expect(tap(html`<div>${html`<span>${html`<i>foo</i>`}</span>`}</div>`))
    .toBe('<div><span><i>foo</i></span></div>')
  expect(tap(html`<div>${html`<span>${'<i>foo</i>'}</span>`}</div>`))
    .toBe('<div><span>&lt;i&gt;foo&lt;/i&gt;</span></div>')

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-base-to-string
  expect(`${html`<div></div>`}`).toBe('[object Object]')
  // ^ above lint rules are good, they'd stop devs from getting '[object Object]'
  //   but not all users have linting, and we gotta test that situation too.

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-base-to-string
  expect(tap(html`<div>${`<span>${html`<i>foo</i>`}</span>`}</div>`))
    .toBe('<div>&lt;span&gt;[object Object]&lt;/span&gt;</div>')
})

test('rainduck.tap with <array>.map()', function () {
  const todos = ['aaa', 'bbb', 'ccc', '<script>xss()']
  const spacefulExpectedLike = (`
    <ul>
      <li>aaa</li>
      <li>bbb</li>
      <li>ccc</li>
      <li>&lt;script&gt;xss()</li>
    </ul>
  `)
  const expectedSpaceless = spacefulExpectedLike.replace(/\s+/g, '')

  expect(tap(
    html`<ul>${todos.map(todo => html`<li>${todo}</li>`)}</ul>`
  )).toBe(expectedSpaceless)

  const todoFC = (todo: string): TappableHtml => html`<li>${todo}</li>`
  const todoListFC = (todos: string[]): TappableHtml => html`<ul>${todos.map(todoFC)}</ul>`
  expect(tap(todoListFC(todos))).toBe(expectedSpaceless)
})
