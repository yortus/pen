// TODO: doc... this rule is representation-agnostic
function sequence(options: StaticOptions & {expressions: PenVal[]}): PenVal {
    const {expressions} = options;
    const arity = expressions.length;
    return {
        rule: function SEQ() {
            let stateₒ = getState();
            let sb = new SequenceBuilder();
            for (let i = 0; i < arity; ++i) {
                if (!expressions[i].rule!()) return setState(stateₒ), false;
                sb.push(OUT);
            }
            OUT = sb.result;
            return true;
        },
    };
}
