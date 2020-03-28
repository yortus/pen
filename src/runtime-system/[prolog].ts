type Datatype = Lambda | Module | Rule;


interface Lambda {
    kind: 'lambda';
    apply(arg: Datatype): Datatype;
}


interface Module {
    kind: 'module';
    bindings: Record<string, Datatype>;
}


/**
 * TODO: doc...
 * - modifies `result` iff return value is true -OR- if returns false, result may be garbage WHICH IS IT? 2nd is more flexible for impls
 * - meaning of `pos` and `posᐟ` for nodes is rule-specific
 */
interface Rule {
    kind: 'rule';
    parse(text: string, pos: number, result: {node: unknown, posᐟ: number}): boolean;
    unparse(node: unknown, pos: number, result: {text: string, posᐟ: number}): boolean;
}
