import type {AbsPath} from '../utils';


// TODO: versions...
// - UNKNOWN = widest possible type (all nodes kinds, least-specific node prop types)
// - RAW = as written in the source code (no TODO???)
// - V1/NORMAL (no ImportExpression, ParenthesisedExpression, TODO Binding stuff?)
// - TODO: resolved? flat?
export const RAW = 'RAW';
export const NORMAL = 'N1';
export type RAW = typeof RAW;
export type NORMAL = typeof NORMAL;
export type Version = RAW | NORMAL;


export interface AST<V extends Version = Version> {
    version: V;
    // TODO: jsdoc... has a special 'start' binding
    module: Module<V>;
}


/** Union of all possible node types that may occur in a PEN AST. */
export type Node<V extends Version = Version> =
    | Binding<V>
    | Expression<V>
    | Pattern<V>
;


/** Union of all node types that bind names to expressions. */
export type Pattern<V extends Version = Version> =
    ModulePattern<V>
;


/** Union of all node types that represent PEN expressions. */
export type Expression<V extends Version = Version> =
    | BindingList<V>
    | BooleanLiteral
    | FieldExpression<V>
    | Identifier
    | ImportExpression<V>
    | InstantiationExpression<V>
    | Intrinsic
    | GenericExpression<V>
    | ListExpression<V>
    | MemberExpression<V>
    | Module<V>
    | NotExpression<V>
    | NullLiteral
    | NumericLiteral
    | ParenthesisedExpression<V>
    | QuantifiedExpression<V>
    | RecordExpression<V>
    | SelectionExpression<V>
    | SequenceExpression<V>
    | StringLiteral
;


export type Binding<V extends Version> = {
    RAW: {
        readonly kind: 'Binding';
        readonly left: Identifier | Pattern<V>;
        readonly right: Expression<V>;
    };
    N1: never;
}[V];


export type BindingList<V extends Version> = {
    RAW: {
        readonly kind: 'BindingList';
        readonly bindings: ReadonlyArray<Binding<V>>;
    };
    N1: never;
}[V];


export interface BooleanLiteral {
    readonly kind: 'BooleanLiteral';
    readonly value: boolean;
}


export interface FieldExpression<V extends Version> {
    readonly kind: 'FieldExpression';
    readonly name: Expression<V>;
    readonly value: Expression<V>;
}


export interface Identifier {
    readonly kind: 'Identifier';
    readonly name: string;
    readonly resolved?: boolean;
}


export type ImportExpression<V extends Version> = {
    RAW: {
        readonly kind: 'ImportExpression';
        readonly moduleSpecifier: string;
    };
    N1: never;
}[V];


export interface InstantiationExpression<V extends Version> {
    readonly kind: 'InstantiationExpression';
    readonly generic: Expression<V>;
    readonly argument: Expression<V>;
}


export interface Intrinsic {
    readonly kind: 'Intrinsic';
    readonly name: string;
    readonly path: AbsPath;
}


export interface GenericExpression<V extends Version> {
    readonly kind: 'GenericExpression';
    readonly param: Identifier | Pattern<V>;
    readonly body: Expression<V>;
}


export interface ListExpression<V extends Version> {
    readonly kind: 'ListExpression';
    readonly elements: ReadonlyArray<Expression<V>>;
}


export interface MemberExpression<V extends Version> {
    readonly kind: 'MemberExpression';
    readonly module: Expression<V>;
    readonly member: Identifier;
}


export type Module<V extends Version> = {
    RAW: never;
    N1: {
        readonly kind: 'Module';
        readonly bindings: Readonly<Record<string, Expression<V>>>; // TODO: doc special optional 'start' binding
    };
}[V];


export interface ModulePattern<_V> {
    readonly kind: 'ModulePattern';
    readonly names: ReadonlyArray<{
        readonly name: string;
        readonly alias?: string;
    }>;
}


export interface NotExpression<V extends Version> {
    readonly kind: 'NotExpression';
    readonly expression: Expression<V>;
}


export interface NullLiteral {
    readonly kind: 'NullLiteral';
    readonly value: null;
}


export interface NumericLiteral {
    readonly kind: 'NumericLiteral';
    readonly value: number;
}


export type ParenthesisedExpression<V extends Version> = {
    RAW: {
        readonly kind: 'ParenthesisedExpression';
        readonly expression: Expression<V>;
    };
    N1: never;
}[V];


export interface QuantifiedExpression<V extends Version> {
    readonly kind: 'QuantifiedExpression';
    readonly expression: Expression<V>;
    readonly quantifier: '?' | '*';
}


export interface RecordExpression<V extends Version> {
    readonly kind: 'RecordExpression';
    readonly fields: ReadonlyArray<{
        readonly name: string;
        readonly value: Expression<V>;
    }>;
}


export interface SelectionExpression<V extends Version> {
    readonly kind: 'SelectionExpression';
    readonly expressions: ReadonlyArray<Expression<V>>;
}


export interface SequenceExpression<V extends Version> {
    readonly kind: 'SequenceExpression';
    readonly expressions: ReadonlyArray<Expression<V>>;
}


export interface StringLiteral {
    readonly kind: 'StringLiteral';
    readonly value: string;
    readonly concrete: boolean;
    readonly abstract: boolean;
}
