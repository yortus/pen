import type {UNKNOWN, BindingList, Expression, Module, NORMAL} from './versioned-ast';


// TODO: jsdoc...
// TODO: fix hacky typing of in/out node versions
export function moduleFromBindingList({bindings}: BindingList<UNKNOWN>): Module<NORMAL> {
    const bindingsObject = {} as {[name: string]: Expression};
    for (let {left, right} of bindings) {
        if (left.kind === 'Identifier') {
            if (bindingsObject.hasOwnProperty(left.name)) {
                // TODO: improve diagnostic message eg line+col
                new Error(`'${left.name}' is already defined`);
            }
            bindingsObject[left.name] = right;
        }
        else /* left.kind === 'ModulePattern */ {
            for (let {name, alias} of left.names) {
                if (bindingsObject.hasOwnProperty(alias || name)) {
                    // TODO: improve diagnostic message eg line+col
                    new Error(`'${alias || name}' is already defined`);
                }
                bindingsObject[alias || name] = {
                    kind: 'MemberExpression',
                    module: right,
                    member: {kind: 'Identifier', name},
                };
            }
        }
    }
    // TODO: remove cast after fixing typing
    return {kind: 'Module', bindings: bindingsObject as any};
}
