'use strict';

(() => {
	const Collection = require('../../src/collection'),
		Importer = require('../../src/import/dir');

	const fs = require('fs'),
		chai = require('chai'),
		expect = chai.expect,
		should = chai.should();

	describe('Testing importing svg files', () => {
		it('importing test files directory', done => {
			const content = fs.readFileSync('tests/files/fci-biomass.svg', 'utf8');

			Importer('tests/files')
				.then(items => {
					expect(items instanceof Collection).to.be.equal(true);
					let keys = items.keys();
					expect(keys.includes('1f1e6-1f1ff')).to.be.equal(true);
					expect(keys.includes('u1f3cc-golfer')).to.be.equal(true);
					expect(keys.includes('fi-bold')).to.be.equal(true);
					expect(keys.includes('elusive-eur')).to.be.equal(true);
					expect(keys.includes('sub-dir-octicon-jersey')).to.be.equal(true);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('importing test files directory without subdirs', done => {
			Importer('tests/files', {
				includeSubDirs: false,
			})
				.then(items => {
					expect(items instanceof Collection).to.be.equal(true);
					let keys = items.keys();
					expect(keys.includes('1f1e6-1f1ff')).to.be.equal(true);
					expect(keys.includes('u1f3cc-golfer')).to.be.equal(true);
					expect(keys.includes('fi-bold')).to.be.equal(true);
					expect(keys.includes('elusive-eur')).to.be.equal(false);
					expect(keys.includes('octicon-jersey')).to.be.equal(false);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('using directory as prefix', done => {
			Importer('tests/files', {
				directoryAsPrefix: true,
			})
				.then(items => {
					expect(items instanceof Collection).to.be.equal(true);
					let keys = items.keys();
					expect(keys.includes('unused:emoji-u26fa')).to.be.equal(true);
					expect(keys.includes('sub-dir:map-ice-skating')).to.be.equal(true);
					expect(keys.includes('sub-dir:sub-dir-octicon-jersey')).to.be.equal(
						true
					);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('using directory as prefix', done => {
			Importer('tests/files', {
				directoryAsPrefix: true,
			})
				.then(items => {
					expect(items instanceof Collection).to.be.equal(true);
					let keys = items.keys();
					expect(keys.includes('unused:emoji-u26fa')).to.be.equal(true);
					expect(keys.includes('sub-dir:map-ice-skating')).to.be.equal(true);
					expect(keys.includes('sub-dir:sub-dir-octicon-jersey')).to.be.equal(
						true
					);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('using directory as prefix, items have prefix too', done => {
			Importer('tests/files', {
				directoryAsPrefix: true,
				removeDirectoryPrefix: true,
			})
				.then(items => {
					expect(items instanceof Collection).to.be.equal(true);
					let keys = items.keys();
					expect(keys.includes('unused:emoji-u26fa')).to.be.equal(true);
					expect(keys.includes('sub-dir:map-ice-skating')).to.be.equal(true);
					expect(keys.includes('sub-dir:octicon-jersey')).to.be.equal(true);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('automatically detecting prefix', done => {
			Importer('tests/files/same-prefix')
				.then(items => {
					expect(items instanceof Collection).to.be.equal(true);
					expect(items.prefix).to.be.equal('16-arc');
					let keys = items.keys();
					expect(keys.includes('90')).to.be.equal(true);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('removing prefix from file names', done => {
			Importer('tests/files/same-prefix', {
				prefix: '16',
				removePrefix: true,
			})
				.then(items => {
					expect(items instanceof Collection).to.be.equal(true);
					expect(items.prefix).to.be.equal('16');
					let keys = items.keys();
					expect(keys.includes('arc-90')).to.be.equal(true);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('directory as prefix and files with same prefix', done => {
			Importer('tests/files/same-prefix', {
				directoryAsPrefix: true,
			})
				.then(items => {
					expect(items instanceof Collection).to.be.equal(true);
					expect(items.prefix).to.be.equal('same-prefix');
					let keys = items.keys();
					expect(keys.includes('16-arc-180')).to.be.equal(true);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('importing directory that does not exist', done => {
			Importer('tests/no-such-dir')
				.then(items => {
					done('Expected error');
				})
				.catch(err => {
					done();
				});
		});
	});
})();
