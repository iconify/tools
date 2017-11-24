"use strict";

(() => {
    const Collection = require('../../src/collection'),
        Importer = require('../../src/import/font');

    const fs = require('fs'),
        chai = require('chai'),
        expect = chai.expect,
        should = chai.should();

    describe('Testing importing svg font', () => {
        it('importing fontawesome', done => {
            const content = fs.readFileSync('tests/files/fa.svg', 'utf8');

            Importer('tests/files/fa.svg', {
                prefix: 'fa',
                fontChanges: {
                    // Adjustments for web font configuration
                    height: 1792,
                    bottom: value => Math.round(value / 16) * 16,
                    left: value => Math.round(value / 16) * 16,
                    width: value => Math.round(value / 16) * 16
                },
                ignoreCharacters: ['f036']
            }).then(items => {
                expect(items instanceof Collection).to.be.equal(true);
                expect(items.prefix).to.be.equal('fa');

                let keys = items.keys();
                expect(keys.includes('f000')).to.be.equal(true);
                expect(keys.includes('f037')).to.be.equal(true);
                expect(keys.includes('f036')).to.be.equal(false);

                expect(items.items['f03a'].toString()).to.be.equal('<svg width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">\n\t<g transform="translate(0 1536)">\n\t\t<g transform="scale(1 -1)">\n\t\t\t<path d="M256 224v-192q0 -13 -9.5 -22.5t-22.5 -9.5h-192q-13 0 -22.5 9.5t-9.5 22.5v192q0 13 9.5 22.5t22.5 9.5h192q13 0 22.5 -9.5t9.5 -22.5zM256 608v-192q0 -13 -9.5 -22.5t-22.5 -9.5h-192q-13 0 -22.5 9.5t-9.5 22.5v192q0 13 9.5 22.5t22.5 9.5h192q13 0 22.5 -9.5\nt9.5 -22.5zM256 992v-192q0 -13 -9.5 -22.5t-22.5 -9.5h-192q-13 0 -22.5 9.5t-9.5 22.5v192q0 13 9.5 22.5t22.5 9.5h192q13 0 22.5 -9.5t9.5 -22.5zM1792 224v-192q0 -13 -9.5 -22.5t-22.5 -9.5h-1344q-13 0 -22.5 9.5t-9.5 22.5v192q0 13 9.5 22.5t22.5 9.5h1344\nq13 0 22.5 -9.5t9.5 -22.5zM256 1376v-192q0 -13 -9.5 -22.5t-22.5 -9.5h-192q-13 0 -22.5 9.5t-9.5 22.5v192q0 13 9.5 22.5t22.5 9.5h192q13 0 22.5 -9.5t9.5 -22.5zM1792 608v-192q0 -13 -9.5 -22.5t-22.5 -9.5h-1344q-13 0 -22.5 9.5t-9.5 22.5v192q0 13 9.5 22.5\nt22.5 9.5h1344q13 0 22.5 -9.5t9.5 -22.5zM1792 992v-192q0 -13 -9.5 -22.5t-22.5 -9.5h-1344q-13 0 -22.5 9.5t-9.5 22.5v192q0 13 9.5 22.5t22.5 9.5h1344q13 0 22.5 -9.5t9.5 -22.5zM1792 1376v-192q0 -13 -9.5 -22.5t-22.5 -9.5h-1344q-13 0 -22.5 9.5t-9.5 22.5v192\nq0 13 9.5 22.5t22.5 9.5h1344q13 0 22.5 -9.5t9.5 -22.5z"/>\n\t\t</g>\n\t</g>\n</svg>');
                expect(items.items['f03a'].inlineHeight).to.be.equal(1792);
                done();
            }).catch(err => {
                done(err ? err : 'exception');
            });
        });

        it('importing prestashop with crop', function(done) {
            const content = fs.readFileSync('tests/files/ps.svg', 'utf8');

            this.timeout(30000);
            Importer('tests/files/ps.svg', {
                crop: {
                    round: false,
                    // cropCache: __dirname + '/_fa.json'
                }
            }).then(items => {
                expect(items instanceof Collection).to.be.equal(true);

                expect(items.items['e077'].toMinifiedString()).to.be.equal('<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M177 305L43 439v-55q0-21-22-21-21 0-21 21v107q0 9 6 15t15 6h107q21 0 21-21 0-22-21-22H73l134-134q13-15 0-30-15-13-30 0zM491 0H384q-21 0-21 21 0 22 21 22h55L305 177q-13 15 0 30 6 6 15 6t15-6L469 73v55q0 21 22 21 21 0 21-21V21q0-9-6-15t-15-6z"/></svg>');
                expect(items.items['e077'].inlineHeight).to.be.equal(512);
                expect(items.items['e077'].inlineTop).to.be.equal(0);

                done();
            }).catch(err => {
                done(err ? err : 'exception');
            });
        });
    });
})();
