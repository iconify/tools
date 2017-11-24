"use strict";

(() => {
    const SVG = require('../../src/svg'),
        Collection = require('../../src/collection');

    const fs = require('fs'),
        chai = require('chai'),
        expect = chai.expect,
        should = chai.should();

    describe('Testing SVG collection prefix functions', () => {
        const content1 = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" enable-background="new 0 0 64 64"><circle cx="32" cy="32" r="30" fill="#4fd1d9"/><path d="m28.6 17.5h6.9l10.3 29h-6.6l-1.9-6h-10.7l-2 6h-6.3l10.3-29m-.4 18h7.4l-3.6-11.4-3.8 11.4" fill="#fff"/></svg>';

        it('detecting prefix from few simple items', () => {
            let lib = new Collection(),
                svg = new SVG(content1);

            lib.add('foo-bar-icon1', svg);
            lib.add('foo-bar-another-icon', svg);
            lib.add('foo-bar-third-icon', svg);

            expect(lib.findCommonPrefix(false)).to.be.equal('foo-bar');
        });

        it('icons with matching parts', () => {
            let lib = new Collection(),
                svg = new SVG(content1);

            lib.add('foo-bar-another', svg);
            lib.add('foo-bar-another-icon', svg);

            expect(lib.findCommonPrefix(false)).to.be.equal('foo-bar');
        });

        it('complex prefix', () => {
            let lib = new Collection(),
                svg = new SVG(content1);

            lib.add('foo-bar:another-icon1', svg);
            lib.add('foo-bar:another-icon2', svg);

            expect(lib.findCommonPrefix(false)).to.be.equal('foo-bar');
        });

        it('complex prefix error', () => {
            let lib = new Collection(),
                svg = new SVG(content1);

            lib.add('foo-bar-another', svg);
            lib.add('foo-bar-another:icon', svg);

            expect(lib.findCommonPrefix(false)).to.be.equal('');
        });

        it('complex and simple prefixes match', () => {
            let lib = new Collection(),
                svg = new SVG(content1);

            lib.add('foo-bar:another-icon1', svg);
            lib.add('foo-bar-another-icon2', svg);

            expect(lib.findCommonPrefix(false)).to.be.equal('foo-bar');
        });

        it('no commmon parts', () => {
            let lib = new Collection(),
                svg = new SVG(content1);

            lib.add('foo-bar-another', svg);
            lib.add('bar-baz-icon', svg);
            lib.add('bar-baz-icon2', svg);

            expect(lib.findCommonPrefix(false)).to.be.equal('');
        });

        it('renaming icons', () => {
            let lib = new Collection(),
                svg = new SVG(content1);

            lib.add('foo-bar:another-icon1', svg);
            lib.add('foo-bar-another-icon2', svg);

            expect(lib.findCommonPrefix(true)).to.be.equal('foo-bar');
            expect(lib.prefix).to.be.equal('foo-bar');
            expect(lib.keys()).to.be.eql(['another-icon1', 'another-icon2']);
        });
    });
})();
