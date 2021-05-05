// ------------------------------ Main exports ------------------------------
module.exports = {
    parse(text) {
        setState({ IN: text, IP: 0 });
        HAS_IN = HAS_OUT = true;
        if (!parse()) throw new Error('parse failed');
        if (!isInputFullyConsumed()) throw new Error('parse didn\'t consume entire input');
        return OUT;
    },
    print(node) {
        setState({ IN: node, IP: 0 });
        HAS_IN = HAS_OUT = true;
        if (!print()) throw new Error('print failed');
        if (!isInputFullyConsumed()) throw new Error('print didn\'t consume entire input');
        OUT = OUT || '';
        return OUT;
    },
};




// ------------------------------ Runtime ------------------------------
"use strict";
function parseList(listItems) {
    const itemCount = listItems.length;
    return function LST() {
        const stateₒ = getState();
        const arr = [];
        for (let i = 0; i < itemCount; ++i) {
            const listItem = listItems[i];
            if (listItem.kind === 'Element') {
                if (!listItem.expr())
                    return setState(stateₒ), false;
                assert(OUT !== undefined);
                arr.push(OUT);
            }
            else {
                if (!listItem.expr())
                    return setState(stateₒ), false;
                assert(Array.isArray(OUT));
                arr.push(...OUT);
            }
        }
        OUT = arr;
        return true;
    };
}
function printList(listItems) {
    const itemCount = listItems.length;
    return function LST() {
        if (!Array.isArray(IN))
            return false;
        const stateₒ = getState();
        let text;
        const arr = IN;
        let off = IP;
        for (let i = 0; i < itemCount; ++i) {
            const listItem = listItems[i];
            if (listItem.kind === 'Element') {
                setState({ IN: arr[off], IP: 0 });
                if (!listItem.expr())
                    return setState(stateₒ), false;
                if (!isInputFullyConsumed())
                    return setState(stateₒ), false;
                text = concat(text, OUT);
                off += 1;
            }
            else {
                setState({ IN: arr, IP: off });
                if (!listItem.expr())
                    return setState(stateₒ), false;
                text = concat(text, OUT);
                off = IP;
            }
        }
        setState({ IN: arr, IP: off });
        OUT = text;
        return true;
    };
}
function parseRecord(recordItems) {
    return function RCD() {
        const stateₒ = getState();
        const obj = {};
        const propNames = [];
        for (const recordItem of recordItems) {
            if (recordItem.kind === 'Field') {
                let propName;
                if (typeof recordItem.name === 'string') {
                    propName = recordItem.name;
                }
                else {
                    if (!recordItem.name())
                        return setState(stateₒ), false;
                    assert(typeof OUT === 'string');
                    propName = OUT;
                }
                if (propNames.includes(propName))
                    return setState(stateₒ), false;
                if (!recordItem.expr())
                    return setState(stateₒ), false;
                assert(OUT !== undefined);
                obj[propName] = OUT;
                propNames.push(propName);
            }
            else {
                if (!recordItem.expr())
                    return setState(stateₒ), false;
                assert(OUT && typeof OUT === 'object');
                for (const propName of Object.keys(OUT)) {
                    if (propNames.includes(propName))
                        return setState(stateₒ), false;
                    obj[propName] = OUT[propName];
                    propNames.push(propName);
                }
            }
        }
        OUT = obj;
        return true;
    };
}
function printRecord(recordItems) {
    return function RCD() {
        if (objectToString.call(IN) !== '[object Object]')
            return false;
        const stateₒ = getState();
        let text;
        const propNames = Object.keys(IN);
        const propCount = propNames.length;
        assert(propCount <= 32);
        const obj = IN;
        let bitmask = IP;
        outerLoop: for (const recordItem of recordItems) {
            if (recordItem.kind === 'Field') {
                for (let i = 0; i < propCount; ++i) {
                    let propName = propNames[i];
                    const propBit = 1 << i;
                    if ((bitmask & propBit) !== 0)
                        continue;
                    if (typeof recordItem.name !== 'string') {
                        setState({ IN: propName, IP: 0 });
                        if (!recordItem.name())
                            continue;
                        if (IP !== propName.length)
                            continue;
                        text = concat(text, OUT);
                    }
                    else {
                        if (propName !== recordItem.name)
                            continue;
                    }
                    setState({ IN: obj[propName], IP: 0 });
                    if (!recordItem.expr())
                        continue;
                    if (!isInputFullyConsumed())
                        continue;
                    text = concat(text, OUT);
                    bitmask += propBit;
                    continue outerLoop;
                }
                setState(stateₒ);
                return false;
            }
            else {
                setState({ IN: obj, IP: bitmask });
                if (!recordItem.expr())
                    return setState(stateₒ), false;
                text = concat(text, OUT);
                bitmask = IP;
            }
        }
        setState({ IN: obj, IP: bitmask });
        OUT = text;
        return true;
    };
}
function isRule(_x) {
    return true;
}
function isGeneric(_x) {
    return true;
}
function isModule(_x) {
    return true;
}
let IN;
let IP;
let OUT;
let HAS_IN;
let HAS_OUT;
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
    if (typeof a !== 'string' || typeof b !== 'string')
        throw new Error(`Internal error: invalid sequence`);
    return a + b;
}
function isInputFullyConsumed() {
    const type = objectToString.call(IN);
    if (type === '[object String]')
        return IP === IN.length;
    if (type === '[object Array]')
        return IP === IN.length;
    if (type === '[object Object]') {
        const keyCount = Object.keys(IN).length;
        assert(keyCount <= 32);
        if (keyCount === 0)
            return true;
        return IP === -1 >>> (32 - keyCount);
    }
    return IP === 1;
}
const objectToString = Object.prototype.toString;




