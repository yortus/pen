export type Scope = ModuleScope | NestedScope;


export interface ModuleScope {
    kind: 'ModuleScope';
    symbols: Map<string, SymbolInfo>; // maps name to symbol info
}


export interface NestedScope {
    kind: 'NestedScope';
    parent: Scope;
    symbols: Map<string, SymbolInfo>; // maps name to symbol info
}


export interface SymbolInfo {
    name: string;
    isImported?: boolean;
    isExported?: boolean;
    members?: SymbolInfo[];
}


export function insert(scope: Scope, name: string): SymbolInfo {
    // ensure not already defined in this scope
    if (scope.symbols.has(name)) throw new Error(`Symbol '${name}' is already defined.`);
    let sym: SymbolInfo = {name};
    scope.symbols.set(name, sym);
    return sym;
}


export function lookup(scope: Scope, name: string): SymbolInfo {
    if (scope.symbols.has(name)) return scope.symbols.get(name)!;
    if (scope.kind !== 'NestedScope') throw new Error(`Symbol '${name}' is not defined.`);
    return lookup(scope.parent, name);
}


export function makeModuleScope(): ModuleScope {
    let symbols = new Map<string, SymbolInfo>();
    return  {kind: 'ModuleScope', symbols};
}


export function makeNestedScope(parent: Scope): NestedScope {
    let symbols = new Map<string, SymbolInfo>();
    return {kind: 'NestedScope', parent, symbols};
}