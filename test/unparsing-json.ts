import {expect} from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as pen from 'penc';




describe('Unparsing JSON', () => {

    // Compile the JSON grammar.
    let jsonGrammar = fs.readFileSync(path.join(__dirname, './fixtures/json.pen'), 'utf8');
    let {unparse} = pen.evaluate(jsonGrammar);

    // List the test cases with their expected results.
    let tests = [
        `{} ==> {}`,
        `{a: 1} ==> {a:1}`,
        `{a: 1, b: 2} ==> {a:1,b:2}`,
        `{a: 1, b: 2, c: 3} ==> {a:1,b:2,c:3}`,
        `{a: 1, b: 2, c: 3, d: 4} ==> {a:1,b:2,c:3,d:4}`,
    ];

    // Execute each test case.
    tests.forEach(test => {
        it(test, () => {
            let [astStr, expectedText] = test.split(' ==> ');
            // tslint:disable-next-line:no-eval
            let ast = eval(`(${astStr})`);
            let actualText = 'ERROR';
            try { actualText = unparse(ast); } catch {/**/}
            expect(actualText).to.deep.equal(expectedText);
        });
    });
});
