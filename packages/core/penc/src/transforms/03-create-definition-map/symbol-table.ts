import type {Definition, Expression} from '../../abstract-syntax-trees';
import {assert} from '../../utils';


// TODO: jsdoc...
// TODO: ensure can never clash with any identifier name or moduleId
export const ROOT_MODULE_ID = 'Ɱ__root';


// TODO: jsdoc...
export function createSymbolTable() {
    type Scope = Record<string, Definition | undefined>;
    const scopesByModuleId = new Map<string, Scope>();
    const definitions = {} as Record<string, Definition>;
    const definitionIds = new Set<string>();

    // Define a root scope.
    const rootScope = Object.create(null);
    scopesByModuleId.set(ROOT_MODULE_ID, rootScope);

    return {
        // TODO: jsdoc...
        definitions,

        // TODO: jsdoc...
        createScope(moduleId: string, parentModuleId?: string) {
            const parentScope = parentModuleId ? scopesByModuleId.get(parentModuleId)! : rootScope;
            assert(parentModuleId === undefined || parentScope);
            const scope = Object.create(parentScope);
            scopesByModuleId.set(moduleId, scope);
        },

        // TODO: jsdoc...
        // Helper function to add a definition for `name` into the given module's scope.
        define(moduleId: string, name: string, value: Expression): Definition {
            const scope = scopesByModuleId.get(moduleId);
            assert(scope); // sanity check
            if (Object.keys(scope).includes(name)) {
                throw new Error(`'${name}' is already defined`); // TODO: improve diagnostic message eg line+col
            }
            const definitionId = createDefinitionId(name);
            const definition: Definition = {kind: 'Definition', definitionId, moduleId, localName: name, value};
            definitions[definitionId] = definition;
            scope[name] = definition;
            return definition;
        },

        // TODO: jsdoc...
        lookup(moduleId: string, name: string): Definition {
            const scope = scopesByModuleId.get(moduleId);
            assert(scope); // sanity check
            const definition = scope[name];
            if (!definition) {
                throw new Error(`'${name}' is not defined`); // TODO: improve diagnostic message eg line+col
            }
            return definition;
        },
    };

    function createDefinitionId(name: string): string {
        // Ensure no duplicate definitionIds are generated by adding a numeric suffix where necessary.
        let result = name;
        let counter = 1;
        while (definitionIds.has(result)) result = `${name}${++counter}`;
        definitionIds.add(result);
        return result;
    }
}
