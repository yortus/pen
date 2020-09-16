// TODO: raise an error for unreferenced non-exported bindings. Need to impl exports properly first...


import {createDereferencer, createNodeHasher, traverseAst} from '../../abstract-syntax-trees';
import type {Expression, GlobalBinding, GlobalReferenceExpression} from '../../abstract-syntax-trees';
import {resolvedNodeKinds, ResolvedProgram, SingleExpressionProgram} from '../../representations';
import {assert} from '../../utils';


// TODO: jsdoc...
// - result omits all unreferenced expressions
// - result dedupes semantically equivalent expressions
export function generateSingleExpression(program: ResolvedProgram): SingleExpressionProgram {

    // ENTRY rules:
    // a. the expression in an ENTRY is always 'flat' - any subexpressions are ReferenceExpressions to other ENTRYs
    // b. each ENTRY has a unique name (to facilitate rule (a)). Can be human-readable / linked to source names
    // c. ENTRY expressions are never ReferenceExpressions - these are always resolved before creating entries
    // d. ENTRY expressions *may be* MemberExpressions, if they cannot be resolved

    // Make a flat list of every GlobalBinding in the entire program.
    const allBindings = [] as GlobalBinding[];
    traverseAst(program.sourceFiles, n => n.kind === 'GlobalBinding' ? allBindings.push(n) : 0);

    // Create helper functions for this program.
    let deref = createDereferencer(program.sourceFiles);
    let getHashFor = createNodeHasher(deref);

    // Find the `start` expression.
    let startExpr = allBindings.find(n => n.globalName === program.startGlobalName)?.value;
    assert(startExpr);

    // Populate the `entriesByHash` map.
    let entriesByHash = new Map<string, Entry>();
    let counter = 0;
    let startEntry = getEntryFor(startExpr); // NB: called for side-effect of populating `entriesByHash` map.

    // TODO: temp testing... build the single-expression program representation
    let subexpressions = {} as Record<string, Expression>;
    for (let {globalName, expr} of entriesByHash.values()) subexpressions[globalName] = expr;
    return {
        kind: 'SingleExpressionProgram',
        startName: startEntry.globalName,
        subexpressions
    };

    // TODO: recursive...
    function getEntryFor(expr: Expression): Entry {
        assert(resolvedNodeKinds.includes(expr));

        // TODO: doc...
        let e = deref(expr);
        let hash = getHashFor(e);
        if (entriesByHash.has(hash)) return entriesByHash.get(hash)!;

        // TODO: doc...
        let entry: Entry = {globalName: `id${++counter}`, expr: undefined!};
        entriesByHash.set(hash, entry);

        // Set `entry.expr` to a new shallow expr, and return `entry`.
        switch (e.kind) {
            case 'ApplicationExpression': return setX(e, {lambda: ref(e.lambda), argument: ref(e.argument)});
            case 'BooleanLiteralExpression': return setX(e);
            case 'ExtensionExpression': return setX(e);
            case 'FieldExpression': return setX(e, {name: ref(e.name), value: ref(e.value)});
            case 'ListExpression': return setX(e, {elements: e.elements.map(ref)});
            case 'MemberExpression': return setX(e, {module: ref(e.module), bindingName: e.bindingName});
            case 'ModuleExpression': {
                let bindings = e.module.bindings.map(binding => ({...binding, value: ref(binding.value)}));
                return setX(e, {module: {kind: 'Module', bindings}});
            }
            case 'NotExpression': return setX(e, {expression: ref(e.expression)});
            case 'NullLiteralExpression': return setX(e);
            case 'NumericLiteralExpression': return setX(e);
            case 'QuantifiedExpression': return setX(e, {expression: ref(e.expression), quantifier: e.quantifier});
            case 'RecordExpression': return setX(e, {fields: e.fields.map(f => ({name: f.name, value: ref(f.value)}))});
            case 'SelectionExpression': return setX(e, {expressions: e.expressions.map(ref)});
            case 'SequenceExpression': return setX(e, {expressions: e.expressions.map(ref)});
            case 'StringLiteralExpression': return setX(e);
            default: ((assertNoKindsLeft: never) => { throw new Error(`Unhandled node ${assertNoKindsLeft}`); })(e);
        }

        function ref(expr: Expression): GlobalReferenceExpression {
            // TODO: set globalName to something proper? use same value as `name`?
            return {kind: 'GlobalReferenceExpression', localName: '', globalName: getEntryFor(expr).globalName};
        }

        function setX<E extends Expression>(expr: E, vals?: Omit<E, 'kind'>) {
            entry.expr = Object.assign({kind: expr.kind}, vals || expr) as unknown as Expression;
            return entry;
        }
    }
}


interface Entry {
    globalName: string;
    expr: Expression;
}