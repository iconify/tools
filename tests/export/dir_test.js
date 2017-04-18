"use strict";

(() => {
    const SVG = require('../../src/svg'),
        Collection = require('../../src/collection'),
        Exporter = require('../../src/export/dir');

    const fs = require('fs'),
        chai = require('chai'),
        expect = chai.expect,
        should = chai.should();

    describe('Testing exporting to directory', () => {
        const content1 = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" enable-background="new 0 0 64 64"><circle cx="32" cy="32" r="30" fill="#4fd1d9"/><path d="m28.6 17.5h6.9l10.3 29h-6.6l-1.9-6h-10.7l-2 6h-6.3l10.3-29m-.4 18h7.4l-3.6-11.4-3.8 11.4" fill="#fff"/></svg>',
            content2 = '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></svg>';

        const dir = 'tests/temp';

        try {
            fs.mkdirSync(dir, 0o775);
        } catch (err) {

        }

        /**
         * Delete temporary files
         */
        function cleanup() {
            ['key1', 'another-key', 'export3'].forEach(key => {
                try {
                    fs.unlinkSync(dir + '/' + key + '.svg');
                } catch(err) {
                }
            });
        }

        /**
         * Check if file or directory exists
         *
         * @param file
         * @returns {boolean}
         */
        function exists(file) {
            try {
                fs.statSync(file);
                return true;
            } catch (e) {
                return false;
            }
        }

        it('exporting directory', done => {
            let items = new Collection();
            items.add('key1', new SVG(content1));
            items.add('another-key', new SVG(content2));
            items.add('export3', new SVG(content2));

            Exporter(items, dir).then(count => {
                expect(count).to.be.equal(3);

                ['key1', 'another-key', 'export3'].forEach(key => {
                    expect(exists(dir + '/' + key + '.svg')).to.be.equal(true);
                });

                expect(fs.readFileSync(dir + '/key1.svg', 'utf8')).to.be.equal(content1.replace(' enable-background="new 0 0 64 64"', ''));
                expect(fs.readFileSync(dir + '/another-key.svg', 'utf8')).to.be.equal(content2);
                expect(fs.readFileSync(dir + '/export3.svg', 'utf8')).to.be.equal(content2);

                cleanup();
                done();
            }).catch(err => {
                done(err);
            });
        });

        it('exporting directory with error', done => {
            let extra = '-stuff/nested/dir/';

            let items = new Collection();
            items.add('key1', new SVG(content1));
            items.add('another-key', new SVG(content2));

            Exporter(items, dir + extra).then(count => {
                expect(count).to.be.equal(0);

                ['key1', 'another-key', 'export3'].forEach(key => {
                    expect(exists(dir + extra + key + '.svg')).to.be.equal(false);
                });

                done();
            }).catch(err => {
                done(err);
            });
        });
    });
})();
