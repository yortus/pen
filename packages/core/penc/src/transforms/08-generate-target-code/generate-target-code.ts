import * as fs from 'fs';
import * as path from 'path';
import * as AstNodes from '../../ast-nodes';
import {SymbolTable} from '../../symbol-table';
import {assert, makeNodeVisitor} from '../../utils';
import {Metadata} from '../07-check-semantics';
import {Emitter, makeEmitter} from './emitter';
import {Mode, PARSE, PRINT} from './modes';
import * as modes from './modes';


type Program = AstNodes.Program<Metadata>;
type Expression = AstNodes.Expression<Metadata>;
type SelectionExpression = AstNodes.SelectionExpression<Metadata>;
type SequenceExpression = AstNodes.SequenceExpression<Metadata>;


// TODO: doc...
export function generateTargetCode(program: Program) {
    const emit = makeEmitter();

    // TODO: temp testing... emit runtime... penrt.js is copied into the dist/ dir as part of the postbuild script
    const RUNTIME_PATH = require.resolve('../../deps/penrt');
    let content = fs.readFileSync(RUNTIME_PATH, 'utf8') + '\n';
    content.split(/[\r\n]+/).filter(line => !!line.trim()).forEach(line => emit.down(1).text(line));

    // TODO: emit extensions...
    emitExtensions(emit, program);

    // TODO: temp testing... emit parse() fn and print() fn
    emitProgram(emit, program, PARSE);
    emitProgram(emit, program, PRINT);

    // TODO: Emit main exports... must come after symbol decls, since it refs the start rule
    emit.down(2).text(`// -------------------- Main exports --------------------`);
    emit.down(1).text(`module.exports = {`).indent();
    for (let mode of [PARSE, PRINT] as const) {
        const fname = mode === PARSE ? 'parse' : 'print';
        const paramName = mode === PARSE ? 'text' : 'node';
        emit.down(1).text(`${fname}(${paramName}) {`).indent();
        emit.down(1).text(`setState({ IN: ${paramName}, IP: 0 });`);
        emit.down(1).text(`if (!${fname}()) throw new Error('${fname} failed');`);
        emit.down(1).text(`if (!isInputFullyConsumed()) throw new Error('${fname} didn\\\'t consume entire input');`);
        emit.down(1).text(`if (OUT === undefined) throw new Error('${fname} didn\\\'t return a value');`);
        emit.down(1).text(`return OUT;`);
        emit.dedent().down(1).text(`},`);
    }
    emit.dedent().down(1).text(`};`);

    // All done.
    return emit.down(1).toString();
}


function emitExtensions(emit: Emitter, program: Program) {
    let visitNode = makeNodeVisitor<AstNodes.Node<Metadata>>();
    emit.down(2).text(`// -------------------- Extensions --------------------`);
    visitNode(program, _ => ({
        ExtensionFile: ext => {
            emit.down(1).text(`const createExtension${ext.meta.scope.id} = (() => {`).indent();
            let content = fs.readFileSync(ext.path, 'utf8') + '\n';
            content.split(/[\r\n]+/).filter(line => !!line.trim()).forEach(line => emit.down(1).text(line));
            emit.down(2).text(`return ({mode}) => {`).indent();
            ext.exportedNames.forEach(name => emit.down(1).text(`let _${name} = ${name}({mode});`));
            emit.down(1).text(`return (name) => {`).indent();
            emit.down(1).text(`switch(name) {`).indent();
            ext.exportedNames.forEach(name => emit.down(1).text(`case '${name}': return _${name};`));
            emit.down(1).text(`default: return undefined;`);
            emit.dedent().down(1).text('}');
            emit.dedent().down(1).text('};');
            emit.dedent().down(1).text('};');
            emit.dedent().down(1).text('})();');
        },
    }));
}


