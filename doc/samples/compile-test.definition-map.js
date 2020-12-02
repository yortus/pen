const definitionMap = {
  definitionsById: {
    std: {
      kind: "Definition",
      definitionId: "std",
      moduleId: "Ɱ_compile_test",
      localName: "std",
      value: {
        kind: "Reference",
        definitionId: "Ɱ_std",
      },
    },
    digits: {
      kind: "Definition",
      definitionId: "digits",
      moduleId: "Ɱ_compile_test",
      localName: "digits",
      value: {
        kind: "Reference",
        definitionId: "Ɱ_compile_test_modexpr",
      },
    },
    des: {
      kind: "Definition",
      definitionId: "des",
      moduleId: "Ɱ_compile_test",
      localName: "des",
      value: {
        kind: "Reference",
        definitionId: "one2",
      },
    },
    ref: {
      kind: "Definition",
      definitionId: "ref",
      moduleId: "Ɱ_compile_test",
      localName: "ref",
      value: {
        kind: "Reference",
        definitionId: "des",
      },
    },
    mem: {
      kind: "Definition",
      definitionId: "mem",
      moduleId: "Ɱ_compile_test",
      localName: "mem",
      value: {
        kind: "Reference",
        definitionId: "two",
      },
    },
    xxx: {
      kind: "Definition",
      definitionId: "xxx",
      moduleId: "Ɱ_compile_test",
      localName: "xxx",
      value: {
        kind: "Reference",
        definitionId: "Ɱ_compile_test_modexpr2",
      },
    },
    one: {
      kind: "Definition",
      definitionId: "one",
      moduleId: "Ɱ_compile_test",
      localName: "one",
      value: {
        kind: "NumericLiteral",
        value: 1,
      },
    },
    start: {
      kind: "Definition",
      definitionId: "start",
      moduleId: "Ɱ_compile_test",
      localName: "start",
      value: {
        kind: "SelectionExpression",
        expressions: [
          {
            kind: "Reference",
            definitionId: "one",
          },
          {
            kind: "Reference",
            definitionId: "ref",
          },
          {
            kind: "Reference",
            definitionId: "mem",
          },
          {
            kind: "Reference",
            definitionId: "two",
          },
          {
            kind: "Reference",
            definitionId: "digits",
          },
        ],
      },
    },
    "Ɱ_compile_test": {
      kind: "Definition",
      definitionId: "Ɱ_compile_test",
      moduleId: "Ɱ__root",
      localName: "Ɱ_compile_test",
      value: {
        kind: "Module",
        bindings: {
          std: {
            kind: "Reference",
            definitionId: "std",
          },
          digits: {
            kind: "Reference",
            definitionId: "digits",
          },
          des: {
            kind: "Reference",
            definitionId: "des",
          },
          ref: {
            kind: "Reference",
            definitionId: "ref",
          },
          mem: {
            kind: "Reference",
            definitionId: "mem",
          },
          xxx: {
            kind: "Reference",
            definitionId: "xxx",
          },
          one: {
            kind: "Reference",
            definitionId: "one",
          },
          start: {
            kind: "Reference",
            definitionId: "start",
          },
        },
      },
    },
    one2: {
      kind: "Definition",
      definitionId: "one2",
      moduleId: "Ɱ_compile_test_modexpr",
      localName: "one",
      value: {
        kind: "ParenthesisedExpression",
        expression: {
          kind: "NumericLiteral",
          value: 1,
        },
      },
    },
    two: {
      kind: "Definition",
      definitionId: "two",
      moduleId: "Ɱ_compile_test_modexpr",
      localName: "two",
      value: {
        kind: "NumericLiteral",
        value: 2,
      },
    },
    outer: {
      kind: "Definition",
      definitionId: "outer",
      moduleId: "Ɱ_compile_test_modexpr",
      localName: "outer",
      value: {
        kind: "Reference",
        definitionId: "mem",
      },
    },
    "Ɱ_compile_test_modexpr": {
      kind: "Definition",
      definitionId: "Ɱ_compile_test_modexpr",
      moduleId: "Ɱ__root",
      localName: "Ɱ_compile_test_modexpr",
      value: {
        kind: "Module",
        bindings: {
          one: {
            kind: "Reference",
            definitionId: "one2",
          },
          two: {
            kind: "Reference",
            definitionId: "two",
          },
          outer: {
            kind: "Reference",
            definitionId: "outer",
          },
        },
      },
    },
    d: {
      kind: "Definition",
      definitionId: "d",
      moduleId: "Ɱ_compile_test_modexpr2",
      localName: "d",
      value: {
        kind: "Reference",
        definitionId: "digits",
      },
    },
    "Ɱ_compile_test_modexpr2": {
      kind: "Definition",
      definitionId: "Ɱ_compile_test_modexpr2",
      moduleId: "Ɱ__root",
      localName: "Ɱ_compile_test_modexpr2",
      value: {
        kind: "Module",
        bindings: {
          d: {
            kind: "Reference",
            definitionId: "d",
          },
        },
      },
    },
    char: {
      kind: "Definition",
      definitionId: "char",
      moduleId: "Ɱ_std",
      localName: "char",
      value: {
        kind: "Intrinsic",
        name: "char",
        path: "V:/projects/oss/pen-monorepo/packages/core/penc/dist/deps/std.pen.js",
      },
    },
    f64: {
      kind: "Definition",
      definitionId: "f64",
      moduleId: "Ɱ_std",
      localName: "f64",
      value: {
        kind: "Intrinsic",
        name: "f64",
        path: "V:/projects/oss/pen-monorepo/packages/core/penc/dist/deps/std.pen.js",
      },
    },
    i32: {
      kind: "Definition",
      definitionId: "i32",
      moduleId: "Ɱ_std",
      localName: "i32",
      value: {
        kind: "Intrinsic",
        name: "i32",
        path: "V:/projects/oss/pen-monorepo/packages/core/penc/dist/deps/std.pen.js",
      },
    },
    memoise: {
      kind: "Definition",
      definitionId: "memoise",
      moduleId: "Ɱ_std",
      localName: "memoise",
      value: {
        kind: "Intrinsic",
        name: "memoise",
        path: "V:/projects/oss/pen-monorepo/packages/core/penc/dist/deps/std.pen.js",
      },
    },
    "Ɱ_std": {
      kind: "Definition",
      definitionId: "Ɱ_std",
      moduleId: "Ɱ__root",
      localName: "Ɱ_std",
      value: {
        kind: "Module",
        bindings: {
          char: {
            kind: "Reference",
            definitionId: "char",
          },
          f64: {
            kind: "Reference",
            definitionId: "f64",
          },
          i32: {
            kind: "Reference",
            definitionId: "i32",
          },
          memoise: {
            kind: "Reference",
            definitionId: "memoise",
          },
        },
      },
    },
  },
  startDefinitionId: "start",
}
