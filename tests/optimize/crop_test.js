"use strict";

(() => {
    const SVG = require('../../src/svg'),
        Collection = require('../../src/collection'),
        Crop = require('../../src/optimize/crop');

    const fs = require('fs'),
        chai = require('chai'),
        expect = chai.expect,
        should = chai.should();

    describe('Testing image cropping', () => {
        let croppedHome = '<svg width="1664" height="1312" viewBox="0 0 1664 1312" xmlns="http://www.w3.org/2000/svg"><path d="M1408 768v480q0 26-19 45t-45 19H960V928H704v384H320q-26 0-45-19t-19-45V768q0-1 .5-3t.5-3l575-474 575 474q1 2 1 6zm223-69l-62 74q-8 9-21 11h-3q-13 0-21-7L832 200 140 777q-12 8-24 7-13-2-21-11l-62-74q-8-10-7-23.5T37 654L756 55q32-26 76-26t76 26l244 204V64q0-14 9-23t23-9h192q14 0 23 9t9 23v408l219 182q10 8 11 21.5t-7 23.5z" fill="currentColor"/></svg>';

        it('cropping fa-home.svg as object', function(done) {
            let svg = new SVG(fs.readFileSync('tests/files/fa-home.svg', 'utf8'));

            this.timeout(10000);

            Crop(svg).then(result => {
                expect(result).to.be.equal(svg);
                expect(result.toMinifiedString()).to.be.equal(croppedHome);
                done();
            }).catch(err => {
                done(err);
            });
        });

        it('cropping fa-home.svg as string', function(done) {
            let svg = fs.readFileSync('tests/files/fa-home.svg', 'utf8');

            this.timeout(10000);

            Crop(svg).then(result => {
                expect(result).to.be.equal(croppedHome);
                done();
            }).catch(err => {
                done(err);
            });
        });

        it('cropping fa-home.svg as collection', function(done) {
            let svg = new SVG(fs.readFileSync('tests/files/fa-home.svg', 'utf8')),
                collection = new Collection();

            this.timeout(10000);

            collection.add('home', svg);
            Crop(collection).then(result => {
                expect(result instanceof Collection).to.be.equal(true);
                expect(result.items.home.toString()).to.be.equal(croppedHome);
                done();
            }).catch(err => {
                done(err);
            });
        });
    });
})();