function emitProgram(emit: Emitter, program: Program, mode: PARSE | PRINT) {

    // TODO: emit prolog...
    emit.down(5).text(`// --------------------------------------------------------------------------------`);
    emit.down(1).text(`const ${mode === PARSE ? 'parse' : 'print'} = (() => {`).indent();

    // TODO: Emit definitions for all symbols (ie module bindings where lhs is a VariablePattern)
    emitSymbolDefinitions(emit, program, mode);

    // TODO: Emit compile-time constants...
    emitConstants(emit, program);

    // TODO: emit epilog...
    let start = program.meta.symbolTable.getSymbolById(program.meta.startSymbolId);
    assert(start.kind === 'NameSymbol');
    emit.down(2).text(`return ${start.scope.id}('${start.sourceName}');`);
    emit.dedent().down(1).text('})();');
}


function emitSymbolDefinitions(emit: Emitter, program: Program, mode: Mode) {
    const {symbolTable} = program.meta;
    let visitNode = makeNodeVisitor<AstNodes.Node<Metadata>>();
    visitNode(program, rec => ({
        ExtensionFile: ext => {
            let scope = ext.meta.scope;
            emit.down(2).text(`const ${scope.id} = createExtension${scope.id}({mode: ${mode}});`);
        },
        PenSourceFile: sf => {
            emit.down(2).text(`// -------------------- ${path.basename(sf.path)} --------------------`);
            rec(sf.module);
        },
        Module: mod => {
            // Emit module definition
            let moduleScope = mod.meta.scope;
            emit.down(2).text(`const ${moduleScope.id} = (name) => {`).indent();
            emit.down(1).text(`switch (name) {`).indent();
            for (let sourceName of moduleScope.sourceNames.keys()) {
                emit.down(1).text(`case '${sourceName}': return ${moduleScope.id}_${sourceName};`);
            }
            emit.down(1).text(`default: return undefined;`);
            emit.dedent().down(1).text(`}`);
            emit.dedent().down(1).text(`};`);

            // Emit definitions for each module binding
            for (let {pattern, value} of mod.bindings) {
                if (pattern.kind === 'ModulePattern' && pattern.names.length > 0) {
                    // Each ModulePatternName *must* be an alias to a name in the rhs module
                    for (let {name, meta: {symbolId}} of pattern.names) {
                        let symbol = symbolTable.getSymbolById(symbolId);
                        assert(symbol.kind === 'NameSymbol');
                        let {scope, sourceName} = symbol;
                        let qualName = `${scope.id}_${sourceName}`;
                        emit.down(2).text(`const ${qualName} = (arg) => `);
                        emitExpression(emit, value, symbolTable, mode); // rhs *must* be a module
                        emit.text(`('${name}')(arg);`); // TODO: still needs fixing...
                    }
                }
                else if (pattern.kind === 'VariablePattern') {
                    let symbol = symbolTable.getSymbolById(pattern.meta.symbolId);
                    assert(symbol.kind === 'NameSymbol');
                    let {scope, sourceName} = symbol;
                    let qualName = `${scope.id}_${sourceName}`;
                    emit.down(2).text(`const ${qualName} = (arg) => {`).indent();
                    emit.down(1).text(`if (!${qualName}_memo) ${qualName}_memo = `);
                    emitExpression(emit, value, symbolTable, mode);
                    emit.text(`;`).down(1).text(`return ${qualName}_memo(arg);`);
                    emit.dedent().down(1).text('};');
                    emit.down(1).text(`let ${qualName}_memo;`);
                }
            }

            // Visit all child nodes recursively
            mod.bindings.forEach(rec);
        },
    }));
}


function emitConstants(emit: Emitter, program: Program) {
    const {symbolTable} = program.meta;
    let visitNode = makeNodeVisitor<AstNodes.Node<Metadata>>();
    emit.down(2).text(`// -------------------- Compile-time constants --------------------`);
    visitNode(program, rec => ({
        Module: mod => {
            for (let {pattern} of mod.bindings) {
                if (pattern.kind === 'VariablePattern') {
                    let symbol = symbolTable.getSymbolById(pattern.meta.symbolId);
                    assert(symbol.kind === 'NameSymbol');
                    if (!symbol.constant) continue;
                    emit.down(1).text(`${symbol.scope.id}('${symbol.sourceName}').constant = {value: `);
                    emitConstant(emit, symbol.constant.value);
                    emit.text('};');
                }
            }
            mod.bindings.forEach(rec);
        },
    }));
}


