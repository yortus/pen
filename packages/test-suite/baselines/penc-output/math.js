
"use strict";
function abstract(expr) {
    return {
        bindings: {},
        parse() {
            let INULₒ = INUL;
            INUL = true;
            let result = expr.parse();
            INUL = INULₒ;
            return result;
        },
        unparse() {
            let ONULₒ = ONUL;
            ONUL = true;
            let result = expr.unparse();
            ONUL = ONULₒ;
            return result;
        },
        apply: NOT_A_LAMBDA,
    };
}
function apply(lambda, arg) {
    return lambda.apply(arg);
}
function booleanLiteral(value) {
    return {
        bindings: {},
        parse() {
            ODOC = ONUL ? undefined : value;
            return true;
        },
        unparse() {
            if (!INUL) {
                if (IDOC !== value || IMEM !== 0)
                    return false;
                IMEM += 1;
            }
            ODOC = undefined;
            return true;
        },
        apply: NOT_A_LAMBDA,
    };
}
function character(min, max) {
    return {
        bindings: {},
        parse() {
            let c = min;
            if (!INUL) {
                if (!isString(IDOC))
                    return false;
                if (IMEM < 0 || IMEM >= IDOC.length)
                    return false;
                c = IDOC.charAt(IMEM);
                if (c < min || c > max)
                    return false;
                IMEM += 1;
            }
            ODOC = ONUL ? undefined : c;
            return true;
        },
        unparse() {
            let c = min;
            if (!INUL) {
                if (!isString(IDOC))
                    return false;
                if (IMEM < 0 || IMEM >= IDOC.length)
                    return false;
                c = IDOC.charAt(IMEM);
                if (c < min || c > max)
                    return false;
                IMEM += 1;
            }
            ODOC = ONUL ? undefined : c;
            return true;
        },
        apply: NOT_A_LAMBDA,
    };
}
function concrete(expr) {
    return {
        bindings: {},
        parse() {
            let ONULₒ = ONUL;
            ONUL = true;
            let result = expr.parse();
            ONUL = ONULₒ;
            return result;
        },
        unparse() {
            let INULₒ = INUL;
            INUL = true;
            let result = expr.unparse();
            INUL = INULₒ;
            return result;
        },
        apply: NOT_A_LAMBDA,
    };
}
function createMainExports(start) {
    return {
        parse: (text) => {
            setInState(text, 0);
            if (!start.parse())
                throw new Error('parse failed');
            if (!isFullyConsumed(IDOC, IMEM))
                throw new Error(`parse didn't consume entire input`);
            if (ODOC === undefined)
                throw new Error(`parse didn't return a value`);
            return ODOC;
        },
        unparse: (node) => {
            setInState(node, 0);
            if (!start.unparse())
                throw new Error('parse failed');
            if (!isFullyConsumed(IDOC, IMEM))
                throw new Error(`unparse didn't consume entire input`);
            if (ODOC === undefined)
                throw new Error(`parse didn't return a value`);
            return ODOC;
        },
    };
}
function field(name, value) {
    return {
        bindings: {},
        parse() {
            let stateₒ = getState();
            let obj = {};
            if (!name.parse())
                return false;
            assert(typeof ODOC === 'string');
            let propName = ODOC;
            if (!value.parse())
                return setState(stateₒ), false;
            assert(ODOC !== undefined);
            obj[propName] = ODOC;
            ODOC = obj;
            return true;
        },
        unparse() {
            if (!isPlainObject(IDOC))
                return false;
            let stateₒ = getState();
            let text;
            let propNames = Object.keys(IDOC);
            let propCount = propNames.length;
            assert(propCount <= 32);
            const obj = IDOC;
            let bitmask = IMEM;
            for (let i = 0; i < propCount; ++i) {
                let propName = propNames[i];
                const propBit = 1 << i;
                if ((bitmask & propBit) !== 0)
                    continue;
                setInState(propName, 0);
                if (!name.unparse())
                    continue;
                if (IMEM !== propName.length)
                    continue;
                text = concat(text, ODOC);
                setInState(obj[propName], 0);
                if (!value.unparse())
                    continue;
                if (!isFullyConsumed(obj[propName], IMEM))
                    continue;
                text = concat(text, ODOC);
                bitmask += propBit;
                setInState(obj, bitmask);
                ODOC = text;
                return true;
            }
            setState(stateₒ);
            return false;
        },
        apply: NOT_A_LAMBDA,
    };
}
function list(elements) {
    const elementsLength = elements.length;
    return {
        bindings: {},
        parse() {
            let stateₒ = getState();
            let arr = [];
            for (let i = 0; i < elementsLength; ++i) {
                if (!elements[i].parse())
                    return setState(stateₒ), false;
                assert(ODOC !== undefined);
                arr.push(ODOC);
            }
            ODOC = arr;
            return true;
        },
        unparse() {
            if (!Array.isArray(IDOC))
                return false;
            if (IMEM < 0 || IMEM + elementsLength > IDOC.length)
                return false;
            let stateₒ = getState();
            let text;
            const arr = IDOC;
            const off = IMEM;
            for (let i = 0; i < elementsLength; ++i) {
                setInState(arr[off + i], 0);
                if (!elements[i].unparse())
                    return setState(stateₒ), false;
                if (!isFullyConsumed(IDOC, IMEM))
                    return setState(stateₒ), false;
                text = concat(text, ODOC);
            }
            setInState(arr, off + elementsLength);
            ODOC = text;
            return true;
        },
        apply: NOT_A_LAMBDA,
    };
}
const nullLiteral = {
    bindings: {},
    parse() {
        ODOC = ONUL ? undefined : null;
        return true;
    },
    unparse() {
        if (!INUL) {
            if (IDOC !== null || IMEM !== 0)
                return false;
            IMEM = 1;
        }
        ODOC = undefined;
        return true;
    },
    apply: NOT_A_LAMBDA,
};
function numericLiteral(value) {
    return {
        bindings: {},
        parse() {
            ODOC = ONUL ? undefined : value;
            return true;
        },
        unparse() {
            if (!INUL) {
                if (IDOC !== value || IMEM !== 0)
                    return false;
                IMEM = 1;
            }
            ODOC = undefined;
            return true;
        },
        apply: NOT_A_LAMBDA,
    };
}
function record(fields) {
    return {
        bindings: {},
        parse() {
            let stateₒ = getState();
            let obj = {};
            for (let field of fields) {
                let propName = field.name;
                if (!field.value.parse())
                    return setState(stateₒ), false;
                assert(ODOC !== undefined);
                obj[propName] = ODOC;
            }
            ODOC = obj;
            return true;
        },
        unparse() {
            if (!isPlainObject(IDOC))
                return false;
            let stateₒ = getState();
            let text;
            let propNames = Object.keys(IDOC);
            let propCount = propNames.length;
            assert(propCount <= 32);
            const obj = IDOC;
            let bitmask = IMEM;
            for (let field of fields) {
                let i = propNames.indexOf(field.name);
                if (i < 0)
                    return setState(stateₒ), false;
                let propName = propNames[i];
                const propBit = 1 << i;
                if ((bitmask & propBit) !== 0)
                    return setState(stateₒ), false;
                setInState(obj[propName], 0);
                if (!field.value.unparse())
                    return setState(stateₒ), false;
                if (!isFullyConsumed(obj[propName], IMEM))
                    return setState(stateₒ), false;
                text = concat(text, ODOC);
                bitmask += propBit;
            }
            setInState(obj, bitmask);
            ODOC = text;
            return true;
        },
        apply: NOT_A_LAMBDA,
    };
}
function selection(...expressions) {
    const arity = expressions.length;
    return {
        bindings: {},
        parse() {
            for (let i = 0; i < arity; ++i) {
                if (expressions[i].parse())
                    return true;
            }
            return false;
        },
        unparse() {
            for (let i = 0; i < arity; ++i) {
                if (expressions[i].unparse())
                    return true;
            }
            return false;
        },
        apply: NOT_A_LAMBDA,
    };
}
function sequence(...expressions) {
    const arity = expressions.length;
    return {
        bindings: {},
        parse() {
            let stateₒ = getState();
            let node;
            for (let i = 0; i < arity; ++i) {
                if (!expressions[i].parse())
                    return setState(stateₒ), false;
                node = concat(node, ODOC);
            }
            ODOC = node;
            return true;
        },
        unparse() {
            let stateₒ = getState();
            let text;
            for (let i = 0; i < arity; ++i) {
                if (!expressions[i].unparse())
                    return setState(stateₒ), false;
                text = concat(text, ODOC);
            }
            ODOC = text;
            return true;
        },
        apply: NOT_A_LAMBDA,
    };
}
function stringLiteral(value) {
    return {
        bindings: {},
        parse() {
            if (!INUL) {
                if (!isString(IDOC))
                    return false;
                if (!matchesAt(IDOC, value, IMEM))
                    return false;
                IMEM += value.length;
            }
            ODOC = ONUL ? undefined : value;
            return true;
        },
        unparse() {
            if (!INUL) {
                if (!isString(IDOC))
                    return false;
                if (!matchesAt(IDOC, value, IMEM))
                    return false;
                IMEM += value.length;
            }
            ODOC = ONUL ? undefined : value;
            return true;
        },
        apply: NOT_A_LAMBDA,
    };
}
let IDOC;
let IMEM;
let ODOC;
let INUL = false;
let ONUL = false;
function getState() {
    return { IDOC, IMEM, ODOC, INUL, ONUL };
}
function setState(value) {
    ({ IDOC, IMEM, ODOC, INUL, ONUL } = value);
}
function setInState(IDOCᐟ, IMEMᐟ) {
    IDOC = IDOCᐟ;
    IMEM = IMEMᐟ;
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
    if (isPlainObject(a) && isPlainObject(b))
        return Object.assign(Object.assign({}, a), b);
    throw new Error(`Internal error: invalid sequence`);
}
function isFullyConsumed(node, pos) {
    if (typeof node === 'string')
        return pos === node.length;
    if (Array.isArray(node))
        return pos === node.length;
    if (isPlainObject(node)) {
        let keyCount = Object.keys(node).length;
        assert(keyCount <= 32);
        if (keyCount === 0)
            return true;
        return pos === -1 >>> (32 - keyCount);
    }
    return pos === 1;
}
function isPlainObject(value) {
    return value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;
}
function isString(value) {
    return typeof value === 'string';
}
function matchesAt(text, substr, position) {
    let lastPos = position + substr.length;
    if (lastPos > text.length)
        return false;
    for (let i = position, j = 0; i < lastPos; ++i, ++j) {
        if (text.charAt(i) !== substr.charAt(j))
            return false;
    }
    return true;
}
function NOT_A_LAMBDA() { throw new Error('Not a lambda'); }
;
function NOT_A_RULE() { throw new Error('Not a rule'); }
;
const float64 = (() => {
    const PLUS_SIGN = '+'.charCodeAt(0);
    const MINUS_SIGN = '-'.charCodeAt(0);
    const DECIMAL_POINT = '.'.charCodeAt(0);
    const ZERO_DIGIT = '0'.charCodeAt(0);
    const NINE_DIGIT = '9'.charCodeAt(0);
    const LOWERCASE_E = 'e'.charCodeAt(0);
    const UPPERCASE_E = 'E'.charCodeAt(0);
    return {
        bindings: {},
        parse() {
            if (!isString(IDOC))
                return false;
            let stateₒ = getState();
            const LEN = IDOC.length;
            const EOS = 0;
            let digitCount = 0;
            let c = IDOC.charCodeAt(IMEM);
            if (c === PLUS_SIGN || c === MINUS_SIGN) {
                IMEM += 1;
                c = IMEM < LEN ? IDOC.charCodeAt(IMEM) : EOS;
            }
            while (true) {
                if (c < ZERO_DIGIT || c > NINE_DIGIT)
                    break;
                digitCount += 1;
                IMEM += 1;
                c = IMEM < LEN ? IDOC.charCodeAt(IMEM) : EOS;
            }
            if (c === DECIMAL_POINT) {
                IMEM += 1;
                c = IMEM < LEN ? IDOC.charCodeAt(IMEM) : EOS;
            }
            while (true) {
                if (c < ZERO_DIGIT || c > NINE_DIGIT)
                    break;
                digitCount += 1;
                IMEM += 1;
                c = IMEM < LEN ? IDOC.charCodeAt(IMEM) : EOS;
            }
            if (digitCount === 0)
                return setState(stateₒ), false;
            if (c === UPPERCASE_E || c === LOWERCASE_E) {
                IMEM += 1;
                c = IMEM < LEN ? IDOC.charCodeAt(IMEM) : EOS;
                if (c === PLUS_SIGN || c === MINUS_SIGN) {
                    IMEM += 1;
                    c = IMEM < LEN ? IDOC.charCodeAt(IMEM) : EOS;
                }
                digitCount = 0;
                while (true) {
                    if (c < ZERO_DIGIT || c > NINE_DIGIT)
                        break;
                    digitCount += 1;
                    IMEM += 1;
                    c = IMEM < LEN ? IDOC.charCodeAt(IMEM) : EOS;
                }
                if (digitCount === 0)
                    return setState(stateₒ), false;
            }
            let num = Number.parseFloat(IDOC.slice(stateₒ.IMEM, IMEM));
            if (!Number.isFinite(num))
                return setState(stateₒ), false;
            ODOC = num;
            return true;
        },
        unparse() {
            if (typeof IDOC !== 'number' || IMEM !== 0)
                return false;
            ODOC = String(IDOC);
            IMEM = 1;
            return true;
        },
        apply: NOT_A_LAMBDA,
    };
})();
const int32 = (() => {
    let result = {
        bindings: {},
        parse: NOT_A_RULE,
        unparse: NOT_A_RULE,
        apply(expr) {
            var _a, _b, _c, _d, _e, _f;
            let base = (_c = (_b = (_a = expr.bindings.base) === null || _a === void 0 ? void 0 : _a.constant) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : 10;
            let signed = (_f = (_e = (_d = expr.bindings.signed) === null || _d === void 0 ? void 0 : _d.constant) === null || _e === void 0 ? void 0 : _e.value) !== null && _f !== void 0 ? _f : true;
            assert(typeof base === 'number' && base >= 2 && base <= 36);
            assert(typeof signed === 'boolean');
            return {
                bindings: {},
                parse() {
                    if (!isString(IDOC))
                        return false;
                    let stateₒ = getState();
                    let MAX_NUM = signed ? 0x7FFFFFFF : 0xFFFFFFFF;
                    let isNegative = false;
                    if (signed && IMEM < IDOC.length && IDOC.charAt(IMEM) === '-') {
                        isNegative = true;
                        MAX_NUM = 0x80000000;
                        IMEM += 1;
                    }
                    let num = 0;
                    let digits = 0;
                    while (IMEM < IDOC.length) {
                        let c = IDOC.charCodeAt(IMEM);
                        if (c >= 256)
                            break;
                        let digitValue = DIGIT_VALUES[c];
                        if (digitValue >= base)
                            break;
                        num *= base;
                        num += digitValue;
                        if (num > MAX_NUM)
                            return setState(stateₒ), false;
                        IMEM += 1;
                        digits += 1;
                    }
                    if (digits === 0)
                        return setState(stateₒ), false;
                    if (isNegative)
                        num = -num;
                    ODOC = num;
                    return true;
                },
                unparse() {
                    if (typeof IDOC !== 'number' || IMEM !== 0)
                        return false;
                    let num = IDOC;
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
                    let digits = [];
                    while (true) {
                        let d = num % base;
                        num = (num / base) | 0;
                        digits.push(CHAR_CODES[d]);
                        if (num === 0)
                            break;
                    }
                    if (isNegative)
                        digits.push(0x2d);
                    ODOC = String.fromCharCode(...digits.reverse());
                    IMEM = 1;
                    return true;
                },
                apply: NOT_A_LAMBDA,
            };
        },
    };
    result.parse = result.apply({ bindings: {
            base: { constant: { value: 10 } },
            unsigned: { constant: { value: false } },
        } }).parse;
    result.unparse = result.apply({ bindings: {
            base: { constant: { value: 10 } },
            unsigned: { constant: { value: false } },
        } }).unparse;
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
    const CHAR_CODES = [
        0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37,
        0x38, 0x39, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46,
        0x47, 0x48, 0x49, 0x4a, 0x4b, 0x4c, 0x4d, 0x4e,
        0x4f, 0x50, 0x51, 0x52, 0x53, 0x54, 0x55, 0x56,
        0x57, 0x58, 0x59, 0x5a,
    ];
    return result;
})();
const memoise = {
    bindings: {},
    parse: NOT_A_RULE,
    unparse: NOT_A_RULE,
    apply(expr) {
        const parseMemos = new Map();
        const unparseMemos = new Map();
        return {
            bindings: {},
            parse() {
                let stateₒ = getState();
                let memos2 = parseMemos.get(IDOC);
                if (memos2 === undefined) {
                    memos2 = new Map();
                    parseMemos.set(IDOC, memos2);
                }
                let memo = memos2.get(IMEM);
                if (!memo) {
                    memo = { resolved: false, isLeftRecursive: false, result: false, stateᐟ: stateₒ };
                    memos2.set(IMEM, memo);
                    if (expr.parse()) {
                        memo.result = true;
                        memo.stateᐟ = getState();
                    }
                    memo.resolved = true;
                    if (!memo.isLeftRecursive) {
                        setState(memo.stateᐟ);
                        return memo.result;
                    }
                    while (memo.result === true) {
                        setState(stateₒ);
                        if (!expr.parse())
                            break;
                        let state = getState();
                        if (state.IMEM <= memo.stateᐟ.IMEM)
                            break;
                        memo.stateᐟ = state;
                    }
                }
                else if (!memo.resolved) {
                    memo.isLeftRecursive = true;
                    return false;
                }
                setState(memo.stateᐟ);
                return memo.result;
            },
            unparse() {
                let stateₒ = getState();
                let memos2 = unparseMemos.get(IDOC);
                if (memos2 === undefined) {
                    memos2 = new Map();
                    unparseMemos.set(IDOC, memos2);
                }
                let memo = memos2.get(IMEM);
                if (!memo) {
                    memo = { resolved: false, isLeftRecursive: false, result: false, stateᐟ: stateₒ };
                    memos2.set(IMEM, memo);
                    if (expr.unparse()) {
                        memo.result = true;
                        memo.stateᐟ = getState();
                    }
                    memo.resolved = true;
                    if (!memo.isLeftRecursive) {
                        setState(memo.stateᐟ);
                        return memo.result;
                    }
                    while (memo.result === true) {
                        setState(stateₒ);
                        if (!expr.parse())
                            break;
                        let state = getState();
                        if (state.IMEM === memo.stateᐟ.IMEM)
                            break;
                        if (!isFullyConsumed(state.IDOC, state.IMEM))
                            break;
                        memo.stateᐟ = state;
                    }
                }
                else if (!memo.resolved) {
                    memo.isLeftRecursive = true;
                    return false;
                }
                setState(memo.stateᐟ);
                return memo.result;
            },
            apply: NOT_A_LAMBDA,
        };
    },
};
const std = {
    bindings: {
        float64,
        int32,
        memoise,
    },
    parse: NOT_A_RULE,
    unparse: NOT_A_RULE,
    apply: NOT_A_LAMBDA,
};
const anyChar = {
    bindings: {},
    parse() {
        let c = '?';
        if (!INUL) {
            if (!isString(IDOC))
                return false;
            if (IMEM < 0 || IMEM >= IDOC.length)
                return false;
            c = IDOC.charAt(IMEM);
            IMEM += 1;
        }
        ODOC = ONUL ? undefined : c;
        return true;
    },
    unparse() {
        let c = '?';
        if (!INUL) {
            if (!isString(IDOC))
                return false;
            if (IMEM < 0 || IMEM >= IDOC.length)
                return false;
            c = IDOC.charAt(IMEM);
            IMEM += 1;
        }
        ODOC = ONUL ? undefined : c;
        return true;
    },
    apply: NOT_A_LAMBDA,
};
const epsilon = {
    bindings: {},
    parse() {
        ODOC = undefined;
        return true;
    },
    unparse() {
        ODOC = undefined;
        return true;
    },
    apply: NOT_A_LAMBDA,
};
const maybe = {
    bindings: {},
    parse: NOT_A_RULE,
    unparse: NOT_A_RULE,
    apply(expr) {
        return {
            bindings: {},
            parse() {
                return expr.parse() || epsilon.parse();
            },
            unparse() {
                return expr.unparse() || epsilon.unparse();
            },
            apply: NOT_A_LAMBDA,
        };
    },
};
const not = {
    bindings: {},
    parse: NOT_A_RULE,
    unparse: NOT_A_RULE,
    apply(expr) {
        return {
            bindings: {},
            kind: 'rule',
            parse() {
                let stateₒ = getState();
                if (!expr.parse())
                    return epsilon.parse();
                setState(stateₒ);
                return false;
            },
            unparse() {
                let stateₒ = getState();
                if (!expr.unparse())
                    return epsilon.unparse();
                setState(stateₒ);
                return false;
            },
            apply: NOT_A_LAMBDA,
        };
    },
};
const unicode = {
    bindings: {},
    parse: NOT_A_RULE,
    unparse: NOT_A_RULE,
    apply(expr) {
        var _a, _b, _c, _d, _e, _f;
        let base = (_b = (_a = expr.bindings.base) === null || _a === void 0 ? void 0 : _a.constant) === null || _b === void 0 ? void 0 : _b.value;
        let minDigits = (_d = (_c = expr.bindings.minDigits) === null || _c === void 0 ? void 0 : _c.constant) === null || _d === void 0 ? void 0 : _d.value;
        let maxDigits = (_f = (_e = expr.bindings.maxDigits) === null || _e === void 0 ? void 0 : _e.constant) === null || _f === void 0 ? void 0 : _f.value;
        assert(typeof base === 'number' && base >= 2 && base <= 36);
        assert(typeof minDigits === 'number' && minDigits >= 1 && minDigits <= 8);
        assert(typeof maxDigits === 'number' && maxDigits >= minDigits && maxDigits <= 8);
        let pattern = `[0-${base < 10 ? base - 1 : 9}${base > 10 ? `a-${String.fromCharCode('a'.charCodeAt(0) + base - 11)}` : ''}]`;
        let regex = RegExp(pattern, 'i');
        return {
            bindings: {},
            parse() {
                if (!isString(IDOC))
                    return false;
                let stateₒ = getState();
                const LEN = IDOC.length;
                const EOS = '';
                let len = 0;
                let num = '';
                let c = IMEM < LEN ? IDOC.charAt(IMEM) : EOS;
                while (true) {
                    if (!regex.test(c))
                        break;
                    num += c;
                    IMEM += 1;
                    len += 1;
                    if (len === maxDigits)
                        break;
                    c = IMEM < LEN ? IDOC.charAt(IMEM) : EOS;
                }
                if (len < minDigits)
                    return setState(stateₒ), false;
                ODOC = eval(`"\\u{${num}}"`);
                return true;
            },
            unparse: () => {
                return false;
            },
            apply: NOT_A_LAMBDA,
        };
    },
};
const zeroOrMore = {
    bindings: {},
    parse: NOT_A_RULE,
    unparse: NOT_A_RULE,
    apply(expr) {
        return {
            bindings: {},
            parse() {
                let stateₒ = getState();
                let node;
                while (true) {
                    if (!expr.parse())
                        break;
                    if (IMEM === stateₒ.IMEM)
                        break;
                    node = concat(node, ODOC);
                }
                ODOC = node;
                return true;
            },
            unparse() {
                let stateₒ = getState();
                let text;
                while (true) {
                    if (!expr.unparse())
                        break;
                    if (IMEM === stateₒ.IMEM)
                        break;
                    assert(typeof ODOC === 'string');
                    text = concat(text, ODOC);
                }
                ODOC = text;
                return true;
            },
            apply: NOT_A_LAMBDA,
        };
    },
};
const experiments = {
    bindings: {
        anyChar,
        epsilon,
        maybe,
        not,
        unicode,
        zeroOrMore,
    },
    parse: NOT_A_RULE,
    unparse: NOT_A_RULE,
    apply: NOT_A_LAMBDA,
};

const 𝕊8 = {
    bindings: {
        memoise: {},
        float64: {},
        int32: {},
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

const 𝕊9 = {
    bindings: {
        base: {},
        signed: {},
    },
};

const 𝕊10 = {
    bindings: {
        base: {},
        signed: {},
    },
};

const 𝕊11 = {
    bindings: {
        signed: {},
    },
};

// -------------------- aliases --------------------
𝕊8.bindings.memoise = std.bindings.memoise;
𝕊8.bindings.float64 = std.bindings.float64;
𝕊8.bindings.int32 = std.bindings.int32;
𝕊8.bindings.not = experiments.bindings.not;
𝕊8.bindings.start = 𝕊8.bindings.expr;

// -------------------- compile-time constants --------------------
𝕊9.bindings.base.constant = {value: 16};
𝕊9.bindings.signed.constant = {value: false};
𝕊10.bindings.base.constant = {value: 2};
𝕊10.bindings.signed.constant = {value: false};
𝕊11.bindings.signed.constant = {value: false};

// -------------------- V:\projects\oss\pen-monorepo\packages\test-suite\fixtures\penc-input\math.pen --------------------

Object.assign(
    𝕊8.bindings.expr,
    apply(
        𝕊8.bindings.memoise,
        selection(
            𝕊8.bindings.add,
            𝕊8.bindings.sub,
            𝕊8.bindings.term
        )
    )
);

Object.assign(
    𝕊8.bindings.add,
    record([
        {
            name: 'type',
            value: abstract(stringLiteral("add")),
        },
        {
            name: 'lhs',
            value: 𝕊8.bindings.expr,
        },
        {
            name: 'rhs',
            value: sequence(
                concrete(stringLiteral("+")),
                𝕊8.bindings.term
            ),
        },
    ])
);

Object.assign(
    𝕊8.bindings.sub,
    record([
        {
            name: 'type',
            value: abstract(stringLiteral("sub")),
        },
        {
            name: 'lhs',
            value: 𝕊8.bindings.expr,
        },
        {
            name: 'rhs',
            value: sequence(
                concrete(stringLiteral("-")),
                𝕊8.bindings.term
            ),
        },
    ])
);

Object.assign(
    𝕊8.bindings.term,
    apply(
        𝕊8.bindings.memoise,
        selection(
            𝕊8.bindings.mul,
            𝕊8.bindings.div,
            𝕊8.bindings.factor
        )
    )
);

Object.assign(
    𝕊8.bindings.mul,
    sequence(
        field(
            abstract(stringLiteral("type")),
            abstract(stringLiteral("mul"))
        ),
        record([
            {
                name: 'lhs',
                value: 𝕊8.bindings.term,
            },
        ]),
        field(
            abstract(stringLiteral("rhs")),
            sequence(
                concrete(stringLiteral("*")),
                𝕊8.bindings.factor
            )
        )
    )
);

Object.assign(
    𝕊8.bindings.div,
    record([
        {
            name: 'type',
            value: abstract(stringLiteral("div")),
        },
        {
            name: 'lhs',
            value: 𝕊8.bindings.term,
        },
        {
            name: 'rhs',
            value: sequence(
                concrete(stringLiteral("/")),
                𝕊8.bindings.factor
            ),
        },
    ])
);

Object.assign(
    𝕊8.bindings.factor,
    selection(
        sequence(
            apply(
                𝕊8.bindings.not,
                selection(
                    stringLiteral("0x"),
                    stringLiteral("0b")
                )
            ),
            𝕊8.bindings.float64
        ),
        sequence(
            concrete(stringLiteral("0x")),
            apply(
                𝕊8.bindings.int32,
                𝕊9
            )
        ),
        sequence(
            concrete(stringLiteral("0b")),
            apply(
                𝕊8.bindings.int32,
                𝕊10
            )
        ),
        sequence(
            concrete(stringLiteral("i")),
            apply(
                𝕊8.bindings.int32,
                𝕊11
            )
        ),
        sequence(
            concrete(stringLiteral("(")),
            𝕊8.bindings.expr,
            concrete(stringLiteral(")"))
        )
    )
);

Object.assign(
    𝕊9.bindings.base,
    numericLiteral(16)
);

Object.assign(
    𝕊9.bindings.signed,
    booleanLiteral(false)
);

Object.assign(
    𝕊10.bindings.base,
    numericLiteral(2)
);

Object.assign(
    𝕊10.bindings.signed,
    booleanLiteral(false)
);

Object.assign(
    𝕊11.bindings.signed,
    booleanLiteral(false)
);

// -------------------- MAIN EXPORTS --------------------

module.exports = createMainExports(𝕊8.bindings.start);