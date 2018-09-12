"use strict";

(() => {
    const SVG = require('../../src/svg'),
        Collection = require('../../src/collection');

    const fs = require('fs'),
        chai = require('chai'),
        expect = chai.expect,
        should = chai.should();

    describe('Testing merging SVG collections', () => {
        const content1 = fs.readFileSync(__dirname + '/../files/1f1e6.svg', 'utf8'),
            content2 = fs.readFileSync(__dirname + '/../files/1f6b2.svg', 'utf8'),
            content3 = fs.readFileSync(__dirname + '/../files/elegant-chat.svg', 'utf8');

        it('simple merge with different icons', () => {
            let lib1 = new Collection('foo'),
                lib2 = new Collection('foo');

            // Add few files
            lib1.add('file1', new SVG(content1));
            lib1.add('file2', new SVG(content2));
            lib2.add('file3', new SVG(content3));

            let result = lib1.merge(lib2);
            expect(result).to.be.eql({
                identical: 0,
                removed: 1,
                renamed: 0,
                updated: 0
            });

            expect(lib1.keys()).to.be.eql(['file1', 'file2', 'file3']);
            expect(lib2.keys()).to.be.eql(['file3']);
            expect(lib1.items.file3.toString()).to.be.equal(lib2.items.file3.toString());
            expect(lib1.items.file3.hidden).to.be.equal(true);
        });

        it('simple merge with different icons and custom options', () => {
            let lib1 = new Collection('foo'),
                lib2 = new Collection('foo');

            // Add few files
            lib1.add('file1', new SVG(content1));
            lib1.add('file2', new SVG(content2));
            lib2.add('file3', new SVG(content3));

            let result = lib1.merge(lib2, {
                markAsHidden: false
            });
            expect(result).to.be.eql({
                identical: 0,
                removed: 1,
                renamed: 0,
                updated: 0
            });
            expect(lib1.items.file3.hidden === void 0).to.be.equal(true);
        });

        it('identical icons', () => {
            let lib1 = new Collection('foo'),
                lib2 = new Collection('foo');

            // Add few files
            lib1.add('file1', new SVG(content1));
            lib1.add('file2', new SVG(content2));
            lib2.add('file2', new SVG(content2));
            lib2.add('file3', new SVG(content3));

            let result = lib1.merge(lib2);
            expect(result).to.be.eql({
                identical: 1,
                removed: 1,
                renamed: 0,
                updated: 0
            });

            expect(lib1.keys()).to.be.eql(['file1', 'file2', 'file3']);
            expect(lib2.keys()).to.be.eql(['file2', 'file3']);
        });

        it('updated icon', () => {
            let lib1 = new Collection('foo'),
                lib2 = new Collection('foo');

            // Add few files
            lib1.add('file1', new SVG(content1));
            lib1.add('file2', new SVG(content2));
            lib2.add('file2', new SVG(content3));

            let result = lib1.merge(lib2);
            expect(result).to.be.eql({
                identical: 0,
                removed: 0,
                renamed: 0,
                updated: 1
            });

            expect(lib1.keys()).to.be.eql(['file1', 'file2']);
            expect(lib2.keys()).to.be.eql(['file2']);

            // file2 should have content2
            expect(lib1.items['file2'].toString()).to.not.be.equal(lib2.items['file2'].toString());
        });

        it('renamed icon', () => {
            let lib1 = new Collection('foo'),
                lib2 = new Collection('foo');

            // Add few files
            lib1.add('file1', new SVG(content1));
            lib1.add('file2', new SVG(content2));
            lib2.add('file3', new SVG(content2));

            let result = lib1.merge(lib2);
            expect(result).to.be.eql({
                identical: 0,
                removed: 0,
                renamed: 1,
                updated: 0
            });

            expect(lib1.keys()).to.be.eql(['file1', 'file2']);
            expect(lib2.keys()).to.be.eql(['file3']);
            expect(lib1.items.file2.aliases).to.be.eql(['file3']);
        });

        it('similar icons with different viewBox', () => {
            let lib1 = new Collection('foo'),
                lib2 = new Collection('foo');

            // Add few files
            let path = '<path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/>';
            lib1.add('original-icon', new SVG('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8">' + path + '</svg>'));
            lib1.add('dummy-icon', new SVG(content1));
            lib1.add('dummy-icon2', new SVG(content1));

            lib2.add('renamed-dummy-icon', new SVG(content1));
            lib2.add('renamed-icon', new SVG('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8">' + path + '</svg>'));
            lib2.add('another-renamed-icon', new SVG('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8">' + path + '</svg>'));

            // Change attributes order
            lib2.add('swap-attributes', new SVG('<svg width="8" height="8" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg">' + path + '</svg>'));
            lib2.add('missing-viewbox', new SVG('<svg width="8" height="8" xmlns="http://www.w3.org/2000/svg">' + path + '</svg>'));

            // Change viewBox
            lib2.add('different-width', new SVG('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="8" viewBox="0 0 10 8">' + path + '</svg>'));
            lib2.add('different-left', new SVG('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="-1 0 10 8">' + path + '</svg>'));

            let result = lib1.merge(lib2);
            expect(result).to.be.eql({
                identical: 0,
                removed: 2,
                renamed: 5,
                updated: 0
            });

            expect(lib1.keys()).to.be.eql(['original-icon', 'dummy-icon', 'dummy-icon2', 'different-width', 'different-left']);
            expect(lib1.items['original-icon'].aliases).to.be.eql(['renamed-icon', 'another-renamed-icon', 'swap-attributes', 'missing-viewbox']);
            expect(lib1.items['dummy-icon'].aliases).to.be.eql(['renamed-dummy-icon']);
            expect(lib1.items['dummy-icon2'].aliases === void 0).to.be.equal(true); // alias should be added only to first match
        });

        it('renamed icon that exists as alias', () => {
            let lib1 = new Collection('foo'),
                lib2 = new Collection('foo');

            // Add few files
            lib1.add('file1', new SVG(content1));
            lib1.add('file2', new SVG(content1));
            lib2.add('file3', new SVG(content1));
            lib2.add('file4', new SVG(content2));

            lib1.items.file2.aliases = ['file3', {
                name: 'file4',
                hFlip: true
            }];

            let result = lib1.merge(lib2);
            expect(result).to.be.eql({
                identical: 0,
                removed: 0,
                renamed: 0,
                updated: 0
            });

            expect(lib1.keys()).to.be.eql(['file1', 'file2']);
            expect(lib2.keys()).to.be.eql(['file3', 'file4']);
            expect(lib1.items.file1.aliases === void 0).to.be.equal(true);
            expect(lib1.items.file2.aliases).to.be.eql(['file3', {
                name: 'file4',
                hFlip: true
            }]);
        });

        it('renamed icon with alias', () => {
            let lib1 = new Collection('foo'),
                lib2 = new Collection('foo');

            // Add few files
            lib1.add('file1', new SVG(content1));
            lib1.add('file2', new SVG(content1));
            lib2.add('file3', new SVG(content1));
            lib2.add('file4', new SVG(content2));

            lib2.items.file3.aliases = ['file5', {
                name: 'file6',
                hFlip: true
            }, 'file2'];

            let result = lib1.merge(lib2);
            expect(result).to.be.eql({
                identical: 0,
                removed: 1,
                renamed: 1,
                updated: 0
            });

            expect(lib1.keys()).to.be.eql(['file1', 'file2', 'file4']);
            expect(lib2.keys()).to.be.eql(['file3', 'file4']);
            expect(lib1.items.file1.aliases).to.be.eql(['file3', 'file5', {
                name: 'file6',
                hFlip: true
            }]);
            expect(lib1.items.file2.aliases === void 0).to.be.equal(true);
        });
    });
})();
