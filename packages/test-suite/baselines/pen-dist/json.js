
"use strict";
function field({ mode, name, value }) {
    if (isParse(mode)) {
        return function FLD() {
            let stateₒ = getState();
            let obj = {};
            if (!name())
                return false;
            assert(typeof OUT === 'string');
            let propName = OUT;
            if (!value())
                return setState(stateₒ), false;
            assert(OUT !== undefined);
            obj[propName] = OUT;
            OUT = obj;
            return true;
        };
    }
    else {
        return function FLD() {
            if (!isPlainObject(IN))
                return false;
            let stateₒ = getState();
            let text;
            let propNames = Object.keys(IN);
            let propCount = propNames.length;
            assert(propCount <= 32);
            const obj = IN;
            let bitmask = IP;
            for (let i = 0; i < propCount; ++i) {
                let propName = propNames[i];
                const propBit = 1 << i;
                if ((bitmask & propBit) !== 0)
                    continue;
                setState({ IN: propName, IP: 0 });
                if (!name())
                    continue;
                if (IP !== propName.length)
                    continue;
                text = concat(text, OUT);
                setState({ IN: obj[propName], IP: 0 });
                if (!value())
                    continue;
                if (!isInputFullyConsumed())
                    continue;
                text = concat(text, OUT);
                bitmask += propBit;
                setState({ IN: obj, IP: bitmask });
                OUT = text;
                return true;
            }
            setState(stateₒ);
            return false;
        };
    }
}
function list({ mode, elements }) {
    const elementsLength = elements.length;
    if (isParse(mode)) {
        return function LST() {
            let stateₒ = getState();
            let arr = [];
            for (let i = 0; i < elementsLength; ++i) {
                if (!elements[i]())
                    return setState(stateₒ), false;
                assert(OUT !== undefined);
                arr.push(OUT);
            }
            OUT = arr;
            return true;
        };
    }
    else {
        return function LST() {
            if (!Array.isArray(IN))
                return false;
            if (IP < 0 || IP + elementsLength > IN.length)
                return false;
            let stateₒ = getState();
            let text;
            const arr = IN;
            const off = IP;
            for (let i = 0; i < elementsLength; ++i) {
                setState({ IN: arr[off + i], IP: 0 });
                if (!elements[i]())
                    return setState(stateₒ), false;
                if (!isInputFullyConsumed())
                    return setState(stateₒ), false;
                text = concat(text, OUT);
            }
            setState({ IN: arr, IP: off + elementsLength });
            OUT = text;
            return true;
        };
    }
}
function record({ mode, fields }) {
    if (isParse(mode)) {
        return function RCD() {
            let stateₒ = getState();
            let obj = {};
            for (let field of fields) {
                let propName = field.name;
                if (!field.value())
                    return setState(stateₒ), false;
                assert(OUT !== undefined);
                obj[propName] = OUT;
            }
            OUT = obj;
            return true;
        };
    }
    else {
        return function RCD() {
            if (!isPlainObject(IN))
                return false;
            let stateₒ = getState();
            let text;
            let propNames = Object.keys(IN);
            let propCount = propNames.length;
            assert(propCount <= 32);
            const obj = IN;
            let bitmask = IP;
            for (let field of fields) {
                let i = propNames.indexOf(field.name);
                if (i < 0)
                    return setState(stateₒ), false;
                let propName = propNames[i];
                const propBit = 1 << i;
                if ((bitmask & propBit) !== 0)
                    return setState(stateₒ), false;
                setState({ IN: obj[propName], IP: 0 });
                if (!field.value())
                    return setState(stateₒ), false;
                if (!isInputFullyConsumed())
                    return setState(stateₒ), false;
                text = concat(text, OUT);
                bitmask += propBit;
            }
            setState({ IN: obj, IP: bitmask });
            OUT = text;
            return true;
        };
    }
}
const PARSE = 6;
const PRINT = 7;
const COVAL = 4;
const COGEN = 5;
const ABGEN = 2;
const ABVAL = 3;
const isParse = (mode) => (mode & 1) === 0;
const isPrint = (mode) => (mode & 1) !== 0;
const hasConcreteForm = (mode) => (mode & 4) !== 0;
const hasAbstractForm = (mode) => (mode & 2) !== 0;
const hasInput = (mode) => isParse(mode) ? hasConcreteForm(mode) : hasAbstractForm(mode);
const hasOutput = (mode) => isParse(mode) ? hasAbstractForm(mode) : hasConcreteForm(mode);
function isRule(_x) {
    return true;
}
function isLambda(_x) {
    return true;
}
function isModule(_x) {
    return true;
}
let IN;
let IP;
let OUT;
function getState() {
    return { IN, IP };
}
function setState(state) {
    IN = state.IN;
    IP = state.IP;
}
function assert(value) {
    if (!value)
        throw new Error(`Assertion failed`);
}
function concat(a, b) {
    if (a === undefined)
        return b;
    if (b === undefined)
        return a;
    if (typeof a === 'string' && typeof b === 'string')
        return a + b;
    if (Array.isArray(a) && Array.isArray(b))
        return [...a, ...b];
    return Object.assign(Object.assign({}, a), b);
}
function isInputFullyConsumed() {
    if (typeof IN === 'string')
        return IP === IN.length;
    if (Array.isArray(IN))
        return IP === IN.length;
    if (typeof IN === 'object' && IN !== null) {
        let keyCount = Object.keys(IN).length;
        assert(keyCount <= 32);
        if (keyCount === 0)
            return true;
        return IP === -1 >>> (32 - keyCount);
    }
    return IP === 1;
}
function isPlainObject(value) {
    return value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;
}
function zeroOrMore({ expression }) {
    return function O_M() {
        let IPₒ = IP;
        let out;
        do {
            if (!expression())
                break;
            if (IP === IPₒ)
                break;
            out = concat(out, OUT);
        } while (true);
        OUT = out;
        return true;
    };
}
function zeroOrOne({ expression }) {
    return function O_1() {
        if (!expression())
            OUT = undefined;
        return true;
    };
}

