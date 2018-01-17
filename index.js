const babylon = require('babylon')
const traverse = require('babel-traverse').default
const types = require('babel-types')
const generate = require('babel-generator').default

// how to do this with built in utils?
const get = require('lodash.get')

const parse = (code, opts = {}) => {
  const ast = babylon.parse(code, {
    sourceType: 'module'
  })

  let styledComponentsVarName
  let defaultExport
  let type
  const imports = []
  let templateLiteral
  let defaultProps

  const Visitor = {
    ImportDeclaration (path) {
      // get imports
      const specifiers = path.get('specifiers')

      const defaultSpecifier = path.get('specifiers')
        .find(s => s.isImportDefaultSpecifier())
      const defaultExport = defaultSpecifier
        && defaultSpecifier.node
        && defaultSpecifier.node.local.name

      const namespaceSpecifier = path.get('specifiers')
        .find(s => s.isImportNamespaceSpecifier())
      const namespaceExport = namespaceSpecifier
        && namespaceSpecifier.node
        && namespaceSpecifier.node.local.name

      const names = specifiers
        .filter(s => s.isImportSpecifier())
        .map(s => s.node.local.name)
      const source = path.get('source.value').node

      imports.push({
        defaultExport,
        namespaceExport,
        names,
        source
      })

      // get styled-components imported variable name
      if (path.get('source.value').node === 'styled-components') {
        const specifier = path.get('specifiers')
          .find(s => s.isImportDefaultSpecifier()
            || s.isImportSpecifier()) // not sure if this is correct...
        if (specifier) {
          styledComponentsVarName = specifier.node.local.name
        }
      }
    },
    ExportDefaultDeclaration (path) {
      defaultExport = path.node.declaration.name
    },
  }

  const Visit2 = {
    TaggedTemplateExpression (path) {
      // todo check if variable def === default Export
      // handle call expressions?
      // check if === styledComponentsVarName

      const obj = get(path, 'node.tag.object')

      if (obj && obj.name === styledComponentsVarName) {
        type = path.node.tag.property.name
      }

      const callee = get(path, 'node.tag.callee.name')

      if (callee === styledComponentsVarName) {
        type = path.node.tag.arguments[0].value
          || path.node.tag.arguments[0].name
      }

      const quasi = path.node.quasi
      templateLiteral = generate(quasi).code
        .replace(/^`|`$/g, '')
    },
    MemberExpression (path) {
      const obj = get(path, 'node.object.name')
      const prop = get(path, 'node.property.name')
      if (obj === defaultExport && prop === 'defaultProps') {
        const assignment = path.findParent(p => p.isAssignmentExpression())
        const defaultPropsCode = generate(assignment.node.right).code

        // look into alternatives
        // this would need access to module scope
        eval('defaultProps = ' + defaultPropsCode)
      }
    }
  }

  traverse(ast, Visitor)
  traverse(ast, Visit2)

  return {
    name: defaultExport,
    type,
    templateLiteral,
    defaultProps,
    styledComponentsVarName,
    imports,
  }
}

module.exports = parse
