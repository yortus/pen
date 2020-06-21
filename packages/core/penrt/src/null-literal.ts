// TODO: doc... has only 'ast' representation
function nullLiteral({mode}: StaticOptions): Rule {
    const out = isParse(mode) && hasAbstractForm(mode) ? null : undefined;

    if (isParse(mode)) {
        return function NUL() { return OUT = out, true; };
    }

    return function NUL() {
        if (IN !== null || IP !== 0) return false;
        IP = 1;
        OUT = out;
        return true;
    };
}