// -------------------- Extensions --------------------
const createExtension𝕊3 = (() => {
    "use strict";
    /* @pen exports = {
        char,
        f64,
        i32,
        memoise,
    } */
    // TODO: doc... has both 'txt' and 'ast' representation
    // TODO: supports only single UTF-16 code units, ie basic multilingual plane. Extend to full unicode support somehow...
    // TODO: optimise 'any char' case better
    // TODO: optimise all cases better
    function char({ mode }) {
        return function CHA_lambda(expr) {
            var _a, _b, _c, _d, _e, _f;
            assert(isModule(expr));
            let min = (_c = (_b = (_a = expr('min')) === null || _a === void 0 ? void 0 : _a.constant) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : '\u0000';
            let max = (_f = (_e = (_d = expr('max')) === null || _d === void 0 ? void 0 : _d.constant) === null || _e === void 0 ? void 0 : _e.value) !== null && _f !== void 0 ? _f : '\uFFFF';
            assert(typeof min === 'string' && min.length === 1);
            assert(typeof max === 'string' && max.length === 1);
            let checkRange = min !== '\u0000' || max !== '\uFFFF';
            if (!hasInput(mode)) {
                assert(hasOutput(mode));
                return function CHA() { return OUT = min, true; };
            }
            return function CHA() {
                if (isPrint(mode) && typeof IN !== 'string')
                    return false;
                if (IP < 0 || IP >= IN.length)
                    return false;
                let c = IN.charAt(IP);
                if (checkRange && (c < min || c > max))
                    return false;
                IP += 1;
                OUT = hasOutput(mode) ? c : undefined;
                return true;
            };
        };
    }
    // TODO: doc... has both 'txt' and 'ast' representation
    function f64({ mode }) {
        if (!hasInput(mode)) {
            assert(hasOutput(mode));
            const out = isParse(mode) ? 0 : '0';
            return function F64() { return OUT = out, true; };
        }
        if (isParse(mode)) {
            return function F64() {
                if (typeof IN !== 'string')
                    return false;
                let stateₒ = getState();
                const LEN = IN.length;
                const EOS = 0;
                let digitCount = 0;
                // Parse optional '+' or '-' sign
                let c = IN.charCodeAt(IP);
                if (c === PLUS_SIGN || c === MINUS_SIGN) {
                    IP += 1;
                    c = IP < LEN ? IN.charCodeAt(IP) : EOS;
                }
                // Parse 0..M digits
                while (true) {
                    if (c < ZERO_DIGIT || c > NINE_DIGIT)
                        break;
                    digitCount += 1;
                    IP += 1;
                    c = IP < LEN ? IN.charCodeAt(IP) : EOS;
                }
                // Parse optional '.'
                if (c === DECIMAL_POINT) {
                    IP += 1;
                    c = IP < LEN ? IN.charCodeAt(IP) : EOS;
                }
                // Parse 0..M digits
                while (true) {
                    if (c < ZERO_DIGIT || c > NINE_DIGIT)
                        break;
                    digitCount += 1;
                    IP += 1;
                    c = IP < LEN ? IN.charCodeAt(IP) : EOS;
                }
                // Ensure we have parsed at least one significant digit
                if (digitCount === 0)
                    return setState(stateₒ), false;
                // Parse optional exponent
                if (c === UPPERCASE_E || c === LOWERCASE_E) {
                    IP += 1;
                    c = IP < LEN ? IN.charCodeAt(IP) : EOS;
                    // Parse optional '+' or '-' sign
                    if (c === PLUS_SIGN || c === MINUS_SIGN) {
                        IP += 1;
                        c = IP < LEN ? IN.charCodeAt(IP) : EOS;
                    }
                    // Parse 1..M digits
                    digitCount = 0;
                    while (true) {
                        if (c < ZERO_DIGIT || c > NINE_DIGIT)
                            break;
                        digitCount += 1;
                        IP += 1;
                        c = IP < LEN ? IN.charCodeAt(IP) : EOS;
                    }
                    if (digitCount === 0)
                        return setState(stateₒ), false;
                }
                // There is a syntactically valid float. Delegate parsing to the JS runtime.
                // Reject the number if it parses to Infinity or Nan.
                // TODO: the conversion may still be lossy. Provide a non-lossy mode, like `safenum` does?
                let num = Number.parseFloat(IN.slice(stateₒ.IP, IP));
                if (!Number.isFinite(num))
                    return setState(stateₒ), false;
                // Success
                OUT = hasOutput(mode) ? num : undefined;
                return true;
            };
        }
        else /* isPrint */ {
            return function F64() {
                // Ensure N is a number.
                if (typeof IN !== 'number' || IP !== 0)
                    return false;
                // Delegate unparsing to the JS runtime.
                // TODO: the conversion may not exactly match the original string. Add this to the lossiness list.
                OUT = hasOutput(mode) ? String(IN) : undefined;
                IP = 1;
                return true;
            };
        }
    }
    // These constants are used by the f64 rule.
    const PLUS_SIGN = '+'.charCodeAt(0);
    const MINUS_SIGN = '-'.charCodeAt(0);
    const DECIMAL_POINT = '.'.charCodeAt(0);
    const ZERO_DIGIT = '0'.charCodeAt(0);
    const NINE_DIGIT = '9'.charCodeAt(0);
    const LOWERCASE_E = 'e'.charCodeAt(0);
    const UPPERCASE_E = 'E'.charCodeAt(0);
    // TODO: doc... has both 'txt' and 'ast' representation
    function i32({ mode }) {
        return function I32_lambda(expr) {
            var _a, _b, _c, _d, _e, _f;
            assert(isModule(expr));
            let base = (_c = (_b = (_a = expr('base')) === null || _a === void 0 ? void 0 : _a.constant) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : 10;
            let signed = (_f = (_e = (_d = expr('signed')) === null || _d === void 0 ? void 0 : _d.constant) === null || _e === void 0 ? void 0 : _e.value) !== null && _f !== void 0 ? _f : true;
            assert(typeof base === 'number' && base >= 2 && base <= 36);
            assert(typeof signed === 'boolean');
            if (!hasInput(mode)) {
                assert(hasOutput(mode));
                const out = isParse(mode) ? 0 : '0';
                return function I32() { return OUT = out, true; };
            }
            if (isParse(mode)) {
                return function I32() {
                    if (typeof IN !== 'string')
                        return false;
                    let stateₒ = getState();
                    // Parse optional leading '-' sign (if signed)...
                    let MAX_NUM = signed ? 0x7FFFFFFF : 0xFFFFFFFF;
                    let isNegative = false;
                    if (signed && IP < IN.length && IN.charAt(IP) === '-') {
                        isNegative = true;
                        MAX_NUM = 0x80000000;
                        IP += 1;
                    }
                    // ...followed by one or more decimal digits. (NB: no exponents).
                    let num = 0;
                    let digits = 0;
                    while (IP < IN.length) {
                        // Read a digit.
                        let c = IN.charCodeAt(IP);
                        if (c >= 256)
                            break;
                        let digitValue = DIGIT_VALUES[c];
                        if (digitValue >= base)
                            break;
                        // Update parsed number.
                        num *= base;
                        num += digitValue;
                        // Check for overflow.
                        if (num > MAX_NUM)
                            return setState(stateₒ), false;
                        // Loop again.
                        IP += 1;
                        digits += 1;
                    }
                    // Check that we parsed at least one digit.
                    if (digits === 0)
                        return setState(stateₒ), false;
                    // Apply the sign.
                    if (isNegative)
                        num = -num;
                    // Success
                    OUT = hasOutput(mode) ? num : undefined;
                    return true;
                };
            }
            else /* isPrint */ {
                return function I32() {
                    if (typeof IN !== 'number' || IP !== 0)
                        return false;
                    let num = IN;
                    // Determine the number's sign and ensure it is in range.
                    let isNegative = false;
                    let MAX_NUM = 0x7FFFFFFF;
                    if (num < 0) {
                        if (!signed)
                            return false;
                        isNegative = true;
                        num = -num;
                        MAX_NUM = 0x80000000;
                    }
                    if (num > MAX_NUM)
                        return false;
                    // Extract the digits.
                    let digits = [];
                    while (true) {
                        let d = num % base;
                        num = (num / base) | 0;
                        digits.push(CHAR_CODES[d]);
                        if (num === 0)
                            break;
                    }
                    // Compute the final string.
                    if (isNegative)
                        digits.push(0x2d); // char code for '-'
                    // TODO: is String.fromCharCode(...) performant?
                    OUT = hasOutput(mode) ? String.fromCharCode(...digits.reverse()) : undefined;
                    IP = 1;
                    return true;
                };
            }
        };
    }
    // TODO: doc...
    // use this for bases between 2-36. Get the charCode, ensure < 256, look up DIGIT_VALUES[code], ensure < BASE
    // NB: the number 80 is not special, it's just greater than 36 which makes it a sentinel for 'not a digit'.
    const DIGIT_VALUES = [
        80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80,
        80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80,
        80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80,
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 80, 80, 80, 80, 80, 80,
        80, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
        25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 80, 80, 80, 80, 80,
        80, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
        25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 80, 80, 80, 80, 80,
        80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80,
        80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80,
        80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80,
        80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80,
        80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80,
        80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80,
        80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80,
        80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80,
    ];
    // TODO: doc...
    const CHAR_CODES = [
        0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37,
        0x38, 0x39, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46,
        0x47, 0x48, 0x49, 0x4a, 0x4b, 0x4c, 0x4d, 0x4e,
        0x4f, 0x50, 0x51, 0x52, 0x53, 0x54, 0x55, 0x56,
        0x57, 0x58, 0x59, 0x5a,
    ];
    function memoise({}) {
        return function MEM_lambda(expr) {
            // TODO: investigate... need to use `text` as part of memo key? Study lifecycle/extent of each `memos` instance.
            const memos = new Map();
            return function MEM() {
                // Check whether the memo table already has an entry for the given initial state.
                let stateₒ = getState();
                let memos2 = memos.get(IN);
                if (memos2 === undefined) {
                    memos2 = new Map();
                    memos.set(IN, memos2);
                }
                let memo = memos2.get(IP);
                if (!memo) {
                    // The memo table does *not* have an entry, so this is the first attempt to apply this rule with
                    // this initial state. The first thing we do is create a memo table entry, which is marked as
                    // *unresolved*. All future applications of this rule with the same initial state will find this
                    // memo. If a future application finds the memo still unresolved, then we know we have encountered
                    // left-recursion.
                    memo = { resolved: false, isLeftRecursive: false, result: false, stateᐟ: stateₒ, OUT: undefined };
                    memos2.set(IP, memo);
                    // Now that the unresolved memo is in place, apply the rule, and resolve the memo with the result.
                    // At this point, any left-recursive paths encountered during application are guaranteed to have
                    // been noted and aborted (see below).
                    if (expr()) { // TODO: fix cast
                        memo.result = true;
                        memo.stateᐟ = getState();
                        memo.OUT = OUT;
                    }
                    memo.resolved = true;
                    // If we did *not* encounter left-recursion, then we have simple memoisation, and the result is
                    // final.
                    if (!memo.isLeftRecursive) {
                        setState(memo.stateᐟ);
                        OUT = memo.OUT;
                        return memo.result;
                    }
                    // If we get here, then the above application of the rule invoked itself left-recursively, but we
                    // aborted the left-recursive paths (see below). That means that the result is either failure, or
                    // success via a non-left-recursive path through the rule. We now iterate, repeatedly re-applying
                    // the same rule with the same initial state. We continue to iterate as long as the application
                    // succeeds and consumes more input than the previous iteration did, in which case we update the
                    // memo with the new result. We thus 'grow' the result, stopping when application either fails or
                    // does not consume more input, at which point we take the result of the previous iteration as
                    // final.
                    while (memo.result === true) {
                        setState(stateₒ);
                        // TODO: break cases for UNPARSING:
                        // anything --> same thing (covers all string cases, since they can only be same or shorter)
                        // some node --> some different non-empty node (assert: should never happen!)
                        if (!expr())
                            break; // TODO: fix cast
                        let state = getState();
                        if (state.IP <= memo.stateᐟ.IP)
                            break;
                        // TODO: was for unparse... comment above says should never happen...
                        // if (!isInputFullyConsumed()) break;
                        memo.stateᐟ = state;
                        memo.OUT = OUT;
                    }
                }
                else if (!memo.resolved) {
                    // If we get here, then we have already applied the rule with this initial state, but not yet
                    // resolved it. That means we must have entered a left-recursive path of the rule. All we do here is
                    // note that the rule application encountered left-recursion, and return with failure. This means
                    // that the initial application of the rule for this initial state can only possibly succeed along a
                    // non-left-recursive path. More importantly, it means the parser will never loop endlessly on
                    // left-recursive rules.
                    memo.isLeftRecursive = true;
                    return false;
                }
                // We have a resolved memo, so the result of the rule application for the given initial state has
                // already been computed. Return it from the memo.
                setState(memo.stateᐟ);
                OUT = memo.OUT;
                return memo.result;
            };
        };
    }

    return ({mode}) => {
        let _char = char({mode});
        let _f64 = f64({mode});
        let _i32 = i32({mode});
        let _memoise = memoise({mode});
        return (name) => {
            switch(name) {
                case 'char': return _char;
                case 'f64': return _f64;
                case 'i32': return _i32;
                case 'memoise': return _memoise;
                default: return undefined;
            }
        };
    };
})();
const createExtension𝕊4 = (() => {
    "use strict";
    /* @pen exports = {
        unicode
    } */
    function unicode({ mode }) {
        return function UNI_lambda(expr) {
            var _a, _b, _c, _d, _e, _f;
            assert(isModule(expr));
            let base = (_b = (_a = expr('base')) === null || _a === void 0 ? void 0 : _a.constant) === null || _b === void 0 ? void 0 : _b.value;
            let minDigits = (_d = (_c = expr('minDigits')) === null || _c === void 0 ? void 0 : _c.constant) === null || _d === void 0 ? void 0 : _d.value;
            let maxDigits = (_f = (_e = expr('maxDigits')) === null || _e === void 0 ? void 0 : _e.constant) === null || _f === void 0 ? void 0 : _f.value;
            assert(typeof base === 'number' && base >= 2 && base <= 36);
            assert(typeof minDigits === 'number' && minDigits >= 1 && minDigits <= 8);
            assert(typeof maxDigits === 'number' && maxDigits >= minDigits && maxDigits <= 8);
            // Construct a regex to match the digits
            let pattern = `[0-${base < 10 ? base - 1 : 9}${base > 10 ? `a-${String.fromCharCode('a'.charCodeAt(0) + base - 11)}` : ''}]`;
            let regex = RegExp(pattern, 'i');
            if (isParse(mode)) {
                return function UNI() {
                    if (typeof IN !== 'string')
                        return false;
                    let stateₒ = getState();
                    const LEN = IN.length;
                    const EOS = '';
                    let len = 0;
                    let num = ''; // TODO: fix this - should actually keep count
                    let c = IP < LEN ? IN.charAt(IP) : EOS;
                    while (true) {
                        if (!regex.test(c))
                            break;
                        num += c;
                        IP += 1;
                        len += 1;
                        if (len === maxDigits)
                            break;
                        c = IP < LEN ? IN.charAt(IP) : EOS;
                    }
                    if (len < minDigits)
                        return setState(stateₒ), false;
                    // tslint:disable-next-line: no-eval
                    OUT = eval(`"\\u{${num}}"`); // TODO: hacky... fix when we have a charCode
                    return true;
                };
            }
            else /* isPrint */ {
                return function UNI() {
                    // TODO: implement
                    return false;
                };
            }
        };
    }

    return ({mode}) => {
        let _unicode = unicode({mode});
        return (name) => {
            switch(name) {
                case 'unicode': return _unicode;
                default: return undefined;
            }
        };
    };
})();




// --------------------------------------------------------------------------------
const parse = (() => {

    // -------------------- json.pen --------------------

    const 𝕊0 = (name) => {
        switch (name) {
            case 'char': return 𝕊0_char;
            case 'f64': return 𝕊0_f64;
            case 'unicode': return 𝕊0_unicode;
            case 'start': return 𝕊0_start;
            case 'Value': return 𝕊0_Value;
            case 'False': return 𝕊0_False;
            case 'Null': return 𝕊0_Null;
            case 'True': return 𝕊0_True;
            case 'Object': return 𝕊0_Object;
            case 'Property': return 𝕊0_Property;
            case 'Array': return 𝕊0_Array;
            case 'Element': return 𝕊0_Element;
            case 'Number': return 𝕊0_Number;
            case 'String': return 𝕊0_String;
            case 'CHAR': return 𝕊0_CHAR;
            case 'LBRACE': return 𝕊0_LBRACE;
            case 'RBRACE': return 𝕊0_RBRACE;
            case 'LBRACKET': return 𝕊0_LBRACKET;
            case 'RBRACKET': return 𝕊0_RBRACKET;
            case 'COLON': return 𝕊0_COLON;
            case 'COMMA': return 𝕊0_COMMA;
            case 'DOUBLE_QUOTE': return 𝕊0_DOUBLE_QUOTE;
            case 'WS': return 𝕊0_WS;
            default: return undefined;
        }
    };

    const 𝕊0_char = (arg) => 𝕊3('char')(arg);

    const 𝕊0_f64 = (arg) => 𝕊3('f64')(arg);

    const 𝕊0_unicode = (arg) => 𝕊4('unicode')(arg);

    const 𝕊0_start = (arg) => {
        if (!𝕊0_start_memo) 𝕊0_start_memo = (() => {
            const t212 = 𝕊0('WS');
            const t213 = 𝕊0('Value');
            const t214 = 𝕊0('WS');
            return function SEQ() {
                let stateₒ = getState();
                let out;
                if (t212()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t213()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t214()) out = concat(out, OUT); else return setState(stateₒ), false;
                OUT = out;
                return true;
            };
        })();
        return 𝕊0_start_memo(arg);
    };
    let 𝕊0_start_memo;

    const 𝕊0_Value = (arg) => {
        if (!𝕊0_Value_memo) 𝕊0_Value_memo = (() => {
            const t215 = 𝕊0('False');
            const t216 = 𝕊0('Null');
            const t217 = 𝕊0('True');
            const t218 = 𝕊0('Object');
            const t219 = 𝕊0('Array');
            const t220 = 𝕊0('Number');
            const t221 = 𝕊0('String');
            return function SEL() {
                if (t215()) return true;
                if (t216()) return true;
                if (t217()) return true;
                if (t218()) return true;
                if (t219()) return true;
                if (t220()) return true;
                if (t221()) return true;
                return false;
            };
        })();
        return 𝕊0_Value_memo(arg);
    };
    let 𝕊0_Value_memo;

    const 𝕊0_False = (arg) => {
        if (!𝕊0_False_memo) 𝕊0_False_memo = (() => {
            const t222 = function STR() {
                if (IP + 5 > IN.length) return false;
                if (IN.charCodeAt(IP + 0) !== 102) return false;
                if (IN.charCodeAt(IP + 1) !== 97) return false;
                if (IN.charCodeAt(IP + 2) !== 108) return false;
                if (IN.charCodeAt(IP + 3) !== 115) return false;
                if (IN.charCodeAt(IP + 4) !== 101) return false;
                IP += 5;
                OUT = undefined;
                return true;
            };
            const t223 = function BOO() {
                OUT = false;
                return true;
            };
            return function SEQ() {
                let stateₒ = getState();
                let out;
                if (t222()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t223()) out = concat(out, OUT); else return setState(stateₒ), false;
                OUT = out;
                return true;
            };
        })();
        return 𝕊0_False_memo(arg);
    };
    let 𝕊0_False_memo;

    const 𝕊0_Null = (arg) => {
        if (!𝕊0_Null_memo) 𝕊0_Null_memo = (() => {
            const t224 = function STR() {
                if (IP + 4 > IN.length) return false;
                if (IN.charCodeAt(IP + 0) !== 110) return false;
                if (IN.charCodeAt(IP + 1) !== 117) return false;
                if (IN.charCodeAt(IP + 2) !== 108) return false;
                if (IN.charCodeAt(IP + 3) !== 108) return false;
                IP += 4;
                OUT = undefined;
                return true;
            };
            const t225 = function NUL() {
                OUT = null;
                return true;
            };
            return function SEQ() {
                let stateₒ = getState();
                let out;
                if (t224()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t225()) out = concat(out, OUT); else return setState(stateₒ), false;
                OUT = out;
                return true;
            };
        })();
        return 𝕊0_Null_memo(arg);
    };
    let 𝕊0_Null_memo;

    const 𝕊0_True = (arg) => {
        if (!𝕊0_True_memo) 𝕊0_True_memo = (() => {
            const t226 = function STR() {
                if (IP + 4 > IN.length) return false;
                if (IN.charCodeAt(IP + 0) !== 116) return false;
                if (IN.charCodeAt(IP + 1) !== 114) return false;
                if (IN.charCodeAt(IP + 2) !== 117) return false;
                if (IN.charCodeAt(IP + 3) !== 101) return false;
                IP += 4;
                OUT = undefined;
                return true;
            };
            const t227 = function BOO() {
                OUT = true;
                return true;
            };
            return function SEQ() {
                let stateₒ = getState();
                let out;
                if (t226()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t227()) out = concat(out, OUT); else return setState(stateₒ), false;
                OUT = out;
                return true;
            };
        })();
        return 𝕊0_True_memo(arg);
    };
    let 𝕊0_True_memo;

    const 𝕊0_Object = (arg) => {
        if (!𝕊0_Object_memo) 𝕊0_Object_memo = (() => {
            const t228 = 𝕊0('LBRACE');
            const t229 = (() => {
                const t231 = (() => {
                    const t233 = 𝕊0('Property');
                    const t234 = zeroOrMore({
                        mode: 6,
                        expression: (() => {
                            const t235 = 𝕊0('COMMA');
                            const t236 = 𝕊0('Property');
                            return function SEQ() {
                                let stateₒ = getState();
                                let out;
                                if (t235()) out = concat(out, OUT); else return setState(stateₒ), false;
                                if (t236()) out = concat(out, OUT); else return setState(stateₒ), false;
                                OUT = out;
                                return true;
                            };
                        })(),
                    });
                    return function SEQ() {
                        let stateₒ = getState();
                        let out;
                        if (t233()) out = concat(out, OUT); else return setState(stateₒ), false;
                        if (t234()) out = concat(out, OUT); else return setState(stateₒ), false;
                        OUT = out;
                        return true;
                    };
                })();
                const t232 = record({
                    mode: 6,
                    fields: [],
                });
                return function SEL() {
                    if (t231()) return true;
                    if (t232()) return true;
                    return false;
                };
            })();
            const t230 = 𝕊0('RBRACE');
            return function SEQ() {
                let stateₒ = getState();
                let out;
                if (t228()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t229()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t230()) out = concat(out, OUT); else return setState(stateₒ), false;
                OUT = out;
                return true;
            };
        })();
        return 𝕊0_Object_memo(arg);
    };
    let 𝕊0_Object_memo;

    const 𝕊0_Property = (arg) => {
        if (!𝕊0_Property_memo) 𝕊0_Property_memo = field({
            mode: 6,
            name: 𝕊0('String'),
            value: (() => {
                const t237 = 𝕊0('COLON');
                const t238 = 𝕊0('Value');
                return function SEQ() {
                    let stateₒ = getState();
                    let out;
                    if (t237()) out = concat(out, OUT); else return setState(stateₒ), false;
                    if (t238()) out = concat(out, OUT); else return setState(stateₒ), false;
                    OUT = out;
                    return true;
                };
            })(),
        });
        return 𝕊0_Property_memo(arg);
    };
    let 𝕊0_Property_memo;

    const 𝕊0_Array = (arg) => {
        if (!𝕊0_Array_memo) 𝕊0_Array_memo = (() => {
            const t239 = 𝕊0('LBRACKET');
            const t240 = (() => {
                const t242 = (() => {
                    const t244 = 𝕊0('Element');
                    const t245 = zeroOrMore({
                        mode: 6,
                        expression: (() => {
                            const t246 = 𝕊0('COMMA');
                            const t247 = 𝕊0('Element');
                            return function SEQ() {
                                let stateₒ = getState();
                                let out;
                                if (t246()) out = concat(out, OUT); else return setState(stateₒ), false;
                                if (t247()) out = concat(out, OUT); else return setState(stateₒ), false;
                                OUT = out;
                                return true;
                            };
                        })(),
                    });
                    return function SEQ() {
                        let stateₒ = getState();
                        let out;
                        if (t244()) out = concat(out, OUT); else return setState(stateₒ), false;
                        if (t245()) out = concat(out, OUT); else return setState(stateₒ), false;
                        OUT = out;
                        return true;
                    };
                })();
                const t243 = list({
                    mode: 6,
                    elements: [],
                });
                return function SEL() {
                    if (t242()) return true;
                    if (t243()) return true;
                    return false;
                };
            })();
            const t241 = 𝕊0('RBRACKET');
            return function SEQ() {
                let stateₒ = getState();
                let out;
                if (t239()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t240()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t241()) out = concat(out, OUT); else return setState(stateₒ), false;
                OUT = out;
                return true;
            };
        })();
        return 𝕊0_Array_memo(arg);
    };
    let 𝕊0_Array_memo;

    const 𝕊0_Element = (arg) => {
        if (!𝕊0_Element_memo) 𝕊0_Element_memo = list({
            mode: 6,
            elements: [
                𝕊0('Value'),
            ],
        });
        return 𝕊0_Element_memo(arg);
    };
    let 𝕊0_Element_memo;

    const 𝕊0_Number = (arg) => {
        if (!𝕊0_Number_memo) 𝕊0_Number_memo = 𝕊0('f64');
        return 𝕊0_Number_memo(arg);
    };
    let 𝕊0_Number_memo;

    const 𝕊0_String = (arg) => {
        if (!𝕊0_String_memo) 𝕊0_String_memo = (() => {
            const t248 = 𝕊0('DOUBLE_QUOTE');
            const t249 = zeroOrMore({
                mode: 6,
                expression: 𝕊0('CHAR'),
            });
            const t250 = 𝕊0('DOUBLE_QUOTE');
            return function SEQ() {
                let stateₒ = getState();
                let out;
                if (t248()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t249()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t250()) out = concat(out, OUT); else return setState(stateₒ), false;
                OUT = out;
                return true;
            };
        })();
        return 𝕊0_String_memo(arg);
    };
    let 𝕊0_String_memo;

    const 𝕊0_CHAR = (arg) => {
        if (!𝕊0_CHAR_memo) 𝕊0_CHAR_memo = (() => {
            const t251 = (() => {
                const t261 = (() => {
                    const t264 = function STR() {
                        if (IP + 1 > IN.length) return false;
                        if (IN.charCodeAt(IP + 0) !== 92) return false;
                        IP += 1;
                        OUT = "\\";
                        return true;
                    };
                    return function NOT() {
                        let stateₒ = getState();
                        let result = !t264();
                        setState(stateₒ);
                        OUT = undefined;
                        return result;
                    };
                })();
                const t262 = (() => {
                    const t265 = function STR() {
                        if (IP + 1 > IN.length) return false;
                        if (IN.charCodeAt(IP + 0) !== 34) return false;
                        IP += 1;
                        OUT = "\"";
                        return true;
                    };
                    return function NOT() {
                        let stateₒ = getState();
                        let result = !t265();
                        setState(stateₒ);
                        OUT = undefined;
                        return result;
                    };
                })();
                const t263 = (𝕊0('char'))(𝕊1);
                return function SEQ() {
                    let stateₒ = getState();
                    let out;
                    if (t261()) out = concat(out, OUT); else return setState(stateₒ), false;
                    if (t262()) out = concat(out, OUT); else return setState(stateₒ), false;
                    if (t263()) out = concat(out, OUT); else return setState(stateₒ), false;
                    OUT = out;
                    return true;
                };
            })();
            const t252 = (() => {
                const t266 = function STR() {
                    if (IP + 2 > IN.length) return false;
                    if (IN.charCodeAt(IP + 0) !== 92) return false;
                    if (IN.charCodeAt(IP + 1) !== 34) return false;
                    IP += 2;
                    OUT = undefined;
                    return true;
                };
                const t267 = function STR() {
                    OUT = "\"";
                    return true;
                };
                return function SEQ() {
                    let stateₒ = getState();
                    let out;
                    if (t266()) out = concat(out, OUT); else return setState(stateₒ), false;
                    if (t267()) out = concat(out, OUT); else return setState(stateₒ), false;
                    OUT = out;
                    return true;
                };
            })();
            const t253 = (() => {
                const t268 = function STR() {
                    if (IP + 2 > IN.length) return false;
                    if (IN.charCodeAt(IP + 0) !== 92) return false;
                    if (IN.charCodeAt(IP + 1) !== 92) return false;
                    IP += 2;
                    OUT = undefined;
                    return true;
                };
                const t269 = function STR() {
                    OUT = "\\";
                    return true;
                };
                return function SEQ() {
                    let stateₒ = getState();
                    let out;
                    if (t268()) out = concat(out, OUT); else return setState(stateₒ), false;
                    if (t269()) out = concat(out, OUT); else return setState(stateₒ), false;
                    OUT = out;
                    return true;
                };
            })();
            const t254 = (() => {
                const t270 = function STR() {
                    if (IP + 2 > IN.length) return false;
                    if (IN.charCodeAt(IP + 0) !== 92) return false;
                    if (IN.charCodeAt(IP + 1) !== 47) return false;
                    IP += 2;
                    OUT = undefined;
                    return true;
                };
                const t271 = function STR() {
                    OUT = "/";
                    return true;
                };
                return function SEQ() {
                    let stateₒ = getState();
                    let out;
                    if (t270()) out = concat(out, OUT); else return setState(stateₒ), false;
                    if (t271()) out = concat(out, OUT); else return setState(stateₒ), false;
                    OUT = out;
                    return true;
                };
            })();
            const t255 = (() => {
                const t272 = function STR() {
                    if (IP + 2 > IN.length) return false;
                    if (IN.charCodeAt(IP + 0) !== 92) return false;
                    if (IN.charCodeAt(IP + 1) !== 98) return false;
                    IP += 2;
                    OUT = undefined;
                    return true;
                };
                const t273 = function STR() {
                    OUT = "\b";
                    return true;
                };
                return function SEQ() {
                    let stateₒ = getState();
                    let out;
                    if (t272()) out = concat(out, OUT); else return setState(stateₒ), false;
                    if (t273()) out = concat(out, OUT); else return setState(stateₒ), false;
                    OUT = out;
                    return true;
                };
            })();
            const t256 = (() => {
                const t274 = function STR() {
                    if (IP + 2 > IN.length) return false;
                    if (IN.charCodeAt(IP + 0) !== 92) return false;
                    if (IN.charCodeAt(IP + 1) !== 102) return false;
                    IP += 2;
                    OUT = undefined;
                    return true;
                };
                const t275 = function STR() {
                    OUT = "\f";
                    return true;
                };
                return function SEQ() {
                    let stateₒ = getState();
                    let out;
                    if (t274()) out = concat(out, OUT); else return setState(stateₒ), false;
                    if (t275()) out = concat(out, OUT); else return setState(stateₒ), false;
                    OUT = out;
                    return true;
                };
            })();
            const t257 = (() => {
                const t276 = function STR() {
                    if (IP + 2 > IN.length) return false;
                    if (IN.charCodeAt(IP + 0) !== 92) return false;
                    if (IN.charCodeAt(IP + 1) !== 110) return false;
                    IP += 2;
                    OUT = undefined;
                    return true;
                };
                const t277 = function STR() {
                    OUT = "\n";
                    return true;
                };
                return function SEQ() {
                    let stateₒ = getState();
                    let out;
                    if (t276()) out = concat(out, OUT); else return setState(stateₒ), false;
                    if (t277()) out = concat(out, OUT); else return setState(stateₒ), false;
                    OUT = out;
                    return true;
                };
            })();
            const t258 = (() => {
                const t278 = function STR() {
                    if (IP + 2 > IN.length) return false;
                    if (IN.charCodeAt(IP + 0) !== 92) return false;
                    if (IN.charCodeAt(IP + 1) !== 114) return false;
                    IP += 2;
                    OUT = undefined;
                    return true;
                };
                const t279 = function STR() {
                    OUT = "\r";
                    return true;
                };
                return function SEQ() {
                    let stateₒ = getState();
                    let out;
                    if (t278()) out = concat(out, OUT); else return setState(stateₒ), false;
                    if (t279()) out = concat(out, OUT); else return setState(stateₒ), false;
                    OUT = out;
                    return true;
                };
            })();
            const t259 = (() => {
                const t280 = function STR() {
                    if (IP + 2 > IN.length) return false;
                    if (IN.charCodeAt(IP + 0) !== 92) return false;
                    if (IN.charCodeAt(IP + 1) !== 116) return false;
                    IP += 2;
                    OUT = undefined;
                    return true;
                };
                const t281 = function STR() {
                    OUT = "\t";
                    return true;
                };
                return function SEQ() {
                    let stateₒ = getState();
                    let out;
                    if (t280()) out = concat(out, OUT); else return setState(stateₒ), false;
                    if (t281()) out = concat(out, OUT); else return setState(stateₒ), false;
                    OUT = out;
                    return true;
                };
            })();
            const t260 = (() => {
                const t282 = function STR() {
                    if (IP + 2 > IN.length) return false;
                    if (IN.charCodeAt(IP + 0) !== 92) return false;
                    if (IN.charCodeAt(IP + 1) !== 117) return false;
                    IP += 2;
                    OUT = undefined;
                    return true;
                };
                const t283 = (𝕊0('unicode'))(𝕊2);
                return function SEQ() {
                    let stateₒ = getState();
                    let out;
                    if (t282()) out = concat(out, OUT); else return setState(stateₒ), false;
                    if (t283()) out = concat(out, OUT); else return setState(stateₒ), false;
                    OUT = out;
                    return true;
                };
            })();
            return function SEL() {
                if (t251()) return true;
                if (t252()) return true;
                if (t253()) return true;
                if (t254()) return true;
                if (t255()) return true;
                if (t256()) return true;
                if (t257()) return true;
                if (t258()) return true;
                if (t259()) return true;
                if (t260()) return true;
                return false;
            };
        })();
        return 𝕊0_CHAR_memo(arg);
    };
    let 𝕊0_CHAR_memo;

    const 𝕊0_LBRACE = (arg) => {
        if (!𝕊0_LBRACE_memo) 𝕊0_LBRACE_memo = (() => {
            const t284 = 𝕊0('WS');
            const t285 = function STR() {
                if (IP + 1 > IN.length) return false;
                if (IN.charCodeAt(IP + 0) !== 123) return false;
                IP += 1;
                OUT = undefined;
                return true;
            };
            const t286 = 𝕊0('WS');
            return function SEQ() {
                let stateₒ = getState();
                let out;
                if (t284()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t285()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t286()) out = concat(out, OUT); else return setState(stateₒ), false;
                OUT = out;
                return true;
            };
        })();
        return 𝕊0_LBRACE_memo(arg);
    };
    let 𝕊0_LBRACE_memo;

    const 𝕊0_RBRACE = (arg) => {
        if (!𝕊0_RBRACE_memo) 𝕊0_RBRACE_memo = (() => {
            const t287 = 𝕊0('WS');
            const t288 = function STR() {
                if (IP + 1 > IN.length) return false;
                if (IN.charCodeAt(IP + 0) !== 125) return false;
                IP += 1;
                OUT = undefined;
                return true;
            };
            const t289 = 𝕊0('WS');
            return function SEQ() {
                let stateₒ = getState();
                let out;
                if (t287()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t288()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t289()) out = concat(out, OUT); else return setState(stateₒ), false;
                OUT = out;
                return true;
            };
        })();
        return 𝕊0_RBRACE_memo(arg);
    };
    let 𝕊0_RBRACE_memo;

    const 𝕊0_LBRACKET = (arg) => {
        if (!𝕊0_LBRACKET_memo) 𝕊0_LBRACKET_memo = (() => {
            const t290 = 𝕊0('WS');
            const t291 = function STR() {
                if (IP + 1 > IN.length) return false;
                if (IN.charCodeAt(IP + 0) !== 91) return false;
                IP += 1;
                OUT = undefined;
                return true;
            };
            const t292 = 𝕊0('WS');
            return function SEQ() {
                let stateₒ = getState();
                let out;
                if (t290()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t291()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t292()) out = concat(out, OUT); else return setState(stateₒ), false;
                OUT = out;
                return true;
            };
        })();
        return 𝕊0_LBRACKET_memo(arg);
    };
    let 𝕊0_LBRACKET_memo;

    const 𝕊0_RBRACKET = (arg) => {
        if (!𝕊0_RBRACKET_memo) 𝕊0_RBRACKET_memo = (() => {
            const t293 = 𝕊0('WS');
            const t294 = function STR() {
                if (IP + 1 > IN.length) return false;
                if (IN.charCodeAt(IP + 0) !== 93) return false;
                IP += 1;
                OUT = undefined;
                return true;
            };
            const t295 = 𝕊0('WS');
            return function SEQ() {
                let stateₒ = getState();
                let out;
                if (t293()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t294()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t295()) out = concat(out, OUT); else return setState(stateₒ), false;
                OUT = out;
                return true;
            };
        })();
        return 𝕊0_RBRACKET_memo(arg);
    };
    let 𝕊0_RBRACKET_memo;

    const 𝕊0_COLON = (arg) => {
        if (!𝕊0_COLON_memo) 𝕊0_COLON_memo = (() => {
            const t296 = 𝕊0('WS');
            const t297 = function STR() {
                if (IP + 1 > IN.length) return false;
                if (IN.charCodeAt(IP + 0) !== 58) return false;
                IP += 1;
                OUT = undefined;
                return true;
            };
            const t298 = 𝕊0('WS');
            return function SEQ() {
                let stateₒ = getState();
                let out;
                if (t296()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t297()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t298()) out = concat(out, OUT); else return setState(stateₒ), false;
                OUT = out;
                return true;
            };
        })();
        return 𝕊0_COLON_memo(arg);
    };
    let 𝕊0_COLON_memo;

    const 𝕊0_COMMA = (arg) => {
        if (!𝕊0_COMMA_memo) 𝕊0_COMMA_memo = (() => {
            const t299 = 𝕊0('WS');
            const t300 = function STR() {
                if (IP + 1 > IN.length) return false;
                if (IN.charCodeAt(IP + 0) !== 44) return false;
                IP += 1;
                OUT = undefined;
                return true;
            };
            const t301 = 𝕊0('WS');
            return function SEQ() {
                let stateₒ = getState();
                let out;
                if (t299()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t300()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t301()) out = concat(out, OUT); else return setState(stateₒ), false;
                OUT = out;
                return true;
            };
        })();
        return 𝕊0_COMMA_memo(arg);
    };
    let 𝕊0_COMMA_memo;

    const 𝕊0_DOUBLE_QUOTE = (arg) => {
        if (!𝕊0_DOUBLE_QUOTE_memo) 𝕊0_DOUBLE_QUOTE_memo = function STR() {
            if (IP + 1 > IN.length) return false;
            if (IN.charCodeAt(IP + 0) !== 34) return false;
            IP += 1;
            OUT = undefined;
            return true;
        };
        return 𝕊0_DOUBLE_QUOTE_memo(arg);
    };
    let 𝕊0_DOUBLE_QUOTE_memo;

    const 𝕊0_WS = (arg) => {
        if (!𝕊0_WS_memo) 𝕊0_WS_memo = zeroOrMore({
            mode: 6,
            expression: (() => {
                const t302 = function STR() {
                    if (IP + 1 > IN.length) return false;
                    if (IN.charCodeAt(IP + 0) !== 32) return false;
                    IP += 1;
                    OUT = undefined;
                    return true;
                };
                const t303 = function STR() {
                    if (IP + 1 > IN.length) return false;
                    if (IN.charCodeAt(IP + 0) !== 9) return false;
                    IP += 1;
                    OUT = undefined;
                    return true;
                };
                const t304 = function STR() {
                    if (IP + 1 > IN.length) return false;
                    if (IN.charCodeAt(IP + 0) !== 10) return false;
                    IP += 1;
                    OUT = undefined;
                    return true;
                };
                const t305 = function STR() {
                    if (IP + 1 > IN.length) return false;
                    if (IN.charCodeAt(IP + 0) !== 13) return false;
                    IP += 1;
                    OUT = undefined;
                    return true;
                };
                return function SEL() {
                    if (t302()) return true;
                    if (t303()) return true;
                    if (t304()) return true;
                    if (t305()) return true;
                    return false;
                };
            })(),
        });
        return 𝕊0_WS_memo(arg);
    };
    let 𝕊0_WS_memo;

    const 𝕊1 = (name) => {
        switch (name) {
            case 'min': return 𝕊1_min;
            case 'max': return 𝕊1_max;
            default: return undefined;
        }
    };

    const 𝕊1_min = (arg) => {
        if (!𝕊1_min_memo) 𝕊1_min_memo = function STR() {
            if (IP + 1 > IN.length) return false;
            if (IN.charCodeAt(IP + 0) !== 32) return false;
            IP += 1;
            OUT = " ";
            return true;
        };
        return 𝕊1_min_memo(arg);
    };
    let 𝕊1_min_memo;

    const 𝕊1_max = (arg) => {
        if (!𝕊1_max_memo) 𝕊1_max_memo = function STR() {
            if (IP + 1 > IN.length) return false;
            if (IN.charCodeAt(IP + 0) !== 65535) return false;
            IP += 1;
            OUT = "￿";
            return true;
        };
        return 𝕊1_max_memo(arg);
    };
    let 𝕊1_max_memo;

    const 𝕊2 = (name) => {
        switch (name) {
            case 'base': return 𝕊2_base;
            case 'minDigits': return 𝕊2_minDigits;
            case 'maxDigits': return 𝕊2_maxDigits;
            default: return undefined;
        }
    };

    const 𝕊2_base = (arg) => {
        if (!𝕊2_base_memo) 𝕊2_base_memo = function NUM() {
            OUT = 16;
            return true;
        };
        return 𝕊2_base_memo(arg);
    };
    let 𝕊2_base_memo;

    const 𝕊2_minDigits = (arg) => {
        if (!𝕊2_minDigits_memo) 𝕊2_minDigits_memo = function NUM() {
            OUT = 4;
            return true;
        };
        return 𝕊2_minDigits_memo(arg);
    };
    let 𝕊2_minDigits_memo;

    const 𝕊2_maxDigits = (arg) => {
        if (!𝕊2_maxDigits_memo) 𝕊2_maxDigits_memo = function NUM() {
            OUT = 4;
            return true;
        };
        return 𝕊2_maxDigits_memo(arg);
    };
    let 𝕊2_maxDigits_memo;

    const 𝕊3 = createExtension𝕊3({mode: 6});

    const 𝕊4 = createExtension𝕊4({mode: 6});

    // -------------------- Compile-time constants --------------------
    𝕊0('DOUBLE_QUOTE').constant = {value: "\""};
    𝕊1('min').constant = {value: " "};
    𝕊1('max').constant = {value: "￿"};
    𝕊2('base').constant = {value: 16};
    𝕊2('minDigits').constant = {value: 4};
    𝕊2('maxDigits').constant = {value: 4};

    return 𝕊0('start');
})();




// --------------------------------------------------------------------------------
const print = (() => {

    // -------------------- json.pen --------------------

    const 𝕊0 = (name) => {
        switch (name) {
            case 'char': return 𝕊0_char;
            case 'f64': return 𝕊0_f64;
            case 'unicode': return 𝕊0_unicode;
            case 'start': return 𝕊0_start;
            case 'Value': return 𝕊0_Value;
            case 'False': return 𝕊0_False;
            case 'Null': return 𝕊0_Null;
            case 'True': return 𝕊0_True;
            case 'Object': return 𝕊0_Object;
            case 'Property': return 𝕊0_Property;
            case 'Array': return 𝕊0_Array;
            case 'Element': return 𝕊0_Element;
            case 'Number': return 𝕊0_Number;
            case 'String': return 𝕊0_String;
            case 'CHAR': return 𝕊0_CHAR;
            case 'LBRACE': return 𝕊0_LBRACE;
            case 'RBRACE': return 𝕊0_RBRACE;
            case 'LBRACKET': return 𝕊0_LBRACKET;
            case 'RBRACKET': return 𝕊0_RBRACKET;
            case 'COLON': return 𝕊0_COLON;
            case 'COMMA': return 𝕊0_COMMA;
            case 'DOUBLE_QUOTE': return 𝕊0_DOUBLE_QUOTE;
            case 'WS': return 𝕊0_WS;
            default: return undefined;
        }
    };

    const 𝕊0_char = (arg) => 𝕊3('char')(arg);

    const 𝕊0_f64 = (arg) => 𝕊3('f64')(arg);

    const 𝕊0_unicode = (arg) => 𝕊4('unicode')(arg);

    const 𝕊0_start = (arg) => {
        if (!𝕊0_start_memo) 𝕊0_start_memo = (() => {
            const t306 = 𝕊0('WS');
            const t307 = 𝕊0('Value');
            const t308 = 𝕊0('WS');
            return function SEQ() {
                let stateₒ = getState();
                let out;
                if (t306()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t307()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t308()) out = concat(out, OUT); else return setState(stateₒ), false;
                OUT = out;
                return true;
            };
        })();
        return 𝕊0_start_memo(arg);
    };
    let 𝕊0_start_memo;

    const 𝕊0_Value = (arg) => {
        if (!𝕊0_Value_memo) 𝕊0_Value_memo = (() => {
            const t309 = 𝕊0('False');
            const t310 = 𝕊0('Null');
            const t311 = 𝕊0('True');
            const t312 = 𝕊0('Object');
            const t313 = 𝕊0('Array');
            const t314 = 𝕊0('Number');
            const t315 = 𝕊0('String');
            return function SEL() {
                if (t309()) return true;
                if (t310()) return true;
                if (t311()) return true;
                if (t312()) return true;
                if (t313()) return true;
                if (t314()) return true;
                if (t315()) return true;
                return false;
            };
        })();
        return 𝕊0_Value_memo(arg);
    };
    let 𝕊0_Value_memo;

    const 𝕊0_False = (arg) => {
        if (!𝕊0_False_memo) 𝕊0_False_memo = (() => {
            const t316 = function STR() {
                OUT = "false";
                return true;
            };
            const t317 = function BOO() {
                if (IN !== false || IP !== 0) return false;
                IP += 1;
                OUT = undefined;
                return true;
            };
            return function SEQ() {
                let stateₒ = getState();
                let out;
                if (t316()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t317()) out = concat(out, OUT); else return setState(stateₒ), false;
                OUT = out;
                return true;
            };
        })();
        return 𝕊0_False_memo(arg);
    };
    let 𝕊0_False_memo;

    const 𝕊0_Null = (arg) => {
        if (!𝕊0_Null_memo) 𝕊0_Null_memo = (() => {
            const t318 = function STR() {
                OUT = "null";
                return true;
            };
            const t319 = function NUL() {
                if (IN !== null || IP !== 0) return false;
                IP += 1;
                OUT = undefined;
                return true;
            };
            return function SEQ() {
                let stateₒ = getState();
                let out;
                if (t318()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t319()) out = concat(out, OUT); else return setState(stateₒ), false;
                OUT = out;
                return true;
            };
        })();
        return 𝕊0_Null_memo(arg);
    };
    let 𝕊0_Null_memo;

    const 𝕊0_True = (arg) => {
        if (!𝕊0_True_memo) 𝕊0_True_memo = (() => {
            const t320 = function STR() {
                OUT = "true";
                return true;
            };
            const t321 = function BOO() {
                if (IN !== true || IP !== 0) return false;
                IP += 1;
                OUT = undefined;
                return true;
            };
            return function SEQ() {
                let stateₒ = getState();
                let out;
                if (t320()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t321()) out = concat(out, OUT); else return setState(stateₒ), false;
                OUT = out;
                return true;
            };
        })();
        return 𝕊0_True_memo(arg);
    };
    let 𝕊0_True_memo;

    const 𝕊0_Object = (arg) => {
        if (!𝕊0_Object_memo) 𝕊0_Object_memo = (() => {
            const t322 = 𝕊0('LBRACE');
            const t323 = (() => {
                const t325 = (() => {
                    const t327 = 𝕊0('Property');
                    const t328 = zeroOrMore({
                        mode: 7,
                        expression: (() => {
                            const t329 = 𝕊0('COMMA');
                            const t330 = 𝕊0('Property');
                            return function SEQ() {
                                let stateₒ = getState();
                                let out;
                                if (t329()) out = concat(out, OUT); else return setState(stateₒ), false;
                                if (t330()) out = concat(out, OUT); else return setState(stateₒ), false;
                                OUT = out;
                                return true;
                            };
                        })(),
                    });
                    return function SEQ() {
                        let stateₒ = getState();
                        let out;
                        if (t327()) out = concat(out, OUT); else return setState(stateₒ), false;
                        if (t328()) out = concat(out, OUT); else return setState(stateₒ), false;
                        OUT = out;
                        return true;
                    };
                })();
                const t326 = record({
                    mode: 7,
                    fields: [],
                });
                return function SEL() {
                    if (t325()) return true;
                    if (t326()) return true;
                    return false;
                };
            })();
            const t324 = 𝕊0('RBRACE');
            return function SEQ() {
                let stateₒ = getState();
                let out;
                if (t322()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t323()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t324()) out = concat(out, OUT); else return setState(stateₒ), false;
                OUT = out;
                return true;
            };
        })();
        return 𝕊0_Object_memo(arg);
    };
    let 𝕊0_Object_memo;

    const 𝕊0_Property = (arg) => {
        if (!𝕊0_Property_memo) 𝕊0_Property_memo = field({
            mode: 7,
            name: 𝕊0('String'),
            value: (() => {
                const t331 = 𝕊0('COLON');
                const t332 = 𝕊0('Value');
                return function SEQ() {
                    let stateₒ = getState();
                    let out;
                    if (t331()) out = concat(out, OUT); else return setState(stateₒ), false;
                    if (t332()) out = concat(out, OUT); else return setState(stateₒ), false;
                    OUT = out;
                    return true;
                };
            })(),
        });
        return 𝕊0_Property_memo(arg);
    };
    let 𝕊0_Property_memo;

    const 𝕊0_Array = (arg) => {
        if (!𝕊0_Array_memo) 𝕊0_Array_memo = (() => {
            const t333 = 𝕊0('LBRACKET');
            const t334 = (() => {
                const t336 = (() => {
                    const t338 = 𝕊0('Element');
                    const t339 = zeroOrMore({
                        mode: 7,
                        expression: (() => {
                            const t340 = 𝕊0('COMMA');
                            const t341 = 𝕊0('Element');
                            return function SEQ() {
                                let stateₒ = getState();
                                let out;
                                if (t340()) out = concat(out, OUT); else return setState(stateₒ), false;
                                if (t341()) out = concat(out, OUT); else return setState(stateₒ), false;
                                OUT = out;
                                return true;
                            };
                        })(),
                    });
                    return function SEQ() {
                        let stateₒ = getState();
                        let out;
                        if (t338()) out = concat(out, OUT); else return setState(stateₒ), false;
                        if (t339()) out = concat(out, OUT); else return setState(stateₒ), false;
                        OUT = out;
                        return true;
                    };
                })();
                const t337 = list({
                    mode: 7,
                    elements: [],
                });
                return function SEL() {
                    if (t336()) return true;
                    if (t337()) return true;
                    return false;
                };
            })();
            const t335 = 𝕊0('RBRACKET');
            return function SEQ() {
                let stateₒ = getState();
                let out;
                if (t333()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t334()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t335()) out = concat(out, OUT); else return setState(stateₒ), false;
                OUT = out;
                return true;
            };
        })();
        return 𝕊0_Array_memo(arg);
    };
    let 𝕊0_Array_memo;

    const 𝕊0_Element = (arg) => {
        if (!𝕊0_Element_memo) 𝕊0_Element_memo = list({
            mode: 7,
            elements: [
                𝕊0('Value'),
            ],
        });
        return 𝕊0_Element_memo(arg);
    };
    let 𝕊0_Element_memo;

    const 𝕊0_Number = (arg) => {
        if (!𝕊0_Number_memo) 𝕊0_Number_memo = 𝕊0('f64');
        return 𝕊0_Number_memo(arg);
    };
    let 𝕊0_Number_memo;

    const 𝕊0_String = (arg) => {
        if (!𝕊0_String_memo) 𝕊0_String_memo = (() => {
            const t342 = 𝕊0('DOUBLE_QUOTE');
            const t343 = zeroOrMore({
                mode: 7,
                expression: 𝕊0('CHAR'),
            });
            const t344 = 𝕊0('DOUBLE_QUOTE');
            return function SEQ() {
                let stateₒ = getState();
                let out;
                if (t342()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t343()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t344()) out = concat(out, OUT); else return setState(stateₒ), false;
                OUT = out;
                return true;
            };
        })();
        return 𝕊0_String_memo(arg);
    };
    let 𝕊0_String_memo;

    const 𝕊0_CHAR = (arg) => {
        if (!𝕊0_CHAR_memo) 𝕊0_CHAR_memo = (() => {
            const t345 = (() => {
                const t355 = (() => {
                    const t358 = function STR() {
                        if (typeof IN !== 'string') return false;
                        if (IP + 1 > IN.length) return false;
                        if (IN.charCodeAt(IP + 0) !== 92) return false;
                        IP += 1;
                        OUT = "\\";
                        return true;
                    };
                    return function NOT() {
                        let stateₒ = getState();
                        let result = !t358();
                        setState(stateₒ);
                        OUT = undefined;
                        return result;
                    };
                })();
                const t356 = (() => {
                    const t359 = function STR() {
                        if (typeof IN !== 'string') return false;
                        if (IP + 1 > IN.length) return false;
                        if (IN.charCodeAt(IP + 0) !== 34) return false;
                        IP += 1;
                        OUT = "\"";
                        return true;
                    };
                    return function NOT() {
                        let stateₒ = getState();
                        let result = !t359();
                        setState(stateₒ);
                        OUT = undefined;
                        return result;
                    };
                })();
                const t357 = (𝕊0('char'))(𝕊1);
                return function SEQ() {
                    let stateₒ = getState();
                    let out;
                    if (t355()) out = concat(out, OUT); else return setState(stateₒ), false;
                    if (t356()) out = concat(out, OUT); else return setState(stateₒ), false;
                    if (t357()) out = concat(out, OUT); else return setState(stateₒ), false;
                    OUT = out;
                    return true;
                };
            })();
            const t346 = (() => {
                const t360 = function STR() {
                    OUT = "\\\"";
                    return true;
                };
                const t361 = function STR() {
                    if (typeof IN !== 'string') return false;
                    if (IP + 1 > IN.length) return false;
                    if (IN.charCodeAt(IP + 0) !== 34) return false;
                    IP += 1;
                    OUT = undefined;
                    return true;
                };
                return function SEQ() {
                    let stateₒ = getState();
                    let out;
                    if (t360()) out = concat(out, OUT); else return setState(stateₒ), false;
                    if (t361()) out = concat(out, OUT); else return setState(stateₒ), false;
                    OUT = out;
                    return true;
                };
            })();
            const t347 = (() => {
                const t362 = function STR() {
                    OUT = "\\\\";
                    return true;
                };
                const t363 = function STR() {
                    if (typeof IN !== 'string') return false;
                    if (IP + 1 > IN.length) return false;
                    if (IN.charCodeAt(IP + 0) !== 92) return false;
                    IP += 1;
                    OUT = undefined;
                    return true;
                };
                return function SEQ() {
                    let stateₒ = getState();
                    let out;
                    if (t362()) out = concat(out, OUT); else return setState(stateₒ), false;
                    if (t363()) out = concat(out, OUT); else return setState(stateₒ), false;
                    OUT = out;
                    return true;
                };
            })();
            const t348 = (() => {
                const t364 = function STR() {
                    OUT = "\\/";
                    return true;
                };
                const t365 = function STR() {
                    if (typeof IN !== 'string') return false;
                    if (IP + 1 > IN.length) return false;
                    if (IN.charCodeAt(IP + 0) !== 47) return false;
                    IP += 1;
                    OUT = undefined;
                    return true;
                };
                return function SEQ() {
                    let stateₒ = getState();
                    let out;
                    if (t364()) out = concat(out, OUT); else return setState(stateₒ), false;
                    if (t365()) out = concat(out, OUT); else return setState(stateₒ), false;
                    OUT = out;
                    return true;
                };
            })();
            const t349 = (() => {
                const t366 = function STR() {
                    OUT = "\\b";
                    return true;
                };
                const t367 = function STR() {
                    if (typeof IN !== 'string') return false;
                    if (IP + 1 > IN.length) return false;
                    if (IN.charCodeAt(IP + 0) !== 8) return false;
                    IP += 1;
                    OUT = undefined;
                    return true;
                };
                return function SEQ() {
                    let stateₒ = getState();
                    let out;
                    if (t366()) out = concat(out, OUT); else return setState(stateₒ), false;
                    if (t367()) out = concat(out, OUT); else return setState(stateₒ), false;
                    OUT = out;
                    return true;
                };
            })();
            const t350 = (() => {
                const t368 = function STR() {
                    OUT = "\\f";
                    return true;
                };
                const t369 = function STR() {
                    if (typeof IN !== 'string') return false;
                    if (IP + 1 > IN.length) return false;
                    if (IN.charCodeAt(IP + 0) !== 12) return false;
                    IP += 1;
                    OUT = undefined;
                    return true;
                };
                return function SEQ() {
                    let stateₒ = getState();
                    let out;
                    if (t368()) out = concat(out, OUT); else return setState(stateₒ), false;
                    if (t369()) out = concat(out, OUT); else return setState(stateₒ), false;
                    OUT = out;
                    return true;
                };
            })();
            const t351 = (() => {
                const t370 = function STR() {
                    OUT = "\\n";
                    return true;
                };
                const t371 = function STR() {
                    if (typeof IN !== 'string') return false;
                    if (IP + 1 > IN.length) return false;
                    if (IN.charCodeAt(IP + 0) !== 10) return false;
                    IP += 1;
                    OUT = undefined;
                    return true;
                };
                return function SEQ() {
                    let stateₒ = getState();
                    let out;
                    if (t370()) out = concat(out, OUT); else return setState(stateₒ), false;
                    if (t371()) out = concat(out, OUT); else return setState(stateₒ), false;
                    OUT = out;
                    return true;
                };
            })();
            const t352 = (() => {
                const t372 = function STR() {
                    OUT = "\\r";
                    return true;
                };
                const t373 = function STR() {
                    if (typeof IN !== 'string') return false;
                    if (IP + 1 > IN.length) return false;
                    if (IN.charCodeAt(IP + 0) !== 13) return false;
                    IP += 1;
                    OUT = undefined;
                    return true;
                };
                return function SEQ() {
                    let stateₒ = getState();
                    let out;
                    if (t372()) out = concat(out, OUT); else return setState(stateₒ), false;
                    if (t373()) out = concat(out, OUT); else return setState(stateₒ), false;
                    OUT = out;
                    return true;
                };
            })();
            const t353 = (() => {
                const t374 = function STR() {
                    OUT = "\\t";
                    return true;
                };
                const t375 = function STR() {
                    if (typeof IN !== 'string') return false;
                    if (IP + 1 > IN.length) return false;
                    if (IN.charCodeAt(IP + 0) !== 9) return false;
                    IP += 1;
                    OUT = undefined;
                    return true;
                };
                return function SEQ() {
                    let stateₒ = getState();
                    let out;
                    if (t374()) out = concat(out, OUT); else return setState(stateₒ), false;
                    if (t375()) out = concat(out, OUT); else return setState(stateₒ), false;
                    OUT = out;
                    return true;
                };
            })();
            const t354 = (() => {
                const t376 = function STR() {
                    OUT = "\\u";
                    return true;
                };
                const t377 = (𝕊0('unicode'))(𝕊2);
                return function SEQ() {
                    let stateₒ = getState();
                    let out;
                    if (t376()) out = concat(out, OUT); else return setState(stateₒ), false;
                    if (t377()) out = concat(out, OUT); else return setState(stateₒ), false;
                    OUT = out;
                    return true;
                };
            })();
            return function SEL() {
                if (t345()) return true;
                if (t346()) return true;
                if (t347()) return true;
                if (t348()) return true;
                if (t349()) return true;
                if (t350()) return true;
                if (t351()) return true;
                if (t352()) return true;
                if (t353()) return true;
                if (t354()) return true;
                return false;
            };
        })();
        return 𝕊0_CHAR_memo(arg);
    };
    let 𝕊0_CHAR_memo;

    const 𝕊0_LBRACE = (arg) => {
        if (!𝕊0_LBRACE_memo) 𝕊0_LBRACE_memo = (() => {
            const t378 = 𝕊0('WS');
            const t379 = function STR() {
                OUT = "{";
                return true;
            };
            const t380 = 𝕊0('WS');
            return function SEQ() {
                let stateₒ = getState();
                let out;
                if (t378()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t379()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t380()) out = concat(out, OUT); else return setState(stateₒ), false;
                OUT = out;
                return true;
            };
        })();
        return 𝕊0_LBRACE_memo(arg);
    };
    let 𝕊0_LBRACE_memo;

    const 𝕊0_RBRACE = (arg) => {
        if (!𝕊0_RBRACE_memo) 𝕊0_RBRACE_memo = (() => {
            const t381 = 𝕊0('WS');
            const t382 = function STR() {
                OUT = "}";
                return true;
            };
            const t383 = 𝕊0('WS');
            return function SEQ() {
                let stateₒ = getState();
                let out;
                if (t381()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t382()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t383()) out = concat(out, OUT); else return setState(stateₒ), false;
                OUT = out;
                return true;
            };
        })();
        return 𝕊0_RBRACE_memo(arg);
    };
    let 𝕊0_RBRACE_memo;

    const 𝕊0_LBRACKET = (arg) => {
        if (!𝕊0_LBRACKET_memo) 𝕊0_LBRACKET_memo = (() => {
            const t384 = 𝕊0('WS');
            const t385 = function STR() {
                OUT = "[";
                return true;
            };
            const t386 = 𝕊0('WS');
            return function SEQ() {
                let stateₒ = getState();
                let out;
                if (t384()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t385()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t386()) out = concat(out, OUT); else return setState(stateₒ), false;
                OUT = out;
                return true;
            };
        })();
        return 𝕊0_LBRACKET_memo(arg);
    };
    let 𝕊0_LBRACKET_memo;

    const 𝕊0_RBRACKET = (arg) => {
        if (!𝕊0_RBRACKET_memo) 𝕊0_RBRACKET_memo = (() => {
            const t387 = 𝕊0('WS');
            const t388 = function STR() {
                OUT = "]";
                return true;
            };
            const t389 = 𝕊0('WS');
            return function SEQ() {
                let stateₒ = getState();
                let out;
                if (t387()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t388()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t389()) out = concat(out, OUT); else return setState(stateₒ), false;
                OUT = out;
                return true;
            };
        })();
        return 𝕊0_RBRACKET_memo(arg);
    };
    let 𝕊0_RBRACKET_memo;

    const 𝕊0_COLON = (arg) => {
        if (!𝕊0_COLON_memo) 𝕊0_COLON_memo = (() => {
            const t390 = 𝕊0('WS');
            const t391 = function STR() {
                OUT = ":";
                return true;
            };
            const t392 = 𝕊0('WS');
            return function SEQ() {
                let stateₒ = getState();
                let out;
                if (t390()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t391()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t392()) out = concat(out, OUT); else return setState(stateₒ), false;
                OUT = out;
                return true;
            };
        })();
        return 𝕊0_COLON_memo(arg);
    };
    let 𝕊0_COLON_memo;

    const 𝕊0_COMMA = (arg) => {
        if (!𝕊0_COMMA_memo) 𝕊0_COMMA_memo = (() => {
            const t393 = 𝕊0('WS');
            const t394 = function STR() {
                OUT = ",";
                return true;
            };
            const t395 = 𝕊0('WS');
            return function SEQ() {
                let stateₒ = getState();
                let out;
                if (t393()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t394()) out = concat(out, OUT); else return setState(stateₒ), false;
                if (t395()) out = concat(out, OUT); else return setState(stateₒ), false;
                OUT = out;
                return true;
            };
        })();
        return 𝕊0_COMMA_memo(arg);
    };
    let 𝕊0_COMMA_memo;

    const 𝕊0_DOUBLE_QUOTE = (arg) => {
        if (!𝕊0_DOUBLE_QUOTE_memo) 𝕊0_DOUBLE_QUOTE_memo = function STR() {
            OUT = "\"";
            return true;
        };
        return 𝕊0_DOUBLE_QUOTE_memo(arg);
    };
    let 𝕊0_DOUBLE_QUOTE_memo;

    const 𝕊0_WS = (arg) => {
        if (!𝕊0_WS_memo) 𝕊0_WS_memo = zeroOrMore({
            mode: 7,
            expression: (() => {
                const t396 = function STR() {
                    OUT = " ";
                    return true;
                };
                const t397 = function STR() {
                    OUT = "\t";
                    return true;
                };
                const t398 = function STR() {
                    OUT = "\n";
                    return true;
                };
                const t399 = function STR() {
                    OUT = "\r";
                    return true;
                };
                return function SEL() {
                    if (t396()) return true;
                    if (t397()) return true;
                    if (t398()) return true;
                    if (t399()) return true;
                    return false;
                };
            })(),
        });
        return 𝕊0_WS_memo(arg);
    };
    let 𝕊0_WS_memo;

    const 𝕊1 = (name) => {
        switch (name) {
            case 'min': return 𝕊1_min;
            case 'max': return 𝕊1_max;
            default: return undefined;
        }
    };

    const 𝕊1_min = (arg) => {
        if (!𝕊1_min_memo) 𝕊1_min_memo = function STR() {
            if (typeof IN !== 'string') return false;
            if (IP + 1 > IN.length) return false;
            if (IN.charCodeAt(IP + 0) !== 32) return false;
            IP += 1;
            OUT = " ";
            return true;
        };
        return 𝕊1_min_memo(arg);
    };
    let 𝕊1_min_memo;

    const 𝕊1_max = (arg) => {
        if (!𝕊1_max_memo) 𝕊1_max_memo = function STR() {
            if (typeof IN !== 'string') return false;
            if (IP + 1 > IN.length) return false;
            if (IN.charCodeAt(IP + 0) !== 65535) return false;
            IP += 1;
            OUT = "￿";
            return true;
        };
        return 𝕊1_max_memo(arg);
    };
    let 𝕊1_max_memo;

    const 𝕊2 = (name) => {
        switch (name) {
            case 'base': return 𝕊2_base;
            case 'minDigits': return 𝕊2_minDigits;
            case 'maxDigits': return 𝕊2_maxDigits;
            default: return undefined;
        }
    };

    const 𝕊2_base = (arg) => {
        if (!𝕊2_base_memo) 𝕊2_base_memo = function NUM() {
            if (IN !== 16 || IP !== 0) return false;
            IP += 1;
            OUT = undefined;
            return true;
        };
        return 𝕊2_base_memo(arg);
    };
    let 𝕊2_base_memo;

    const 𝕊2_minDigits = (arg) => {
        if (!𝕊2_minDigits_memo) 𝕊2_minDigits_memo = function NUM() {
            if (IN !== 4 || IP !== 0) return false;
            IP += 1;
            OUT = undefined;
            return true;
        };
        return 𝕊2_minDigits_memo(arg);
    };
    let 𝕊2_minDigits_memo;

    const 𝕊2_maxDigits = (arg) => {
        if (!𝕊2_maxDigits_memo) 𝕊2_maxDigits_memo = function NUM() {
            if (IN !== 4 || IP !== 0) return false;
            IP += 1;
            OUT = undefined;
            return true;
        };
        return 𝕊2_maxDigits_memo(arg);
    };
    let 𝕊2_maxDigits_memo;

    const 𝕊3 = createExtension𝕊3({mode: 7});

    const 𝕊4 = createExtension𝕊4({mode: 7});

    // -------------------- Compile-time constants --------------------
    𝕊0('DOUBLE_QUOTE').constant = {value: "\""};
    𝕊1('min').constant = {value: " "};
    𝕊1('max').constant = {value: "￿"};
    𝕊2('base').constant = {value: 16};
    𝕊2('minDigits').constant = {value: 4};
    𝕊2('maxDigits').constant = {value: 4};

    return 𝕊0('start');
})();

// -------------------- Main exports --------------------
module.exports = {
    parse(text) {
        setState({ IN: text, IP: 0 });
        if (!parse()) throw new Error('parse failed');
        if (!isInputFullyConsumed()) throw new Error('parse didn\'t consume entire input');
        if (OUT === undefined) throw new Error('parse didn\'t return a value');
        return OUT;
    },
    print(node) {
        setState({ IN: node, IP: 0 });
        if (!print()) throw new Error('print failed');
        if (!isInputFullyConsumed()) throw new Error('print didn\'t consume entire input');
        if (OUT === undefined) throw new Error('print didn\'t return a value');
        return OUT;
    },
};
