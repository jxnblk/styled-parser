
# styled-parser

Parse information from styled-components modules

```sh
npm i styled-parser
```

```js
const fs = require('fs')
const path = require('path')
const parse = require('styled-parser')

const componentSource = fs.readFileSync(
  path.join(__dirname, './src/Box.js')
)

const result = parse(componentSource)
```

Returns an object with the following:

- `name`: default exported component name
- `type`: HTML tag or React component type
- `style`: string of the template literal argument
- `defaultProps`: object of the component's defaultProps
- `imports`: array of imports for the module

[MIT License](LICENSE.md)

