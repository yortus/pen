// This is the ModuleMap representation (intermediate AST form) of the compile-test.pen program.
const moduleMap = 
{
  modulesById: {
    "file://V:\\projects\\oss\\pen-monorepo\\packages\\test-suite\\fixtures\\pen-src\\compile-test.pen": {
      kind: "Module",
      moduleId: "file://V:\\projects\\oss\\pen-monorepo\\packages\\test-suite\\fixtures\\pen-src\\compile-test.pen",
      bindings: [
        {
          kind: "Binding",
          pattern: {
            kind: "NamePattern",
            name: "digits",
          },
          value: {
            kind: "ImportExpression",
            moduleSpecifier: "internal://1",
            moduleId: "internal://1",
          },
          exported: false,
        },
        {
          kind: "Binding",
          pattern: {
            kind: "ModulePattern",
            names: [
              {
                name: "one",
                alias: "des",
              },
            ],
          },
          value: {
            kind: "Identifier",
            name: "digits",
          },
          exported: false,
        },
        {
          kind: "Binding",
          pattern: {
            kind: "NamePattern",
            name: "ref",
          },
          value: {
            kind: "Identifier",
            name: "des",
          },
          exported: false,
        },
        {
          kind: "Binding",
          pattern: {
            kind: "NamePattern",
            name: "mem",
          },
          value: {
            kind: "MemberExpression",
            module: {
              kind: "Identifier",
              name: "digits",
            },
            member: {
              kind: "Identifier",
              name: "two",
            },
          },
          exported: false,
        },
      ],
    },
    "internal://1": {
      kind: "Module",
      moduleId: "internal://1",
      parentModuleId: "file://V:\\projects\\oss\\pen-monorepo\\packages\\test-suite\\fixtures\\pen-src\\compile-test.pen",
      bindings: [
        {
          kind: "Binding",
          pattern: {
            kind: "NamePattern",
            name: "one",
          },
          value: {
            kind: "NumericLiteral",
            value: 1,
          },
          exported: false,
        },
        {
          kind: "Binding",
          pattern: {
            kind: "NamePattern",
            name: "two",
          },
          value: {
            kind: "NumericLiteral",
            value: 2,
          },
          exported: false,
        },
      ],
    },
  },
  startModuleId: "file://V:\\projects\\oss\\pen-monorepo\\packages\\test-suite\\fixtures\\pen-src\\compile-test.pen",
}
