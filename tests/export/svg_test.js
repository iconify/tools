"use strict";

(() => {
    const SVG = require('../../src/svg'),
        Exporter = require('../../src/export/svg');

    const fs = require('fs'),
        chai = require('chai'),
        expect = chai.expect,
        should = chai.should();

    describe('Testing exporting svg files', () => {
        const content = fs.readFileSync('tests/files/fi-bold.svg', 'utf8');

        try {
            fs.mkdirSync('tests/temp', 0o775);
        } catch (err) {

        }

        it('exporting file', done => {
            const filename = 'tests/temp/export.svg';

            try {
                fs.unlinkSync(filename);
            } catch(err) {
            }

            let svg = new SVG(content);

            Exporter(svg, filename).then(() => {
                let data = fs.readFileSync(filename, 'utf8');
                fs.unlinkSync(filename);

                expect(data).to.be.equal(content
                    .slice(content.indexOf('<svg'))
                    .replace(/"\s+\/>/, '"/>')
                    .replace(/"\s+width/, '" width')
                    .replace(' enable-background="new 0 0 100 100" xml:space="preserve"', '')
                    .trim());
                done();
            }).catch(err => {
                done(err);
            });
        });

        it('exporting file with error', done => {
            const filename = 'tests/temp/foo/export.svg';

            let svg = new SVG(content);

            Exporter(svg, filename).then(() => {
                done('Export should have returned error!');
            }).catch(err => {
                done();
            });
        });

        it('exporting file with suppressed error', done => {
            const filename = 'tests/temp/foo/export.svg';

            let svg = new SVG(content);

            Exporter(svg, filename, {reject: false}).then(() => {
                done();
            }).catch(err => {
                done(err);
            });
        });
    });
})();
