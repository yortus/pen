import {makeNodeMapper} from '../../ast-utils';
import * as V01 from '../stage-01/output-types';
import * as V02 from './output-types';
import {insert, makeModuleScope, makeNestedScope, Scope} from './scope';


// TODO: doc...
export function process(ast: V01.Ast): V02.Ast {
    let currentScope: Scope | undefined;
    let mapNode = makeNodeMapper<V01.Node, V02.Node>(rec => ({

        // TODO: every kind of Binding/Pattern
        // - add a symbol for each introduced static name

        // TODO: ImportExpression
        // - resolve the module being imported from (should this go in an ealier pipeline stage?

        Module: mod => {
            assert(currentScope === undefined);
            currentScope = makeModuleScope();
            let modᐟ = {...mod, bindings: mod.bindings.map(rec), scope: currentScope};
            currentScope = undefined;
            return modᐟ;
        },

        RecordExpression: record => {
            let outerScope = currentScope;
            assert(currentScope !== undefined);
            currentScope = makeNestedScope(currentScope);
            let recordᐟ = {...record, bindings: record.bindings.map(rec), scope: currentScope};
            currentScope = outerScope;
            return recordᐟ;
        },

        // Definition: def => {
        //     let symbol = insert(currentScope, def.name);
        //     symbol.isExported = def.isExported;
        //     let defᐟ = {...def, expression: rec(def.expression), symbol};
        //     if (defᐟ.expression.kind === 'Block') {
        //         symbol.members = [...defᐟ.expression.scope.symbols.values()].filter(s => s.isExported);
        //     }
        //     return defᐟ;
        // },

        // ImportNames: n => {
        //     assert(currentScope === moduleScope); // sanity check
        //     let symbols = n.names.map(name => Object.assign(insert(currentScope, name), {isImported: true}));
        //     return {...n, symbols};
        // },

        // ImportNamespace: n => {
        //     assert(currentScope === moduleScope); // sanity check
        //     let symbol = insert(currentScope, n.namespace); // TODO: what about alias?
        //     symbol.isImported = true;

        //     // TODO: temp testing... hardcode some 'pen' exports for testing...
        //     if (n.moduleSpecifier === 'pen') {
        //         symbol.members = [
        //             {name: 'i32', isExported: true},
        //             {name: 'Memoize', isExported: true},
        //         ];
        //     }

        //     return {...n, symbol};
        // },

        // TODO: the rest are just pass-throughs... can these have 'default' processing?
        ApplicationExpression: n => ({...n, function: rec(n.function), argument: rec(n.argument)}),
        CharacterExpression: n => n,
        DynamicBinding: n => ({...n, name: rec(n.name), value: rec(n.value)}),
        ExportBinding: n => ({...n, value: rec(n.value)}),
        FieldPattern: n => ({...n, pattern: n.pattern ? rec(n.pattern) : undefined}),
        FunctionExpression: n => ({...n, pattern: rec(n.pattern), body: rec(n.body)}),
        ImportExpression: n => n,
        LabelExpression: n => n,
        RecordPattern: n => ({...n, fields: n.fields.map(rec)}),
        ReferenceExpression: n => n,
        SelectionExpression: n => ({...n, expressions: n.expressions.map(rec)}),
        SequenceExpression: n => ({...n, expressions: n.expressions.map(rec)}),
        ShorthandBinding: n => n,
        StaticBinding: n => ({...n, pattern: rec(n.pattern), value: rec(n.value)}),
        StaticMemberExpression: n => ({...n, namespace: rec(n.namespace)}),
        StringExpression: n => n,
        ThisExpression: n => n,
        TupleExpression: n => ({...n, elements: n.elements.map(rec)}),
        TuplePattern: n => ({...n, elements: n.elements.map(rec)}),
        VariablePattern: n => n,
        WildcardPattern: n => n,
    }));

    // TODO: do it
    let result = mapNode(ast);

    // sanity check - we should be back to the scope we started with here.
    assert(currentScope === undefined);

    // All done.
    return result;
}


// Helper function
function assert<T>(x: T): asserts x {
    if (!x) throw new Error(`Assertion failed`);
}