// ------------------------------ Extensions ------------------------------
const extensions = {
};




// ------------------------------ PARSE ------------------------------
const parse = (() => {

    // StringUniversal
    function x() {
        if (HAS_IN) {
            if (IP + 7 > IN.length) return false;
            if (IN.charCodeAt(IP + 0) !== 111) return false;
            if (IN.charCodeAt(IP + 1) !== 117) return false;
            if (IN.charCodeAt(IP + 2) !== 116) return false;
            if (IN.charCodeAt(IP + 3) !== 101) return false;
            if (IN.charCodeAt(IP + 4) !== 114) return false;
            if (IN.charCodeAt(IP + 5) !== 32) return false;
            if (IN.charCodeAt(IP + 6) !== 120) return false;
            IP += 7;
        }
        OUT = HAS_OUT ? "outer x" : undefined;
        return true;
    }
    x.constant = {value: "outer x"};

    // GenericExpression
    function REP(ℙ1) {

        // MemberExpression
        function a(arg) {
            return ℙ1("a")(arg);
        }

        // SequenceExpression
        function 𝕊1() {
            const stateₒ = getState();
            let out;
            if (a()) out = concat(out, OUT); else return setState(stateₒ), false;
            if (x_3()) out = concat(out, OUT); else return setState(stateₒ), false;
            if (a()) out = concat(out, OUT); else return setState(stateₒ), false;
            OUT = out;
            return true;
        }

        return 𝕊1;
    }

    // GenericExpression
    function GEN(ℙ2) {

        // GenericParameter
        function x_2(arg) {
            return ℙ2(arg);
        }

        // SequenceExpression
        function 𝕊2() {
            const stateₒ = getState();
            let out;
            if (x_2()) out = concat(out, OUT); else return setState(stateₒ), false;
            if (x_2()) out = concat(out, OUT); else return setState(stateₒ), false;
            OUT = out;
            return true;
        }

        return 𝕊2;
    }

    // StringUniversal
    function x_3() {
        if (HAS_IN) {
            if (IP + 7 > IN.length) return false;
            if (IN.charCodeAt(IP + 0) !== 105) return false;
            if (IN.charCodeAt(IP + 1) !== 110) return false;
            if (IN.charCodeAt(IP + 2) !== 110) return false;
            if (IN.charCodeAt(IP + 3) !== 101) return false;
            if (IN.charCodeAt(IP + 4) !== 114) return false;
            if (IN.charCodeAt(IP + 5) !== 32) return false;
            if (IN.charCodeAt(IP + 6) !== 120) return false;
            IP += 7;
        }
        OUT = HAS_OUT ? "inner x" : undefined;
        return true;
    }
    x_3.constant = {value: "inner x"};

    // NumericLiteral
    function a_2() {
        OUT = HAS_OUT ? 42 : undefined;
        return true;
    }
    a_2.constant = {value: 42};

    // Module
    function nested(member) {
        switch (member) {
            case 'REP': return REP;
            case 'GEN': return GEN;
            case 'x': return x_3;
            case 'a': return a_2;
            default: return undefined;
        }
    }

    // StringUniversal
    function lx() {
        if (HAS_IN) {
            if (IP + 7 > IN.length) return false;
            if (IN.charCodeAt(IP + 0) !== 105) return false;
            if (IN.charCodeAt(IP + 1) !== 110) return false;
            if (IN.charCodeAt(IP + 2) !== 110) return false;
            if (IN.charCodeAt(IP + 3) !== 101) return false;
            if (IN.charCodeAt(IP + 4) !== 114) return false;
            if (IN.charCodeAt(IP + 5) !== 32) return false;
            if (IN.charCodeAt(IP + 6) !== 120) return false;
            IP += 7;
        }
        OUT = HAS_OUT ? "inner x" : undefined;
        return true;
    }
    lx.constant = {value: "inner x"};

    // StringUniversal
    function ly() {
        if (HAS_IN) {
            if (IP + 3 > IN.length) return false;
            if (IN.charCodeAt(IP + 0) !== 42) return false;
            if (IN.charCodeAt(IP + 1) !== 42) return false;
            if (IN.charCodeAt(IP + 2) !== 42) return false;
            IP += 3;
        }
        OUT = HAS_OUT ? "***" : undefined;
        return true;
    }
    ly.constant = {value: "***"};

    // SequenceExpression
    function letexpr() {
        const stateₒ = getState();
        let out;
        if (lx()) out = concat(out, OUT); else return setState(stateₒ), false;
        if (letexpr_sub1()) out = concat(out, OUT); else return setState(stateₒ), false;
        if (lx()) out = concat(out, OUT); else return setState(stateₒ), false;
        OUT = out;
        return true;
    }

    // StringUniversal
    function letexpr_sub1() {
        if (HAS_IN) {
            if (IP + 1 > IN.length) return false;
            if (IN.charCodeAt(IP + 0) !== 45) return false;
            IP += 1;
        }
        OUT = HAS_OUT ? "-" : undefined;
        return true;
    }
    letexpr_sub1.constant = {value: "-"};

    // Identifier
    function a_3(arg) {
        return x(arg);
    }

    // SelectionExpression
    function start_2() {
        if (start_2_sub1()) return true;
        if (letexpr()) return true;
        return false;
    }

    // InstantiationExpression
    let start_2_sub1ₘ;
    function start_2_sub1(arg) {
        try {
            return start_2_sub1ₘ(arg);
        }
        catch (err) {
            if (!(err instanceof TypeError) || !err.message.includes('start_2_sub1ₘ is not a function')) throw err;
            start_2_sub1ₘ = REP(start_2_sub2);
            return start_2_sub1ₘ(arg);
        }
    }

    // Module
    function start_2_sub2(member) {
        switch (member) {
            case 'a': return a_3;
            default: return undefined;
        }
    }

    // Module
    function Ɱ_compile_test(member) {
        switch (member) {
            case 'x': return x;
            case 'nested': return nested;
            case 'letexpr': return letexpr;
            case 'start': return start_2;
            default: return undefined;
        }
    }

    return start_2;
})();




