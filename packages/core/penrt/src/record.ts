// TODO: doc... has only 'ast' representation

function parseRecord(recordItems: RecordItem[]) {
    return function RCD() {
        const [APOSₒ, CPOSₒ] = savepoint();
        if (APOS === 0) AREP = [];
        const fieldNames: string[] = [];
        for (const recordItem of recordItems) {
            if (recordItem.kind === 'Field') {
                // Parse field name
                let fieldName: string;
                if (typeof recordItem.name === 'string') {
                    // Statically-named field
                    fieldName = recordItem.name;
                }
                else {
                    // Dynamically-named field
                    if (!parseInner(recordItem.name, true)) return backtrack(APOSₒ, CPOSₒ);
                    assert(ATYP === STRING);
                    APOS -= 1;
                    fieldName = AREP[APOS] as string;
                }
                if (fieldNames.includes(fieldName)) return backtrack(APOSₒ, CPOSₒ);

                // Parse field value
                if (!parseInner(recordItem.expr, true)) return backtrack(APOSₒ, CPOSₒ);

                const fieldValue = AREP[--APOS];
                AREP[APOS++] = fieldName;
                AREP[APOS++] = fieldValue;
                fieldNames.push(fieldName); // keep track of field names to support duplicate detection
            }
            else /* item.kind === 'Splice' */ {
                const apos = APOS;
                if (!recordItem.expr()) return backtrack(APOSₒ, CPOSₒ);
                for (let i = apos; i < APOS; i += 2) {
                    const fieldName = AREP[i] as string;
                    if (fieldNames.includes(fieldName)) return backtrack(APOSₒ, CPOSₒ);
                    fieldNames.push(fieldName);
                }
            }
        }
        ATYP = RECORD;
        return true;
    };
}

function printRecord(recordItems: RecordItem[]) {
    return function RCD() {
        if (ATYP !== RECORD) return false;
        const [APOSₒ, CPOSₒ] = savepoint(), ATYPₒ = ATYP;
        const propList = AREP;
        const propCount = AREP.length;
        let bitmask = APOS;

        // TODO: O(n^2)? Can we do better? More fast paths for common cases?
        outerLoop:
        for (const recordItem of recordItems) {
            if (recordItem.kind === 'Field') {
                // Find the first property key/value pair that matches this field name/value pair (if any)
                for (let i = 0; i < propCount; ++i) {
                    let propName = propList[i << 1];

                    // TODO: skip already-consumed key/value pairs
                    // tslint:disable-next-line: no-bitwise
                    const propBit = 1 << i;
                    // tslint:disable-next-line: no-bitwise
                    if ((bitmask & propBit) !== 0) continue;

                    // TODO: match field name
                    if (typeof recordItem.name !== 'string') {
                        // Dynamically-named field
                        APOS = i << 1;
                        if (!printInner(recordItem.name, true)) continue;
                    }
                    else {
                        // Statically-named field
                        if (propName !== recordItem.name) continue;
                    }

                    // TODO: match field value
                    APOS = (i << 1) + 1;
                    if (!printInner(recordItem.expr, true)) continue;
            
                    // TODO: we matched both name and value - consume them from AREP
                    bitmask += propBit;
                    continue outerLoop;
                }

                // If we get here, no match... Ensure AREP is restored, since it may have been changed above.
                return backtrack(APOSₒ, CPOSₒ, ATYPₒ);
            }
            else /* item.kind === 'Splice' */ {
                APOS = bitmask;
                ATYP = RECORD;
                if (!recordItem.expr()) return backtrack(APOSₒ, CPOSₒ, ATYPₒ);
                bitmask = APOS;
            }
        }
        APOS = bitmask;
        return true;
    }
}

type RecordItem =
    | {kind: 'Field', name: string | Rule, expr: Rule}
    | {kind: 'Splice', expr: Rule}
;
