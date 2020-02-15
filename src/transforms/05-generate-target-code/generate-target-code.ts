import {Expression, Module, Node, Program, SourceFile} from '../../ast-nodes';
import {assert, makeNodeMapper} from '../../utils';
import {SymbolDefinitions} from '../03-create-symbol-definitions';
import {SymbolReferences} from '../04-resolve-symbol-references';
import {Emitter, makeEmitter} from './emitter';
import {identifierFromModuleSpecifier} from './identifier-from-module-specifier';
import {TargetCode} from './target-code';


// TODO: doc...
export function generateTargetCode(program: Program<SymbolDefinitions & SymbolReferences>): TargetCode {
    return emitProgram(program);
}


function emitProgram(program: Program<SymbolDefinitions & SymbolReferences>): TargetCode {
    let targetCode = new Map<SourceFile, string>();
    for (let [, sourceFile] of program.sourceFiles.entries()) {
        let emit = makeEmitter();
        emit.nl().nl().text(`// ==========  ${sourceFile.path}  ==========`).nl();
        emitSourceFile(emit, sourceFile);

        // // TODO: ...
        // const MODULE_ID = `module1`;
        // emit.nl().nl().text(`// ==========  ${MODULE_ID}  ==========`).nl();
        // emit.text(`function ${MODULE_ID}() {`).nl(+1);
        // emit.text(`if (${MODULE_ID}.cached) return ${MODULE_ID}.cached;`).nl();
        // emit.text(`// TODO: detect circular dependencies...`).nl();
        // emit.nl(-1).text(`}`);
        targetCode.set(sourceFile, emit.toString());
    }
    return targetCode;
}


function emitSourceFile(emit: Emitter, sourceFile: SourceFile<SymbolDefinitions & SymbolReferences>) {

    // TODO: every source file import the PEN standard library
    // TODO: how to ensure it can be loaded? Use rel path and copy file there?
    emit.text(`import * as ℙ from "penlib;"`).nl();

    let modSpecs = Object.keys(sourceFile.imports);
    modSpecs.forEach((modSpec, _i) => {
        let id = identifierFromModuleSpecifier(modSpec);
        // TODO: need to store this modspec->id association somewhere to refer back to it later
        emit.text(`import * as ${id} from ${JSON.stringify(modSpec)};`).nl();
    });
    emit.nl();

    // emit.text(`const imports = {`).nl(+1);
    // modSpecs.forEach((moduleId, i) => {
    //     emit.text(`${JSON.stringify(moduleId)}: _${i},`);
    //     if (i < modSpecs.length - 1) emit.nl();
    // });
    // emit.nl(-1).text('};').nl();

    emit.text('export default ');
    emitModule(emit, sourceFile.module);
}


function emitModule(emit: Emitter, module: Module<SymbolDefinitions & SymbolReferences>) {

    // remember, a module is an expression...
    emit.text('((() => {').nl(+1);

    // Declare all module-scoped variables.
    for (let [, symbol] of module.meta.scope.symbols) {
        // TODO: ensure no clashes with ES names, eg Object, String, etc
        emit.text(`const ${symbol.name} = ℙ.declare();`).nl();
    }
    emit.nl();

    // // Define all module-scoped variables.
    // for (let {pattern, value} of module.bindings) {
    //     if (pattern.kind === 'ModulePattern') {
    //         assert(value.kind === 'ImportExpression'); // TODO: relax this restriction later... Need different emit...
    //         let names = pattern.names.map(n => `${n.name}${n.alias ? ` as ${n.alias}` : ''}`).join(', ');
    //         emit.text(`const {${names}} = imports[${JSON.stringify(value.moduleSpecifier)}];`).nl();
    //     }
    //     else {
    //         emit.text(`const ${pattern.name} = {} as Rule;`).nl();
    //     }
    // }

    // TODO: Define all module-scoped variables...
    for (let {pattern, value} of module.bindings) {
        if (pattern.kind === 'ModulePattern') {
            assert(value.kind === 'ImportExpression'); // TODO: relax this restriction later... Need different emit...
            // TODO: emit...
            emit.nl().text('// TODO: define...').nl();
        }
        else {
            emit.nl().text('ℙ.define(').nl(+1);
            emit.text(`${pattern.name},`).nl();
            emitExpression(emit, value);
            emit.nl(-1).text(');').nl();

        }
    }

    // TODO: export stuff
    emit.text(`return {`).nl(+1);
    for (let [, symbol] of module.meta.scope.symbols) {
        emit.text(`${symbol.name},`).nl(); // TODO: filter to only exported symbols
    }
    emit.nl(-1).text('};').nl();

    emit.nl(-1).text('})());').nl();
}


function emitExpression(emit: Emitter, expr: Expression<SymbolDefinitions & SymbolReferences>) {
    switch (expr.kind) {
        case 'ApplicationExpression': return emitCall(emit, expr.function, [expr.argument]);
        case 'CharacterExpression': break; // TODO...
        case 'FunctionExpression': break; // TODO...
        case 'ImportExpression': break; // TODO...
        case 'LabelExpression': break; // TODO...
        case 'ListExpression': break; // TODO...
        case 'ModuleExpression': break; // TODO...
        case 'ParenthesisedExpression': break; // TODO...
        case 'RecordExpression': break; // TODO...
        case 'ReferenceExpression': return emit.text(expr.name);
        case 'SelectionExpression': return emitCall(emit, 'Selection', expr.expressions);
        case 'SequenceExpression': return emitCall(emit, 'Sequence', expr.expressions);
        case 'StaticMemberExpression': break; // TODO...
        case 'StringExpression': return emit.text(JSON.stringify(expr.value));
        default: throw new Error('Internal Error'); // TODO...
    }
    emit.text('<expression>');
}


