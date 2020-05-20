// TODO: ...
type StaticForm = (options: StaticOptions) => PenVal;
interface StaticOptions {
    in: 'txt' | 'ast' | 'nil';
    out: 'txt' | 'ast' | 'nil';
}






interface PenVal {
    // module
    bindings?: Record<string, PenVal>;

    // rule
    rule?(): boolean;

    // lambda
    lambda?(arg: PenVal): PenVal;

    // compile-time constant
    constant?: {value: unknown};
}


// TODO: new 'registers'... temp testing...
let IN: unknown;
let IP: number;
let OUT: unknown;


function getState() {
    return {IN, IP};
}


function setState(state: {IN: unknown, IP: number}) {
    IN = state.IN;
    IP = state.IP;
}


// TODO: doc... helper...
function assert(value: unknown): asserts value {
    if (!value) throw new Error(`Assertion failed`);
}


// TODO: doc... helper...
// TODO: provide faster impl for known cases - eg when unparsing to text, don't need array/object handling
//       (but instrument first)
function concat(a: unknown, b: unknown): unknown {
    if (a === undefined) return b;
    if (b === undefined) return a;
    if (typeof a === 'string' && typeof b === 'string') return a + b;
    if (Array.isArray(a) && Array.isArray(b)) return [...a, ...b];
    if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) return {...a, ...b};
    throw new Error(`Internal error: invalid sequence`);
}


// TODO: doc... helper...
function isInputFullyConsumed(): boolean {
    if (typeof IN === 'string') return IP === IN.length;
    if (Array.isArray(IN)) return IP === IN.length;
    if (typeof IN === 'object' && IN !== null) {
        let keyCount = Object.keys(IN).length;
        assert(keyCount <= 32); // TODO: document this limit, move to constant, consider how to remove it
        if (keyCount === 0) return true;
        // tslint:disable-next-line: no-bitwise
        return IP === -1 >>> (32 - keyCount);
    }
    return IP === 1; // TODO: doc which case(s) this covers. Better to just return false?
}


// TODO: doc... helper...
function isPlainObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;
}





// TODO: temp testing...
class SequenceBuilder {
    result: any = undefined;
    push(value: unknown) {
        // TODO: simplify/optimise these type checks for speed - but perf test first
        if (value === undefined) return;
        let type = typeof value;
        if (type === 'string') {
            this.push = this.pushString;
        }
        else if (type === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype) {
            this.push = this.pushObject;
        }
        else if (Array.isArray(value)) {
            this.push = this.pushArray;
        }
        else {
            this.push = this.pushAtom;
        }
        this.result = value;
    }
    private pushString(value: string) {
        if (value === undefined) return;
        if (typeof value !== 'string') throw new Error('Invalid sequence');
        this.result += value;
    }
    private pushObject(value: string) {
        if (value === undefined) return;
        if (!isPlainObject(value)) throw new Error('Invalid sequence');
        Object.assign(this.result, value);
    }
    private pushArray(value: string) {
        if (value === undefined) return;
        if (!Array.isArray(value)) throw new Error('Invalid sequence');
        for (let i = 0, len = value.length; i < len; ++i) {
            this.result.push(value[i]);
        }
    }
    private pushAtom(value: string) {
        if (value === undefined) return;
        throw new Error('Invalid sequence');
    }
}
