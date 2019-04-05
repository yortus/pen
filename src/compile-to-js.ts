import {parse} from './parse';
import {Symbol, symbolTable} from './symbols';
import {transformAstBottomUp} from './transform-ast-bottom-up';




export interface PenSourceCode {code: string; }
export interface JsTargetCode {code: string; }




export function compileToJs(source: PenSourceCode): JsTargetCode {

    // 1. parse source (PEN) input code ==> ast
    let ast = parse(source.code);

    // 2. analyse and check ast

    // 2a. define all symbols within their scopes
    let ast2 = transformAstBottomUp(ast, {
        Block: block => {
            symbolTable.enterScope();
            return {...block, scope: symbolTable.currentScope};
        },
        Definition: defn => {
            // TODO: fix hardcoded 'Pattern', since not always a Pattern, may be a Combinator. But we don't know yet.
            //       e.g. if node.expression is a 'Reference', what kind does it refer to? Refs are not resolved yet.
            //       This seems to be really a type-checking thing (so do a runtime check if no static type checking).
            const symbol: Symbol = {kind: 'Pattern', name: defn.name, scope: symbolTable.currentScope};
            symbolTable.define(symbol);
            return {...defn, symbol};
        },
    });
    [] = [ast2];

    // 3. emit ast ==> target (JS) output code

    // 4. PROFIT
    let target: JsTargetCode = {code: [].join('\n')};
    return target;
}












// function indent() { prefix += '    '; }
// function dedent() { prefix = prefix.slice(4); }
// function emit(...lines: string[]) {
//     for (let line of lines) output.push(`${prefix}${line}`);
// }
// let prefix = '';
// let output = [] as string[];
