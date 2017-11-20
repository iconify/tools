"use strict";

(() => {
    const SVG = require('../../src/svg'),
        Importer = require('../../src/import/svg');

    const fs = require('fs'),
        chai = require('chai'),
        expect = chai.expect,
        should = chai.should();

    describe('Testing importing svg files', () => {
        it('importing fci-biomass.svg', done => {
            const content = fs.readFileSync('tests/files/fci-biomass.svg', 'utf8').trim();

            Importer('tests/files/fci-biomass.svg').then(svg => {
                expect(svg instanceof SVG).to.be.equal(true);
                expect(svg.toString()).to.be.equal(content.replace(' enable-background="new 0 0 48 48"', ' width="48" height="48"'));
                done();
            }).catch(err => {
                done(err ? err : 'exception');
            });
        });

        it('importing file that does not exist', done => {
            Importer('tests/files/foo.svg').then(svg => {
                done('Expected error');
            }).catch(err => {
                done();
            });
        });
    });
})();