// TODO: temp testing...
function emitCall(emit: Emitter, fn: string | Expression<SymbolDefinitions & SymbolReferences>, args: ReadonlyArray<Expression<SymbolDefinitions & SymbolReferences>>) {
    if (typeof fn === 'string') {
        emit.text(fn);
    }
    else {
        emitExpression(emit, fn);
    }
    emit.text(`(`).nl(+1);
    args.forEach((arg, i) => {
        emitExpression(emit, arg);
        if (i < args.length - 1) emit.text(',').nl();
    });
    emit.nl(-1).text(`)`);
}











// TODO: was... remove...
export function generateTargetCodeOLD(program: Program) {
    let emit = makeEmitter();

    let emitNode = makeNodeMapper<Node, Node>();
    emitNode(program, rec => ({

        ApplicationExpression: (app: any) => {
            emitCall(app.function, [app.argument], rec);
            return app;
        },

        // TODO:  ==========   OLD ast - update this to new ast...   ==========
        // Block: block => {
        //     let symbols = [...block.scope.symbols.values()];
        //     switch (block.scope.kind) {
        //         case 'Module':
        //             symbols.forEach(sym => {
        //                 if (sym.isImported) return;
        //                 emit.text(`${sym.isExported ? 'export ' : ''}const ${sym.name} = {};`).nl();
        //             });
        //             rec(...block.definitions);
        //             break;
        //         case 'Nested':
        //             // TODO: use an IIFE
        //             emit.text(`(() => {`).nl(+1);
        //             symbols.forEach(sym => {
        //                 emit.text(`const ${sym.name} = {};`).nl();
        //             });
        //             rec(...block.definitions);
        //             emit.text(`const exports = {${symbols.filter(s => s.isExported).map(s => s.name).join(', ')}};`);
        //             emit.nl();
        //             emit.text(`return Object.assign(start, exports);`);
        //             emit.nl(-1).text(`})()`);
        //             break;
        //     }
        // },

        // TODO:  ==========   OLD ast - update this to new ast...   ==========
        // Definition: def => {
        //     emit.text(`Object.assign(`).nl(+1);
        //     emit.text(def.name + ',').nl();
        //     rec(def.expression);
        //     emit.nl(-1).text(`);`).nl();
        // },

        ParenthesisedExpression: (par: any) => {
            rec(par.expression);
            return par;
        },

        // TODO: ...
        RecordExpression: (n: any) => n,
        // RecordField: field => {
        //     emit.text(`{`).nl(+1);
        //     emit.text(`computed: ${field.hasComputedName},`).nl().text(`name: `);
        //     if (typeof field.name === 'string') {
        //         // assert(hasComputedName === false)
        //         emit.text(JSON.stringify(field.name));
        //     }
        //     else {
        //         // assert(hasComputedName === true)
        //         rec(field.name);
        //     }
        //     emit.text(`,`).nl().text(`value: `);
        //     rec(field.expression);
        //     emit.nl(-1).text(`}`);
        // },
        // RecordLiteral: record => {
        //     emit.text(`Record([`).nl(+1);
        //     record.fields.forEach((field, i) => {
        //         rec(field);
        //         if (i < record.fields.length - 1) emit.text(',').nl();
        //     });
        //     emit.nl(-1).text(`])`);
        // },

        ReferenceExpression: (ref: any) => {
            // TODO: ...
            // let namespaces = ref.namespaces ? ref.namespaces.map(ns => `${ns}.exports.`) : [];
            // emit.text(`Reference(${namespaces.join('')}${ref.name})`);
            return ref;
        },

        SelectionExpression: (sel: any) => {
            emitCall('Selection', sel.expressions, rec);
            return sel;
        },

        SequenceExpression: (seq: any) => {
            emitCall('Sequence', seq.expressions, rec);
            return seq;
        },

        StaticMemberExpression: (memb: any) => {
            // TODO: ...
            // let namespaces = ref.namespaces ? ref.namespaces.map(ns => `${ns}.exports.`) : [];
            // emit.text(`Reference(${namespaces.join('')}${ref.name})`);
            return memb;
        },

        StringExpression: (str: any) => {
            // TODO: ...
            emit.text(`StringExpression(${JSON.stringify(str.value)})`);
            return str;
        },

        // TODO: ...
        VariablePattern: (pat: any) => {
            emit.text(`// TODO: VariablePattern for ${pat.name}`).nl();
            return pat;
        },
    } as any));

    // TODO: temp testing...
    return emit.toString();

    // TODO: temp testing...
    function emitCall(fn: string | Expression, args: ReadonlyArray<Expression>, rec: any) {
        if (typeof fn === 'string') {
            emit.text(fn);
        }
        else {
            rec(fn);
        }
        emit.text(`(`).nl(+1);
        args.forEach((arg, i) => {
            rec(arg);
            if (i < args.length - 1) emit.text(',').nl();
        });
        emit.nl(-1).text(`)`);
    }
}
