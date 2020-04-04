'use strict';

(() => {
	const SVG = require('../../src/svg'),
		Collection = require('../../src/collection'),
		Exporter = require('../../src/export/dir');

	const fs = require('fs'),
		chai = require('chai'),
		expect = chai.expect,
		should = chai.should();

	describe('Testing exporting to directory', () => {
		const content1 =
				'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" enable-background="new 0 0 64 64"><circle cx="32" cy="32" r="30" fill="#4fd1d9"/><path d="m28.6 17.5h6.9l10.3 29h-6.6l-1.9-6h-10.7l-2 6h-6.3l10.3-29m-.4 18h7.4l-3.6-11.4-3.8 11.4" fill="#fff"/></svg>',
			content2 =
				'<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></svg>';

		const dir = 'tests/temp';

		const cleanupFiles = {
			test1: {
				files: [
					'key1',
					'another-key',
					'export3',
					'icon-test/export4-icon',
					'icon-test-export4-icon',
				],
				dirs: ['icon-test'],
			},
			test2: {
				files: ['test2/icon1', 'test2/another-icon'],
				dirs: ['test2'],
			},
			test3: {
				files: ['test3b/test3-icon', 'test3b/icon-home'],
				dirs: ['test3b'],
			},
			test4: {
				files: ['test4-icon', 'custom4-prefix/icon-arrow-left'],
				dirs: ['custom4-prefix'],
			},
		};

		try {
			fs.mkdirSync(dir, 0o775);
		} catch (err) {}

		/**
		 * Delete temporary files
		 */
		function cleanup(key) {
			cleanupFiles[key].files.forEach(file => {
				try {
					fs.unlinkSync(dir + '/' + file + '.svg');
				} catch (err) {}
			});

			cleanupFiles[key].dirs.forEach(childDir => {
				try {
					fs.rmdirSync(dir + '/' + childDir);
				} catch (err) {}
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
			items.add('icon-test:export4-icon', new SVG(content2));

			Exporter(items, dir)
				.then(count => {
					expect(count).to.be.equal(4);

					['key1', 'another-key', 'export3', 'icon-test-export4-icon'].forEach(
						file => {
							expect(exists(dir + '/' + file + '.svg')).to.be.equal(
								true,
								'Missing file: ' + file
							);
						}
					);

					expect(fs.readFileSync(dir + '/key1.svg', 'utf8')).to.be.equal(
						content1.replace(
							' enable-background="new 0 0 64 64"',
							' width="64" height="64"'
						)
					);
					expect(fs.readFileSync(dir + '/another-key.svg', 'utf8')).to.be.equal(
						content2
					);
					expect(fs.readFileSync(dir + '/export3.svg', 'utf8')).to.be.equal(
						content2
					);
					expect(
						fs.readFileSync(dir + '/icon-test-export4-icon.svg', 'utf8')
					).to.be.equal(content2);

					cleanup('test1');
					done();
				})
				.catch(err => {
					cleanup('test1');
					done(err ? err : 'exception');
				});
		});

		it('exporting directory with prefix as sub-dir', done => {
			let items = new Collection('test2');
			items.add('icon1', new SVG(content1));
			items.add('another-icon', new SVG(content2));

			Exporter(items, dir, {
				prefixAsDirectory: true,
			})
				.then(count => {
					expect(count).to.be.equal(2);

					['test2/icon1', 'test2/another-icon'].forEach(file => {
						expect(exists(dir + '/' + file + '.svg')).to.be.equal(
							true,
							'Missing file: ' + file
						);
					});

					cleanup('test2');
					done();
				})
				.catch(err => {
					cleanup('test2');
					done(err ? err : 'exception');
				});
		});

		it('exporting directory with custom prefix', done => {
			let items = new Collection('test3');
			items.add('test3-icon', new SVG(content1));
			items.add('icon-home', new SVG(content2));

			Exporter(items, dir, {
				prefixAsDirectory: true,
				customPrefix: 'test3b',
			})
				.then(count => {
					expect(count).to.be.equal(2);

					['test3b/test3-icon', 'test3b/icon-home'].forEach(file => {
						expect(exists(dir + '/' + file + '.svg')).to.be.equal(
							true,
							'Missing file: ' + file
						);
					});

					cleanup('test3');
					done();
				})
				.catch(err => {
					cleanup('test3');
					done(err ? err : 'exception');
				});
		});

		it('exporting icons with complex prefix', done => {
			let items = new Collection();
			items.add('test4-icon', new SVG(content1));
			items.add('custom4-prefix:icon-arrow-left', new SVG(content2));

			Exporter(items, dir, {
				prefixAsDirectory: true,
			})
				.then(count => {
					expect(count).to.be.equal(2);

					['test4-icon', 'custom4-prefix/icon-arrow-left'].forEach(file => {
						expect(exists(dir + '/' + file + '.svg')).to.be.equal(
							true,
							'Missing file: ' + file
						);
					});

					cleanup('test4');
					done();
				})
				.catch(err => {
					cleanup('test4');
					done(err ? err : 'exception');
				});
		});
	});
})();
