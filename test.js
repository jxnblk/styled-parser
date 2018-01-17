import test from 'ava'
import parse from './index'

const fixture = `import styled from 'styled-components'
import { space, color } from 'styled-system'
import * as sys from 'styled-system'
const Box = styled.div\`
  border: 1px solid #eee;
  border-radius: 4px;
  \${space}
\`
Box.defaultProps = {
  p: 2
}
export default Box
`

// test alternative syntax
const fix2 = `import sx from 'styled-components'
const Box = sx('div')\`
\`
export default Box
`

test('returns an object', t => {
  const res = parse(fixture)
  t.false(res === null)
  t.is(typeof res, 'object')
})

test('parses styled-components default variable name', t => {
  const res = parse(fixture)
  t.is(res.styledComponentsVarName, 'styled')
})

test('parses imports', t => {
  const { imports } = parse(fixture)
  t.true(Array.isArray(imports))
  t.is(imports[0].defaultExport, 'styled')
  t.is(imports[0].source, 'styled-components')
  t.is(imports[1].defaultExport, undefined)
  t.deepEqual(imports[1].names, [
    'space',
    'color'
  ])
  t.is(imports[1].source, 'styled-system')
})

test('parses default export name', t => {
  const res = parse(fixture)
  t.is(res.name, 'Box')
})

test('parses type', t => {
  const res = parse(fixture)
  t.is(res.type, 'div')
})

test('parses defaultProps', t => {
  const res = parse(fixture)
  t.deepEqual(res.defaultProps, {
    p: 2
  })
})

test('parses template literal', t => {
  const res = parse(fixture)
  t.is(res.style, `
  border: 1px solid #eee;
  border-radius: 4px;
  \${space}
`)
})

test.todo('handles styled function call syntax')
test.todo('handles custom styled-components var names')
test.todo('handles function call instead of tagged template literal syntax')

// templateLiteral
test.todo('handles inline function expressions')
test.todo('handles inline function expressions')

test.todo('handles .extend syntax')
test.todo('handles .attr syntax')
test.todo('handles .withComponent syntax')
