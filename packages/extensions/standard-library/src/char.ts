// TODO: doc... has both 'txt' and 'ast' representation
// TODO: supports only single UTF-16 code units, ie basic multilingual plane. Extend to full unicode support somehow...
// TODO: optimise 'any char' case better
// TODO: optimise all cases better
function char(options: StaticOptions): PenVal {
    const checkInType = options.inForm !== 'txt';
    return {
        lambda(expr) {
            let min = expr.bindings?.min?.constant?.value as string | undefined ?? '\u0000';
            let max = expr.bindings?.max?.constant?.value as string | undefined ?? '\uFFFF';
            assert(typeof min === 'string' && min.length === 1);
            assert(typeof max === 'string' && max.length === 1);
            let checkRange = min !== '\u0000' || max !== '\uFFFF';

            if (options.inForm === 'nil') {
                const out = options.outForm === 'nil' ? undefined : min;
                return {rule: function CHA() { return OUT = out, true; }};
            }

            return {
                rule: function CHA() {
                    if (checkInType && typeof IN !== 'string') return false;
                    if (IP < 0 || IP >= (IN as string).length) return false;
                    let c = (IN as string).charAt(IP);
                    if (checkRange && (c < min || c > max)) return false;
                    IP += 1;
                    OUT = options.outForm === 'nil' ? undefined : c;
                    return true;
                },
            };
        },
    };
}