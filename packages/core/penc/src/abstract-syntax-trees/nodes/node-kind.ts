export type NodeKind =
    // Top-level nodes
    | 'AbstractSyntaxTree'
    | 'Module'

    // Binding nodes
    | 'GlobalBinding'
    | 'LocalBinding'
    | 'LocalMultiBinding'

    // Expression nodes
    | 'ApplicationExpression'
    | 'BooleanLiteralExpression'
    | 'ExtensionExpression'
    | 'FieldExpression'
    | 'GlobalReferenceExpression'
    | 'ImportExpression'
    // | 'LambdaExpression'
    | 'ListExpression'
    | 'LocalReferenceExpression'
    | 'MemberExpression'
    | 'ModuleExpression'
    | 'NotExpression'
    | 'NullLiteralExpression'
    | 'NumericLiteralExpression'
    | 'ParenthesisedExpression'
    | 'QuantifiedExpression'
    | 'RecordExpression'
    | 'SelectionExpression'
    | 'SequenceExpression'
    | 'StringLiteralExpression'
