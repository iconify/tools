"use strict";

(() => {
    const SVG = require('../../src/svg'),
        Collection = require('../../src/collection');

    const fs = require('fs'),
        chai = require('chai'),
        expect = chai.expect,
        should = chai.should();

    describe('Testing SVG collection', () => {
        const content1 = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" enable-background="new 0 0 64 64"><circle cx="32" cy="32" r="30" fill="#4fd1d9"/><path d="m28.6 17.5h6.9l10.3 29h-6.6l-1.9-6h-10.7l-2 6h-6.3l10.3-29m-.4 18h7.4l-3.6-11.4-3.8 11.4" fill="#fff"/></svg>',
            content2 = '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></svg>';

        it('collection manipulation', () => {
            let lib = new Collection();

            // Add few files
            lib.add('file1', new SVG(content1));
            lib.add('file2', new SVG(content2));
            lib.add('file3', null);
            lib.add('file4', content1);

            // Test length and keys
            expect(lib.length()).to.be.equal(2);
            expect(lib.keys()).to.be.eql(['file1', 'file2']);

            // Add few more files
            lib.add('test1', new SVG(content1));
            lib.add('test2', new SVG(content2));
            lib.add('test3', new SVG(content1));

            // Test length
            expect(lib.length()).to.be.equal(5);

            // Remove some files
            lib.remove('file2');
            lib.remove('random');

            // Test length
            expect(lib.length()).to.be.equal(4);
            expect(lib.keys()).to.be.eql(['file1', 'test1', 'test2', 'test3']);

            // Test forEach
            let parsed = [];
            lib.forEach((item, key) => {
                parsed.push(key);
                expect(item instanceof SVG).to.be.equal(true);
                expect(item).to.be.equal(lib.items[key]);
            });
            expect(parsed).to.be.eql(['file1', 'test1', 'test2', 'test3']);
        });

        it('promises', done => {
            let lib = new Collection();

            // Add few files
            lib.add('file1', new SVG(content1));
            lib.add('file2', new SVG(content2));

            // Promises
            lib.promiseAll((svg, name) => {
                return new Promise((fulfill, reject) => {
                    fulfill(svg.getDimensions());
                });
            }).then(results => {
                expect(results).to.be.eql({
                    file1: {
                        width: 64,
                        height: 64
                    },
                    file2: {
                        width: 8,
                        height: 8
                    }
                });
                done();
            }).catch(err => {
                done(err ? err : 'exception');
            });
        });

        it('partial promises', done => {
            let lib = new Collection();

            // Add few files
            lib.add('file1', new SVG(content1));
            lib.add('file2', new SVG(content2));

            // Promises
            lib.promiseAll((svg, name) => {
                return name === 'file1' ? null : new Promise((fulfill, reject) => {
                    fulfill(svg.getDimensions());
                });
            }).then(results => {
                expect(results).to.be.eql({
                    file2: {
                        width: 8,
                        height: 8
                    }
                });
                done();
            }).catch(err => {
                done(err ? err : 'exception');
            });
        });
    });
})();