function emitExpression(emit: Emitter, expr: Expression, symbolTable: SymbolTable, mode: Mode) {
    switch (expr.kind) {
        case 'ApplicationExpression':
            emit.text('(');
            emitExpression(emit, expr.lambda, symbolTable, mode);
            emit.text(')(');
            emitExpression(emit, expr.argument, symbolTable, mode);
            emit.text(`)`);
            break;

        case 'BindingLookupExpression':
            emitExpression(emit, expr.module, symbolTable, mode);
            emit.text(`('${expr.bindingName}')`);
            break;

        case 'BooleanLiteralExpression':
        case 'NullLiteralExpression':
        case 'NumericLiteralExpression': {
            const outText = modes.isParse(mode) && modes.hasOutput(mode) ? JSON.stringify(expr.value) : 'undefined';
            const fname = expr.kind.substr(0, 3).toUpperCase();
            emit.text(`function ${fname}() {`).indent();
            if (modes.isPrint(mode) && modes.hasInput(mode)) {
                emit.down(1).text(`if (IN !== ${JSON.stringify(expr.value)} || IP !== 0) return false;`);
                emit.down(1).text(`IP += 1;`);
            }
            emit.down(1).text(`OUT = ${outText};`);
            emit.down(1).text(`return true;`);
            emit.dedent().down(1).text('}');
            break;
        }

        case 'FieldExpression':
            emit.text('field({').indent();
            emit.down(1).text(`mode: ${mode},`);
            emit.down(1).text('name: ');
            emitExpression(emit, expr.name, symbolTable, mode);
            emit.text(',').down(1).text('value: ');
            emitExpression(emit, expr.value, symbolTable, mode);
            emit.text(',').dedent().down(1).text('})');
            break;

        case 'ImportExpression':
            emit.text(expr.meta.scope.id);
            break;

        // case 'LambdaExpression':
        //     break; // TODO...

        case 'ListExpression':
            emit.text('list({').indent();
            emit.down(1).text(`mode: ${mode},`);
            emit.down(1).text('elements: [');
            if (expr.elements.length > 0) {
                emit.indent();
                for (let element of expr.elements) {
                    emit.down(1);
                    emitExpression(emit, element, symbolTable, mode);
                    emit.text(',');
                }
                emit.dedent().down(1);
            }
            emit.text('],').dedent().down(1).text('})');
            break;

        case 'ModuleExpression':
            emit.text(expr.module.meta.scope.id);
            break;

        case 'NotExpression': {
            const exprVar = newId();
            emit.text('(() => {').indent();
            emit.down(1).text(`const ${exprVar} = `);
            emitExpression(emit, expr.expression, symbolTable, mode);
            emit.text(';');
            emit.down(1).text(`return function NOT() {`).indent();
            emit.down(1).text(`let stateₒ = getState();`);
            emit.down(1).text(`let result = !${exprVar}();`);
            emit.down(1).text(`setState(stateₒ);`);
            emit.down(1).text(`OUT = undefined;`);
            emit.down(1).text(`return result;`);
            emit.dedent().down(1).text(`};`);
            emit.dedent().down(1).text('})()');
            break;
        }

        case 'ParenthesisedExpression':
            // TODO: emit extra parens?
            emitExpression(emit, expr.expression, symbolTable, mode);
            break;

        case 'QuantifiedExpression':
            emit.text(`${expr.quantifier === '?' ? 'zeroOrOne' : 'zeroOrMore'}({`).indent();
            emit.down(1).text(`mode: ${mode},`);
            emit.down(1).text('expression: ');
            emitExpression(emit, expr.expression, symbolTable, mode);
            emit.text(',');
            emit.dedent().down(1).text('})');
            break;

        case 'RecordExpression':
            emit.text('record({').indent();
            emit.down(1).text(`mode: ${mode},`);
            emit.down(1).text('fields: [');
            if (expr.fields.length > 0) {
                emit.indent();
                for (let field of expr.fields) {
                    emit.down(1).text('{').indent();
                    emit.down(1).text(`name: '${field.name}',`);
                    emit.down(1).text(`value: `);
                    emitExpression(emit, field.value, symbolTable, mode);
                    emit.text(',').dedent().down(1).text('},');
                }
                emit.dedent().down(1);
            }
            emit.text('],').dedent().down(1).text('})');
            break;

        case 'ReferenceExpression':
            let ref = symbolTable.getSymbolById(expr.meta.symbolId);
            assert(ref.kind === 'NameSymbol');
            emit.text(`${ref.scope.id}('${ref.sourceName}')`);
            break;

        case 'SelectionExpression':
            emitSelectionExpression(emit, expr, symbolTable, mode);
            break;

        case 'SequenceExpression':
            emitSequenceExpression(emit, expr, symbolTable, mode);
            break;

        case 'StringLiteralExpression': {
            const localMode = (mode & ~(expr.abstract ? 4 : expr.concrete ? 2 : 0)) as Mode;
            emit.text('function STR() {').indent();
            if (modes.hasInput(localMode)) {
                if (modes.isPrint(localMode)) emit.down(1).text(`if (typeof IN !== 'string') return false;`);
                emit.down(1).text(`if (IP + ${expr.value.length} > IN.length) return false;`);
                for (let i = 0; i < expr.value.length; ++i) {
                    emit.down(1).text(`if (IN.charCodeAt(IP + ${i}) !== ${expr.value.charCodeAt(i)}) return false;`);
                }
                emit.down(1).text(`IP += ${expr.value.length};`);
            }
            emit.down(1).text(`OUT = ${modes.hasOutput(localMode) ? JSON.stringify(expr.value) : 'undefined'};`);
            emit.down(1).text(`return true;`);
            emit.dedent().down(1).text('}');
            break;
        }

        default:
            throw new Error('Internal Error'); // TODO...
    }
}


