'use strict';

(() => {
	const SVG = require('../../src/svg'),
		Exporter = require('../../src/export/png');

	const fs = require('fs'),
		chai = require('chai'),
		expect = chai.expect,
		should = chai.should();

	describe('Testing exporting png files', () => {
		const content = fs.readFileSync('tests/files/fi-bold.svg', 'utf8'),
			content2 = fs.readFileSync('tests/files/fa-home.svg', 'utf8');

		try {
			fs.mkdirSync('tests/temp', 0o775);
		} catch (err) {}

		it('exporting fi-bold.svg to png without changes', done => {
			const filename = 'tests/temp/fi-bold.png',
				expectedFilename = 'tests/files/fi-bold.png';

			try {
				fs.unlinkSync(filename);
			} catch (err) {}

			let svg = new SVG(content);

			Exporter(svg, filename)
				.then(() => {
					let data = fs.readFileSync(filename),
						expectedData = fs.readFileSync(expectedFilename);

					expect(Buffer.compare(data, expectedData)).to.be.equal(0);
					fs.unlinkSync(filename);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('exporting fa-home.svg to png scaled and red', done => {
			const filename = 'tests/temp/fa-home.png',
				expectedFilename = 'tests/files/fa-home.png';

			try {
				fs.unlinkSync(filename);
			} catch (err) {}

			let svg = new SVG(content2);

			Exporter(svg, filename, {
				background: '#e0e0e0',
				color: '#a00',
				height: svg.height / 32,
			})
				.then(() => {
					let data = fs.readFileSync(filename),
						expectedData = fs.readFileSync(expectedFilename);

					expect(Buffer.compare(data, expectedData)).to.be.equal(0);
					fs.unlinkSync(filename);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});
	});
})();
