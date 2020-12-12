import type {Expression} from '../../ast-nodes';
import type {Definition} from '../../representations';
import {assert} from '../../utils';


// TODO: jsdoc...
export type Scope = Record<string, Definition | undefined>;


// TODO: jsdoc...
export function createSymbolTable() {
    const definitions = {} as Record<string, Definition>;
    const RESERVED_DEFINITION_IDS = ['start'];
    const existingDefinitionIds = new Set<string>(RESERVED_DEFINITION_IDS);
    const scopesByDefinitionId = new Map<string, Scope>();

    // Define a root scope.
    const rootScope: Scope = Object.create(null);

    return {
        // TODO: jsdoc...
        definitions,

        // TODO: jsdoc...
        createScope(surroundingScope?: Scope) {
            surroundingScope ??= rootScope;
            const scope = Object.create(surroundingScope);
            return scope;
        },

        // TODO: jsdoc...
        // Helper function to add a definition for `name` into the given module's scope.
        define(scope: Scope, name: string, value: Expression): Definition {
            if (Object.keys(scope).includes(name)) {
                throw new Error(`'${name}' is already defined`); // TODO: improve diagnostic message eg line+col
            }
            const definitionId = createDefinitionId(name);
            const definition: Definition = {definitionId, localName: name, value};
            definitions[definitionId] = definition;
            scope[name] = definition;
            scopesByDefinitionId.set(definitionId, scope);
            return definition;
        },

        // TODO: jsdoc...
        lookup(scope: Scope, name: string): Definition {
            const definition = scope[name];
            if (!definition) {
                throw new Error(`'${name}' is not defined`); // TODO: improve diagnostic message eg line+col
            }
            return definition;
        },

        // TODO: jsdoc...
        getScopeFor(definition: Definition): Scope {
            const scope = scopesByDefinitionId.get(definition.definitionId);
            assert(scope);
            return scope;
        }
    };

    // TODO: doc... helper
    function createDefinitionId(name: string): string {
        // Ensure no duplicate or reserved definitionIds are generated by adding a numeric suffix where necessary.
        let result = name;
        let counter = 1;
        while (existingDefinitionIds.has(result)) result = `${name}${++counter}`;
        existingDefinitionIds.add(result);
        return result;
    }
}
