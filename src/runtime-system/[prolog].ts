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
    parse(): boolean;
    unparse(): boolean;
}


// TODO: explain... so stdlib and experiments can reference the helpers
declare const sys: {
    assert: (value: unknown) => asserts value;
    concat: (a: unknown, b: unknown) => unknown;
    getState: () => Registers;
    isFullyConsumed: (node: unknown, pos: number) => boolean;
    isPlainObject: (value: unknown) => value is Record<string, unknown>;
    isString: (value: unknown) => value is string;
    matchesAt: (text: string, substr: string, position: number) => boolean;
    setInState: (IDOCᐟ: unknown, IMEMᐟ: number) => void;
    setOutState: (ODOCᐟ: unknown) => void;
    setState: (value: Registers) => void;
};
