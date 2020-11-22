const definitions =
[
  {
    kind: "Definition",
    definitionId: 0,
    moduleId: "@compile_test",
    localName: "std",
    value: {
      kind: "Reference",
      definitionId: 18,
    },
  },
  {
    kind: "Definition",
    definitionId: 1,
    moduleId: "@compile_test",
    localName: "digits",
    value: {
      kind: "Reference",
      definitionId: 11,
    },
  },
  {
    kind: "Definition",
    definitionId: 2,
    moduleId: "@compile_test",
    localName: "des",
    value: {
      kind: "Reference",
      definitionId: 8,
    },
  },
  {
    kind: "Definition",
    definitionId: 3,
    moduleId: "@compile_test",
    localName: "ref",
    value: {
      kind: "Reference",
      definitionId: 2,
    },
  },
  {
    kind: "Definition",
    definitionId: 4,
    moduleId: "@compile_test",
    localName: "mem",
    value: {
      kind: "Reference",
      definitionId: 9,
    },
  },
  {
    kind: "Definition",
    definitionId: 5,
    moduleId: "@compile_test",
    localName: "xxx",
    value: {
      kind: "Reference",
      definitionId: 13,
    },
  },
  {
    kind: "Definition",
    definitionId: 6,
    moduleId: "@compile_test",
    localName: "yyy",
    value: {
      kind: "Reference",
      definitionId: 9,
    },
  },
  {
    kind: "Definition",
    definitionId: 7,
    moduleId: "@@root",
    localName: "@compile_test",
    value: {
      kind: "Module",
      moduleId: "@compile_test",
      parentModuleId: undefined,
      bindings: [
        {
          kind: "Binding",
          left: {
            kind: "Identifier",
            name: "std",
          },
          right: {
            kind: "Reference",
            definitionId: 0,
          },
          exported: false,
        },
        {
          kind: "Binding",
          left: {
            kind: "Identifier",
            name: "digits",
          },
          right: {
            kind: "Reference",
            definitionId: 1,
          },
          exported: false,
        },
        {
          kind: "Binding",
          left: {
            kind: "Identifier",
            name: "one",
          },
          right: {
            kind: "Reference",
            definitionId: 2,
          },
          exported: false,
        },
        {
          kind: "Binding",
          left: {
            kind: "Identifier",
            name: "ref",
          },
          right: {
            kind: "Reference",
            definitionId: 3,
          },
          exported: false,
        },
        {
          kind: "Binding",
          left: {
            kind: "Identifier",
            name: "mem",
          },
          right: {
            kind: "Reference",
            definitionId: 4,
          },
          exported: false,
        },
        {
          kind: "Binding",
          left: {
            kind: "Identifier",
            name: "xxx",
          },
          right: {
            kind: "Reference",
            definitionId: 5,
          },
          exported: false,
        },
        {
          kind: "Binding",
          left: {
            kind: "Identifier",
            name: "yyy",
          },
          right: {
            kind: "Reference",
            definitionId: 6,
          },
          exported: false,
        },
      ],
    },
  },
  {
    kind: "Definition",
    definitionId: 8,
    moduleId: "@compile_test_modexpr",
    localName: "one",
    value: {
      kind: "ParenthesisedExpression",
      expression: {
        kind: "NumericLiteral",
        value: 1,
      },
    },
  },
  {
    kind: "Definition",
    definitionId: 9,
    moduleId: "@compile_test_modexpr",
    localName: "two",
    value: {
      kind: "NumericLiteral",
      value: 2,
    },
  },
  {
    kind: "Definition",
    definitionId: 10,
    moduleId: "@compile_test_modexpr",
    localName: "outer",
    value: {
      kind: "Reference",
      definitionId: 4,
    },
  },
  {
    kind: "Definition",
    definitionId: 11,
    moduleId: "@@root",
    localName: "@compile_test_modexpr",
    value: {
      kind: "Module",
      moduleId: "@compile_test_modexpr",
      parentModuleId: "@compile_test",
      bindings: [
        {
          kind: "Binding",
          left: {
            kind: "Identifier",
            name: "one",
          },
          right: {
            kind: "Reference",
            definitionId: 8,
          },
          exported: false,
        },
        {
          kind: "Binding",
          left: {
            kind: "Identifier",
            name: "two",
          },
          right: {
            kind: "Reference",
            definitionId: 9,
          },
          exported: false,
        },
        {
          kind: "Binding",
          left: {
            kind: "Identifier",
            name: "outer",
          },
          right: {
            kind: "Reference",
            definitionId: 10,
          },
          exported: false,
        },
      ],
    },
  },
  {
    kind: "Definition",
    definitionId: 12,
    moduleId: "@compile_test_modexpr2",
    localName: "d",
    value: {
      kind: "Reference",
      definitionId: 1,
    },
  },
  {
    kind: "Definition",
    definitionId: 13,
    moduleId: "@@root",
    localName: "@compile_test_modexpr2",
    value: {
      kind: "Module",
      moduleId: "@compile_test_modexpr2",
      parentModuleId: "@compile_test",
      bindings: [
        {
          kind: "Binding",
          left: {
            kind: "Identifier",
            name: "d",
          },
          right: {
            kind: "Reference",
            definitionId: 12,
          },
          exported: false,
        },
      ],
    },
  },
  {
    kind: "Definition",
    definitionId: 14,
    moduleId: "@std",
    localName: "char",
    value: {
      kind: "Intrinsic",
      name: "char",
      path: "V:/projects/oss/pen-monorepo/packages/core/penc/dist/deps/std.pen.js",
    },
  },
  {
    kind: "Definition",
    definitionId: 15,
    moduleId: "@std",
    localName: "f64",
    value: {
      kind: "Intrinsic",
      name: "f64",
      path: "V:/projects/oss/pen-monorepo/packages/core/penc/dist/deps/std.pen.js",
    },
  },
  {
    kind: "Definition",
    definitionId: 16,
    moduleId: "@std",
    localName: "i32",
    value: {
      kind: "Intrinsic",
      name: "i32",
      path: "V:/projects/oss/pen-monorepo/packages/core/penc/dist/deps/std.pen.js",
    },
  },
  {
    kind: "Definition",
    definitionId: 17,
    moduleId: "@std",
    localName: "memoise",
    value: {
      kind: "Intrinsic",
      name: "memoise",
      path: "V:/projects/oss/pen-monorepo/packages/core/penc/dist/deps/std.pen.js",
    },
  },
  {
    kind: "Definition",
    definitionId: 18,
    moduleId: "@@root",
    localName: "@std",
    value: {
      kind: "Module",
      moduleId: "@std",
      parentModuleId: undefined,
      bindings: [
        {
          kind: "Binding",
          left: {
            kind: "Identifier",
            name: "char",
          },
          right: {
            kind: "Reference",
            definitionId: 14,
          },
          exported: true,
        },
        {
          kind: "Binding",
          left: {
            kind: "Identifier",
            name: "f64",
          },
          right: {
            kind: "Reference",
            definitionId: 15,
          },
          exported: true,
        },
        {
          kind: "Binding",
          left: {
            kind: "Identifier",
            name: "i32",
          },
          right: {
            kind: "Reference",
            definitionId: 16,
          },
          exported: true,
        },
        {
          kind: "Binding",
          left: {
            kind: "Identifier",
            name: "memoise",
          },
          right: {
            kind: "Reference",
            definitionId: 17,
          },
          exported: true,
        },
      ],
    },
  },
];
