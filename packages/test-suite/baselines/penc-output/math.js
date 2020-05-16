
"use strict";
function booleanLiteral(options) {
    const { value } = options;
    const out = options.out === 'ast' ? value : undefined;
    if (options.in !== 'ast') {
        return { rule: function BOO() { return OUT = out, true; } };
    }
    return {
        rule: function BOO() {
            if (IN !== value || IP !== 0)
                return false;
            IP += 1;
            OUT = out;
            return true;
        },
    };
}
function character(options) {
    const { min, max } = options;
    if (options.in === 'nil') {
        const out = options.out === 'nil' ? undefined : min;
        return { rule: function CHA() { return OUT = out, true; } };
    }
    return {
        rule: function CHA() {
            if (typeof IN !== 'string')
                return false;
            if (IP < 0 || IP >= IN.length)
                return false;
            let c = IN.charAt(IP);
            if (c < min || c > max)
                return false;
            IP += 1;
            OUT = options.out === 'nil' ? undefined : c;
            return true;
        },
    };
}
function createMainExports(createProgram) {
    const parse = createProgram({ in: 'txt', out: 'ast' }).rule;
    const print = createProgram({ in: 'ast', out: 'txt' }).rule;
    return {
        parse: (text) => {
            setState({ IN: text, IP: 0 });
            if (!parse())
                throw new Error('parse failed');
            if (!isInputFullyConsumed())
                throw new Error(`parse didn't consume entire input`);
            if (OUT === undefined)
                throw new Error(`parse didn't return a value`);
            return OUT;
        },
        print: (node) => {
            setState({ IN: node, IP: 0 });
            if (!print())
                throw new Error('print failed');
            if (!isInputFullyConsumed())
                throw new Error(`print didn't consume entire input`);
            if (OUT === undefined)
                throw new Error(`print didn't return a value`);
            return OUT;
        },
    };
}
function field(options) {
    const { name, value } = options;
    if (options.in === 'txt' || options.out === 'ast') {
        return {
            rule: function FLD() {
                let stateₒ = getState();
                let obj = {};
                if (!name.rule())
                    return false;
                assert(typeof OUT === 'string');
                let propName = OUT;
                if (!value.rule())
                    return setState(stateₒ), false;
                assert(OUT !== undefined);
                obj[propName] = OUT;
                OUT = obj;
                return true;
            },
        };
    }
    if (options.in === 'ast' || options.out === 'txt') {
        return {
            rule: function FLD() {
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
                    if (!name.rule())
                        continue;
                    if (IP !== propName.length)
                        continue;
                    text = concat(text, OUT);
                    setState({ IN: obj[propName], IP: 0 });
                    if (!value.rule())
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
            },
        };
    }
    throw new Error(`Unsupported operation '${options.in}'->'${options.out}'`);
}
function list(options) {
    const { elements } = options;
    const elementsLength = elements.length;
    if (options.in === 'txt' || options.out === 'ast') {
        return {
            rule: function LST() {
                let stateₒ = getState();
                let arr = [];
                for (let i = 0; i < elementsLength; ++i) {
                    if (!elements[i].rule())
                        return setState(stateₒ), false;
                    assert(OUT !== undefined);
                    arr.push(OUT);
                }
                OUT = arr;
                return true;
            },
        };
    }
    if (options.in === 'ast' || options.out === 'txt') {
        return {
            rule: function LST() {
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
                    if (!elements[i].rule())
                        return setState(stateₒ), false;
                    if (!isInputFullyConsumed())
                        return setState(stateₒ), false;
                    text = concat(text, OUT);
                }
                setState({ IN: arr, IP: off + elementsLength });
                OUT = text;
                return true;
            },
        };
    }
    throw new Error(`Unsupported operation '${options.in}'->'${options.out}'`);
}
function nullLiteral(options) {
    const out = options.out === 'ast' ? null : undefined;
    if (options.in !== 'ast') {
        return { rule: function NUL() { return OUT = out, true; } };
    }
    return {
        rule: function NUL() {
            if (IN !== null || IP !== 0)
                return false;
            IP = 1;
            OUT = out;
            return true;
        },
    };
}
function numericLiteral(options) {
    const { value } = options;
    const out = options.out === 'ast' ? value : undefined;
    if (options.in !== 'ast') {
        return { rule: function NUM() { return OUT = out, true; } };
    }
    return {
        rule: function NUM() {
            if (IN !== value || IP !== 0)
                return false;
            IP = 1;
            OUT = out;
            return true;
        },
    };
}
function record(options) {
    const { fields } = options;
    if (options.in === 'txt' || options.out === 'ast') {
        return {
            rule: function RCD() {
                let stateₒ = getState();
                let obj = {};
                for (let field of fields) {
                    let propName = field.name;
                    if (!field.value.rule())
                        return setState(stateₒ), false;
                    assert(OUT !== undefined);
                    obj[propName] = OUT;
                }
                OUT = obj;
                return true;
            },
        };
    }
    if (options.in === 'ast' || options.out === 'txt') {
        return {
            rule: function RCD() {
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
                    if (!field.value.rule())
                        return setState(stateₒ), false;
                    if (!isInputFullyConsumed())
                        return setState(stateₒ), false;
                    text = concat(text, OUT);
                    bitmask += propBit;
                }
                setState({ IN: obj, IP: bitmask });
                OUT = text;
                return true;
            },
        };
    }
    throw new Error(`Unsupported operation '${options.in}'->'${options.out}'`);
}
function selection(options) {
    const { expressions } = options;
    const arity = expressions.length;
    return {
        rule: function SEL() {
            for (let i = 0; i < arity; ++i) {
                if (expressions[i].rule())
                    return true;
            }
            return false;
        },
    };
}
function sequence(options) {
    const { expressions } = options;
    const arity = expressions.length;
    return {
        rule: function SEQ() {
            let stateₒ = getState();
            let out;
            for (let i = 0; i < arity; ++i) {
                if (!expressions[i].rule())
                    return setState(stateₒ), false;
                out = concat(out, OUT);
            }
            OUT = out;
            return true;
        },
    };
}
function stringLiteral(options) {
    const { value } = options;
    const out = options.out === 'nil' ? undefined : value;
    if (options.in === 'nil') {
        return { rule: function STR() { return OUT = out, true; } };
    }
    return {
        rule: function STR() {
            if (typeof IN !== 'string')
                return false;
            if (!isMatch(value))
                return false;
            IP += value.length;
            OUT = out;
            return true;
        },
    };
}
function isMatch(substr) {
    let lastPos = IP + substr.length;
    if (lastPos > IN.length)
        return false;
    for (let i = IP, j = 0; i < lastPos; ++i, ++j) {
        if (IN.charAt(i) !== substr.charAt(j))
            return false;
    }
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
    if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null)
        return Object.assign(Object.assign({}, a), b);
    throw new Error(`Internal error: invalid sequence`);
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

