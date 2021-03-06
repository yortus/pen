const ast3 = {
  version: 300,
  start: {
    kind: "LetExpression",
    expression: {
      kind: "Identifier",
      module: null,
      member: null,
      name: "start_2",
    },
    bindings: {
      start_2: {
        kind: "SelectionExpression",
        expressions: [
          {
            kind: "Identifier",
            name: "start_2_e",
          },
          {
            kind: "Identifier",
            name: "letexpr",
          },
        ],
      },
      start_2_e: {
        kind: "InstantiationExpression",
        generic: {
          kind: "Identifier",
          name: "REP",
        },
        argument: {
          kind: "Identifier",
          name: "start_2_e2",
        },
      },
      REP: {
        kind: "GenericExpression",
        param: "ℙ1",
        body: {
          kind: "LetExpression",
          expression: {
            kind: "Identifier",
            name: "REP_e",
          },
          bindings: {
            a: {
              kind: "Identifier",
              name: "a",
            },
          },
        },
      },
      REP_e: {
        kind: "SequenceExpression",
        expressions: [
          {
            kind: "Identifier",
            name: "a",
          },
          {
            kind: "Identifier",
            name: "x_3",
          },
          {
            kind: "Identifier",
            name: "a",
          },
        ],
      },
      a: {
        kind: "MemberExpression",
        module: {
          kind: "Identifier",
          name: "a_e",
        },
        member: "a",
      },
      a_e: {
        kind: "GenericParameter",
        name: "ℙ1",
      },
      x_3: {
        kind: "StringLiteral",
        value: "inner x",
        concrete: false,
        abstract: false,
      },
      start_2_e2: {
        kind: "Module",
        bindings: {
          a: {
            kind: "Identifier",
            name: "x",
          },
        },
      },
      x: {
        kind: "StringLiteral",
        value: "outer x",
        concrete: false,
        abstract: false,
      },
      letexpr: {
        kind: "SequenceExpression",
        expressions: [
          {
            kind: "Identifier",
            name: "x_3",
          },
          {
            kind: "Identifier",
            name: "letexpr_e",
          },
          {
            kind: "Identifier",
            name: "x_3",
          },
        ],
      },
      letexpr_e: {
        kind: "StringLiteral",
        value: "-",
        concrete: false,
        abstract: false,
      },
    },
  },
}
