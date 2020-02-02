import {expect} from 'chai';
import * as path from 'path';
import {compile, CompilerOptions} from '..';


describe('compile', () => {
    it('passes', () => {
        let fixture = ['import-graph', 'math', 'json'][1];
        let main = path.join(__dirname, `../../test/fixtures/${fixture}`);
        let outDir = path.join(__dirname, `../../dist/out/${fixture}`);
        let options: CompilerOptions = {main, outDir};
        let result = compile(options);
        expect(result).to.be.a('string');
        // TODO: was... expect(result).to.include({kind: 'Program'});
    });
});