// ------------------------------ PRINT ------------------------------
const print = (() => {

    // StringUniversal
    function x() {
        if (HAS_IN) {
            if (typeof IN !== 'string') return false;
            if (IP + 7 > IN.length) return false;
            if (IN.charCodeAt(IP + 0) !== 111) return false;
            if (IN.charCodeAt(IP + 1) !== 117) return false;
            if (IN.charCodeAt(IP + 2) !== 116) return false;
            if (IN.charCodeAt(IP + 3) !== 101) return false;
            if (IN.charCodeAt(IP + 4) !== 114) return false;
            if (IN.charCodeAt(IP + 5) !== 32) return false;
            if (IN.charCodeAt(IP + 6) !== 120) return false;
            IP += 7;
        }
        OUT = HAS_OUT ? "outer x" : undefined;
        return true;
    }
    x.constant = {value: "outer x"};

    // GenericExpression
    function REP(ℙ1) {

        // MemberExpression
        function a(arg) {
            return ℙ1("a")(arg);
        }

        // SequenceExpression
        function 𝕊1() {
            const stateₒ = getState();
            let out;
            if (a()) out = concat(out, OUT); else return setState(stateₒ), false;
            if (x_3()) out = concat(out, OUT); else return setState(stateₒ), false;
            if (a()) out = concat(out, OUT); else return setState(stateₒ), false;
            OUT = out;
            return true;
        }

        return 𝕊1;
    }

    // GenericExpression
    function GEN(ℙ2) {

        // GenericParameter
        function x_2(arg) {
            return ℙ2(arg);
        }

        // SequenceExpression
        function 𝕊2() {
            const stateₒ = getState();
            let out;
            if (x_2()) out = concat(out, OUT); else return setState(stateₒ), false;
            if (x_2()) out = concat(out, OUT); else return setState(stateₒ), false;
            OUT = out;
            return true;
        }

        return 𝕊2;
    }

    // StringUniversal
    function x_3() {
        if (HAS_IN) {
            if (typeof IN !== 'string') return false;
            if (IP + 7 > IN.length) return false;
            if (IN.charCodeAt(IP + 0) !== 105) return false;
            if (IN.charCodeAt(IP + 1) !== 110) return false;
            if (IN.charCodeAt(IP + 2) !== 110) return false;
            if (IN.charCodeAt(IP + 3) !== 101) return false;
            if (IN.charCodeAt(IP + 4) !== 114) return false;
            if (IN.charCodeAt(IP + 5) !== 32) return false;
            if (IN.charCodeAt(IP + 6) !== 120) return false;
            IP += 7;
        }
        OUT = HAS_OUT ? "inner x" : undefined;
        return true;
    }
    x_3.constant = {value: "inner x"};

    // NumericLiteral
    function a_2() {
        if (HAS_IN) {
            if (IN !== 42 || IP !== 0) return false;
            IP += 1;
        }
        OUT = HAS_OUT ? undefined : undefined;
        return true;
    }
    a_2.constant = {value: 42};

    // Module
    function nested(member) {
        switch (member) {
            case 'REP': return REP;
            case 'GEN': return GEN;
            case 'x': return x_3;
            case 'a': return a_2;
            default: return undefined;
        }
    }

    // StringUniversal
    function lx() {
        if (HAS_IN) {
            if (typeof IN !== 'string') return false;
            if (IP + 7 > IN.length) return false;
            if (IN.charCodeAt(IP + 0) !== 105) return false;
            if (IN.charCodeAt(IP + 1) !== 110) return false;
            if (IN.charCodeAt(IP + 2) !== 110) return false;
            if (IN.charCodeAt(IP + 3) !== 101) return false;
            if (IN.charCodeAt(IP + 4) !== 114) return false;
            if (IN.charCodeAt(IP + 5) !== 32) return false;
            if (IN.charCodeAt(IP + 6) !== 120) return false;
            IP += 7;
        }
        OUT = HAS_OUT ? "inner x" : undefined;
        return true;
    }
    lx.constant = {value: "inner x"};

    // StringUniversal
    function ly() {
        if (HAS_IN) {
            if (typeof IN !== 'string') return false;
            if (IP + 3 > IN.length) return false;
            if (IN.charCodeAt(IP + 0) !== 42) return false;
            if (IN.charCodeAt(IP + 1) !== 42) return false;
            if (IN.charCodeAt(IP + 2) !== 42) return false;
            IP += 3;
        }
        OUT = HAS_OUT ? "***" : undefined;
        return true;
    }
    ly.constant = {value: "***"};

    // SequenceExpression
    function letexpr() {
        const stateₒ = getState();
        let out;
        if (lx()) out = concat(out, OUT); else return setState(stateₒ), false;
        if (letexpr_sub1()) out = concat(out, OUT); else return setState(stateₒ), false;
        if (lx()) out = concat(out, OUT); else return setState(stateₒ), false;
        OUT = out;
        return true;
    }

    // StringUniversal
    function letexpr_sub1() {
        if (HAS_IN) {
            if (typeof IN !== 'string') return false;
            if (IP + 1 > IN.length) return false;
            if (IN.charCodeAt(IP + 0) !== 45) return false;
            IP += 1;
        }
        OUT = HAS_OUT ? "-" : undefined;
        return true;
    }
    letexpr_sub1.constant = {value: "-"};

    // Identifier
    function a_3(arg) {
        return x(arg);
    }

    // SelectionExpression
    function start_2() {
        if (start_2_sub1()) return true;
        if (letexpr()) return true;
        return false;
    }

    // InstantiationExpression
    let start_2_sub1ₘ;
    function start_2_sub1(arg) {
        try {
            return start_2_sub1ₘ(arg);
        }
        catch (err) {
            if (!(err instanceof TypeError) || !err.message.includes('start_2_sub1ₘ is not a function')) throw err;
            start_2_sub1ₘ = REP(start_2_sub2);
            return start_2_sub1ₘ(arg);
        }
    }

    // Module
    function start_2_sub2(member) {
        switch (member) {
            case 'a': return a_3;
            default: return undefined;
        }
    }

    // Module
    function Ɱ_compile_test(member) {
        switch (member) {
            case 'x': return x;
            case 'nested': return nested;
            case 'letexpr': return letexpr;
            case 'start': return start_2;
            default: return undefined;
        }
    }

    return start_2;
})();