function emitSelectionExpression(emit: Emitter, expr: SelectionExpression, symbolTable: SymbolTable, mode: Mode) {
    const arity = expr.expressions.length;
    const exprVars = expr.expressions.map(_ => newId());
    emit.text('(() => {').indent();
    for (let i = 0; i < arity; ++i) {
        emit.down(1).text(`const ${exprVars[i]} = `);
        emitExpression(emit, expr.expressions[i], symbolTable, mode);
        emit.text(';');
    }
    emit.down(1).text('return function SEL() {').indent();
    for (let i = 0; i < arity; ++i) {
        emit.down(1).text(`if (${exprVars[i]}()) return true;`);
    }
    emit.down(1).text('return false;');
    emit.dedent().down(1).text('};');
    emit.dedent().down(1).text('})()');
}


function emitSequenceExpression(emit: Emitter, expr: SequenceExpression, symbolTable: SymbolTable, mode: Mode) {
    const arity = expr.expressions.length;
    const exprVars = expr.expressions.map(_ => newId());
    emit.text('(() => {').indent();
    for (let i = 0; i < arity; ++i) {
        emit.down(1).text(`const ${exprVars[i]} = `);
        emitExpression(emit, expr.expressions[i], symbolTable, mode);
        emit.text(';');
    }
    emit.down(1).text('return function SEQ() {').indent();
    emit.down(1).text('let stateₒ = getState();');
    emit.down(1).text('let out;');
    for (let i = 0; i < arity; ++i) {
        emit.down(1).text(`if (${exprVars[i]}()) out = concat(out, OUT); else return setState(stateₒ), false;`);
    }
    emit.down(1).text('OUT = out;');
    emit.down(1).text('return true;');
    emit.dedent().down(1).text('};');
    emit.dedent().down(1).text('})()');
}


// TODO: helper function
function emitConstant(emit: Emitter, value: unknown) {
    if (typeof value === 'number' || typeof value === 'boolean' || value === 'null') {
        emit.text(String(value));
    }
    else if (typeof value === 'string') {
        emit.text(JSON.stringify(value));
    }
    else {
        throw new Error(`Unsupported constant type '${typeof value}'`); // TODO: revisit when more const types exist
    }
}


// TODO: helper function
function newId(prefix = 't') {
    return `${prefix}${++counter}`;
}
let counter = -1;