// -------------------- Extensions --------------------
const 𝔼16 = (() => {
    "use strict";
    /* @pen exports = {
        f64,
        i32,
        memoise,
    } */
    // TODO: doc... has both 'txt' and 'ast' representation
    function f64(options) {
        if (options.in === 'nil') {
            const out = options.out === 'nil' ? undefined : 0;
            return { rule: function F64() { return OUT = out, true; } };
        }
        if (options.in === 'txt' || options.out === 'ast') {
            return {
                rule: function F64() {
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
                    OUT = options.out === 'nil' ? undefined : num;
                    return true;
                },
            };
        }
        if (options.in === 'ast' || options.out === 'txt') {
            return {
                rule: function F64() {
                    // Ensure N is a number.
                    if (typeof IN !== 'number' || IP !== 0)
                        return false;
                    // Delegate unparsing to the JS runtime.
                    // TODO: the conversion may not exactly match the original string. Add this to the lossiness list.
                    OUT = options.out === 'nil' ? undefined : String(IN);
                    IP = 1;
                    return true;
                },
            };
        }
        throw new Error(`Unsupported operation '${options.in}'->'${options.out}'`);
    }
    // These constants are used by the f64 rule.
    const PLUS_SIGN = '+'.charCodeAt(0);
    const MINUS_SIGN = '-'.charCodeAt(0);
    const DECIMAL_POINT = '.'.charCodeAt(0);
    const ZERO_DIGIT = '0'.charCodeAt(0);
    const NINE_DIGIT = '9'.charCodeAt(0);
    const LOWERCASE_E = 'e'.charCodeAt(0);
    const UPPERCASE_E = 'E'.charCodeAt(0);
    // tslint:disable: no-bitwise
    // TODO: doc... has both 'txt' and 'ast' representation
    function i32(options) {
        let result = {
            lambda(expr) {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                let base = (_d = (_c = (_b = (_a = expr.bindings) === null || _a === void 0 ? void 0 : _a.base) === null || _b === void 0 ? void 0 : _b.constant) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : 10;
                let signed = (_h = (_g = (_f = (_e = expr.bindings) === null || _e === void 0 ? void 0 : _e.signed) === null || _f === void 0 ? void 0 : _f.constant) === null || _g === void 0 ? void 0 : _g.value) !== null && _h !== void 0 ? _h : true;
                assert(typeof base === 'number' && base >= 2 && base <= 36);
                assert(typeof signed === 'boolean');
                if (options.in === 'nil') {
                    const out = options.out === 'nil' ? undefined : 0;
                    return { rule: function I32() { return OUT = out, true; } };
                }
                if (options.in === 'txt' || options.out === 'ast') {
                    return {
                        rule: function I32() {
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
                            OUT = options.out === 'nil' ? undefined : num;
                            return true;
                        },
                    };
                }
                if (options.in === 'ast' || options.out === 'txt') {
                    return {
                        rule() {
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
                            OUT = options.out === 'nil' ? undefined : String.fromCharCode(...digits.reverse());
                            IP = 1;
                            return true;
                        },
                    };
                }
                throw new Error(`Unsupported operation '${options.in}'->'${options.out}'`);
            },
        };
        // TODO: temp testing...
        result.rule = result.lambda({ bindings: {
                base: { constant: { value: 10 } },
                unsigned: { constant: { value: false } },
            } }).rule;
        return result;
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
    function memoise(_options) {
        return {
            lambda(expr) {
                // TODO: investigate... need to use `text` as part of memo key? Study lifecycle/extent of each `memos` instance.
                const memos = new Map();
                return {
                    rule: function MEM() {
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
                            if (expr.rule()) {
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
                                if (!expr.rule())
                                    break;
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
                    },
                };
            },
        };
    }

    return {
        f64,
        i32,
        memoise,
    };
})();
const 𝔼17 = (() => {
    "use strict";
    /* @pen exports = {
        anyChar,
        epsilon,
        maybe,
        not,
        unicode,
        zeroOrMore
    } */
    // TODO: doc... has both 'txt' and 'ast' representation
    function anyChar(options) {
        if (options.in === 'nil') {
            const out = options.out === 'nil' ? undefined : '?';
            return { rule: function ANY() { return OUT = out, true; } };
        }
        return {
            rule: function ANY() {
                if (typeof IN !== 'string')
                    return false;
                if (IP < 0 || IP >= IN.length)
                    return false;
                let c = IN.charAt(IP);
                IP += 1;
                OUT = options.out === 'nil' ? undefined : c;
                return true;
            },
        };
    }
    function epsilon(_options) {
        return {
            rule: function EPS() {
                OUT = undefined;
                return true;
            },
        };
    }
    function maybe(options) {
        const eps = epsilon(options); // TODO: remove this altogether?
        return {
            lambda(expr) {
                return {
                    rule: function Oⵈ1() {
                        return expr.rule() || eps.rule();
                    },
                };
            },
        };
    }
    function not(options) {
        const eps = epsilon(options); // TODO: remove this altogether?
        return {
            lambda(expr) {
                return {
                    rule: function NOT() {
                        let stateₒ = getState();
                        if (!expr.rule())
                            return eps.rule();
                        setState(stateₒ);
                        return false;
                    },
                };
            },
        };
    }
    function unicode(options) {
        return {
            lambda(expr) {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                let base = (_c = (_b = (_a = expr.bindings) === null || _a === void 0 ? void 0 : _a.base) === null || _b === void 0 ? void 0 : _b.constant) === null || _c === void 0 ? void 0 : _c.value;
                let minDigits = (_f = (_e = (_d = expr.bindings) === null || _d === void 0 ? void 0 : _d.minDigits) === null || _e === void 0 ? void 0 : _e.constant) === null || _f === void 0 ? void 0 : _f.value;
                let maxDigits = (_j = (_h = (_g = expr.bindings) === null || _g === void 0 ? void 0 : _g.maxDigits) === null || _h === void 0 ? void 0 : _h.constant) === null || _j === void 0 ? void 0 : _j.value;
                assert(typeof base === 'number' && base >= 2 && base <= 36);
                assert(typeof minDigits === 'number' && minDigits >= 1 && minDigits <= 8);
                assert(typeof maxDigits === 'number' && maxDigits >= minDigits && maxDigits <= 8);
                // Construct a regex to match the digits
                let pattern = `[0-${base < 10 ? base - 1 : 9}${base > 10 ? `a-${String.fromCharCode('a'.charCodeAt(0) + base - 11)}` : ''}]`;
                let regex = RegExp(pattern, 'i');
                if (options.in === 'txt' || options.out === 'ast') {
                    return {
                        rule: function UNI() {
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
                        },
                    };
                }
                if (options.in === 'ast' || options.out === 'txt') {
                    return {
                        rule: function UNI() {
                            // TODO: implement
                            return false;
                        },
                    };
                }
                throw new Error(`Unsupported operation '${options.in}'->'${options.out}'`);
            },
        };
    }
    function zeroOrMore(_options) {
        return {
            lambda(expr) {
                return {
                    rule: function OⵈM() {
                        let stateₒ = getState();
                        let out;
                        while (true) {
                            if (!expr.rule())
                                break;
                            // TODO: check if any input was consumed...
                            // if not, stop iterating, since otherwise we may loop forever
                            // TODO: any other checks needed? review...
                            if (IP === stateₒ.IP)
                                break;
                            out = concat(out, OUT);
                        }
                        OUT = out;
                        return true;
                    },
                };
            },
        };
    }

    return {
        anyChar,
        epsilon,
        maybe,
        not,
        unicode,
        zeroOrMore,
    };
})();

function createProgram({in: IN, out: OUT}) {

    const 𝕊12 = {
        bindings: {
            memoise: {},
            f64: {},
            i32: {},
            not: {},
            start: {},
            expr: {},
            add: {},
            sub: {},
            term: {},
            mul: {},
            div: {},
            factor: {},
        },
    };

    const 𝕊13 = {
        bindings: {
            base: {},
            signed: {},
        },
    };

    const 𝕊14 = {
        bindings: {
            base: {},
            signed: {},
        },
    };

    const 𝕊15 = {
        bindings: {
            signed: {},
        },
    };

    const 𝕊16 = {
        bindings: {
            f64: {},
            i32: {},
            memoise: {},
        },
    };

    const 𝕊17 = {
        bindings: {
            anyChar: {},
            epsilon: {},
            maybe: {},
            not: {},
            unicode: {},
            zeroOrMore: {},
        },
    };

    // -------------------- Aliases --------------------
    𝕊12.bindings.memoise = 𝕊16.bindings.memoise;
    𝕊12.bindings.f64 = 𝕊16.bindings.f64;
    𝕊12.bindings.i32 = 𝕊16.bindings.i32;
    𝕊12.bindings.not = 𝕊17.bindings.not;
    𝕊12.bindings.start = 𝕊12.bindings.expr;

    // -------------------- Compile-time constants --------------------
    𝕊13.bindings.base.constant = {value: 16};
    𝕊13.bindings.signed.constant = {value: false};
    𝕊14.bindings.base.constant = {value: 2};
    𝕊14.bindings.signed.constant = {value: false};
    𝕊15.bindings.signed.constant = {value: false};

    // -------------------- std.pen.js --------------------

    Object.assign(
        𝕊16.bindings.f64,
        𝔼16.f64({in: IN, out: OUT}),
    );

    Object.assign(
        𝕊16.bindings.i32,
        𝔼16.i32({in: IN, out: OUT}),
    );

    Object.assign(
        𝕊16.bindings.memoise,
        𝔼16.memoise({in: IN, out: OUT}),
    );

    // -------------------- experiments.pen.js --------------------

    Object.assign(
        𝕊17.bindings.anyChar,
        𝔼17.anyChar({in: IN, out: OUT}),
    );

    Object.assign(
        𝕊17.bindings.epsilon,
        𝔼17.epsilon({in: IN, out: OUT}),
    );

    Object.assign(
        𝕊17.bindings.maybe,
        𝔼17.maybe({in: IN, out: OUT}),
    );

    Object.assign(
        𝕊17.bindings.not,
        𝔼17.not({in: IN, out: OUT}),
    );

    Object.assign(
        𝕊17.bindings.unicode,
        𝔼17.unicode({in: IN, out: OUT}),
    );

    Object.assign(
        𝕊17.bindings.zeroOrMore,
        𝔼17.zeroOrMore({in: IN, out: OUT}),
    );

    // -------------------- math.pen --------------------

    Object.assign(
        𝕊12.bindings.expr,
        (𝕊12.bindings.memoise).lambda(selection({
            in: IN,
            out: OUT,
            expressions: [
                𝕊12.bindings.add,
                𝕊12.bindings.sub,
                𝕊12.bindings.term,
            ],
        }))
    );

    Object.assign(
        𝕊12.bindings.add,
        record({
            in: IN,
            out: OUT,
            fields: [
                {
                    name: 'type',
                    value: stringLiteral({
                        in: IN !== "ast" ? "nil" : IN,
                        out: OUT !== "ast" ? "nil" : OUT,
                        value: "add",
                    }),
                },
                {
                    name: 'lhs',
                    value: 𝕊12.bindings.expr,
                },
                {
                    name: 'rhs',
                    value: sequence({
                        in: IN,
                        out: OUT,
                        expressions: [
                            stringLiteral({
                                in: IN !== "txt" ? "nil" : IN,
                                out: OUT !== "txt" ? "nil" : OUT,
                                value: "+",
                            }),
                            𝕊12.bindings.term,
                        ],
                    }),
                },
            ],
        })
    );

    Object.assign(
        𝕊12.bindings.sub,
        record({
            in: IN,
            out: OUT,
            fields: [
                {
                    name: 'type',
                    value: stringLiteral({
                        in: IN !== "ast" ? "nil" : IN,
                        out: OUT !== "ast" ? "nil" : OUT,
                        value: "sub",
                    }),
                },
                {
                    name: 'lhs',
                    value: 𝕊12.bindings.expr,
                },
                {
                    name: 'rhs',
                    value: sequence({
                        in: IN,
                        out: OUT,
                        expressions: [
                            stringLiteral({
                                in: IN !== "txt" ? "nil" : IN,
                                out: OUT !== "txt" ? "nil" : OUT,
                                value: "-",
                            }),
                            𝕊12.bindings.term,
                        ],
                    }),
                },
            ],
        })
    );

    Object.assign(
        𝕊12.bindings.term,
        (𝕊12.bindings.memoise).lambda(selection({
            in: IN,
            out: OUT,
            expressions: [
                𝕊12.bindings.mul,
                𝕊12.bindings.div,
                𝕊12.bindings.factor,
            ],
        }))
    );

    Object.assign(
        𝕊12.bindings.mul,
        sequence({
            in: IN,
            out: OUT,
            expressions: [
                field({
                    in: IN,
                    out: OUT,
                    name: stringLiteral({
                        in: IN !== "ast" ? "nil" : IN,
                        out: OUT !== "ast" ? "nil" : OUT,
                        value: "type",
                    }),
                    value: stringLiteral({
                        in: IN !== "ast" ? "nil" : IN,
                        out: OUT !== "ast" ? "nil" : OUT,
                        value: "mul",
                    }),
                }),
                record({
                    in: IN,
                    out: OUT,
                    fields: [
                        {
                            name: 'lhs',
                            value: 𝕊12.bindings.term,
                        },
                    ],
                }),
                field({
                    in: IN,
                    out: OUT,
                    name: stringLiteral({
                        in: IN !== "ast" ? "nil" : IN,
                        out: OUT !== "ast" ? "nil" : OUT,
                        value: "rhs",
                    }),
                    value: sequence({
                        in: IN,
                        out: OUT,
                        expressions: [
                            stringLiteral({
                                in: IN !== "txt" ? "nil" : IN,
                                out: OUT !== "txt" ? "nil" : OUT,
                                value: "*",
                            }),
                            𝕊12.bindings.factor,
                        ],
                    }),
                }),
            ],
        })
    );

    Object.assign(
        𝕊12.bindings.div,
        record({
            in: IN,
            out: OUT,
            fields: [
                {
                    name: 'type',
                    value: stringLiteral({
                        in: IN !== "ast" ? "nil" : IN,
                        out: OUT !== "ast" ? "nil" : OUT,
                        value: "div",
                    }),
                },
                {
                    name: 'lhs',
                    value: 𝕊12.bindings.term,
                },
                {
                    name: 'rhs',
                    value: sequence({
                        in: IN,
                        out: OUT,
                        expressions: [
                            stringLiteral({
                                in: IN !== "txt" ? "nil" : IN,
                                out: OUT !== "txt" ? "nil" : OUT,
                                value: "/",
                            }),
                            𝕊12.bindings.factor,
                        ],
                    }),
                },
            ],
        })
    );

    Object.assign(
        𝕊12.bindings.factor,
        selection({
            in: IN,
            out: OUT,
            expressions: [
                sequence({
                    in: IN,
                    out: OUT,
                    expressions: [
                        (𝕊12.bindings.not).lambda(selection({
                            in: IN,
                            out: OUT,
                            expressions: [
                                stringLiteral({
                                    in: IN,
                                    out: OUT,
                                    value: "0x",
                                }),
                                stringLiteral({
                                    in: IN,
                                    out: OUT,
                                    value: "0b",
                                }),
                            ],
                        })),
                        𝕊12.bindings.f64,
                    ],
                }),
                sequence({
                    in: IN,
                    out: OUT,
                    expressions: [
                        stringLiteral({
                            in: IN !== "txt" ? "nil" : IN,
                            out: OUT !== "txt" ? "nil" : OUT,
                            value: "0x",
                        }),
                        (𝕊12.bindings.i32).lambda(𝕊13),
                    ],
                }),
                sequence({
                    in: IN,
                    out: OUT,
                    expressions: [
                        stringLiteral({
                            in: IN !== "txt" ? "nil" : IN,
                            out: OUT !== "txt" ? "nil" : OUT,
                            value: "0b",
                        }),
                        (𝕊12.bindings.i32).lambda(𝕊14),
                    ],
                }),
                sequence({
                    in: IN,
                    out: OUT,
                    expressions: [
                        stringLiteral({
                            in: IN !== "txt" ? "nil" : IN,
                            out: OUT !== "txt" ? "nil" : OUT,
                            value: "i",
                        }),
                        (𝕊12.bindings.i32).lambda(𝕊15),
                    ],
                }),
                sequence({
                    in: IN,
                    out: OUT,
                    expressions: [
                        stringLiteral({
                            in: IN !== "txt" ? "nil" : IN,
                            out: OUT !== "txt" ? "nil" : OUT,
                            value: "(",
                        }),
                        𝕊12.bindings.expr,
                        stringLiteral({
                            in: IN !== "txt" ? "nil" : IN,
                            out: OUT !== "txt" ? "nil" : OUT,
                            value: ")",
                        }),
                    ],
                }),
            ],
        })
    );

    Object.assign(
        𝕊13.bindings.base,
        numericLiteral({in: IN, out: OUT, value: 16})
    );

    Object.assign(
        𝕊13.bindings.signed,
        booleanLiteral({in: IN, out: OUT, value: false})
    );

    Object.assign(
        𝕊14.bindings.base,
        numericLiteral({in: IN, out: OUT, value: 2})
    );

    Object.assign(
        𝕊14.bindings.signed,
        booleanLiteral({in: IN, out: OUT, value: false})
    );

    Object.assign(
        𝕊15.bindings.signed,
        booleanLiteral({in: IN, out: OUT, value: false})
    );

    return 𝕊12.bindings.start;
}

// -------------------- Main exports --------------------
module.exports = createMainExports(createProgram);
