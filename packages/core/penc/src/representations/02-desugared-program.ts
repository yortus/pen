import {AbsPath} from '../utils';
import {ModuleMap, NodeKind} from './nodes';
import {Program} from './program';


export interface DesugaredProgram extends Program<DesugaredNodeKind> {
    readonly kind: 'Program';
    readonly sourceFiles: ModuleMap<DesugaredNodeKind>;
    readonly mainPath: AbsPath;
    readonly startGlobalName?: string;
}


type DesugaredNodeKind = Exclude<NodeKind,
    | 'GlobalBinding'
    | 'GlobalReferenceExpression'
    | 'LocalMultiBinding'
    | 'ParenthesisedExpression'
>;