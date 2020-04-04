'use strict';

(() => {
	const SVG = require('../../src/svg'),
		ShapeLengths = require('../../src/shapes/length');

	const fs = require('fs'),
		chai = require('chai'),
		expect = chai.expect,
		should = chai.should();

	describe('Testing SVG shape length', () => {
		it('line', done => {
			let svg = new SVG(
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16">' +
					'<line x1="10" y1="20" x2="40" y2="60" />' +
					'</svg>'
			);

			ShapeLengths(svg)
				.then(results => {
					expect(typeof results).to.be.equal('object');
					expect(results.length).to.be.equal(1);
					expect(results[0].length).to.be.equal(50);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('circle', done => {
			let svg = new SVG(
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16">' +
					'<circle cx="200" cy="500" r="100" />' +
					'<circle cx="100" cy="-500" r="50" />' +
					'</svg>'
			);

			ShapeLengths(svg)
				.then(results => {
					expect(typeof results).to.be.equal('object');
					expect(results.length).to.be.equal(2);
					expect(Math.round(results[0].length)).to.be.equal(628);
					expect(Math.round(results[1].length)).to.be.equal(314);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('rectangle', done => {
			let svg = new SVG(
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16">' +
					'<rect x="200" y="500" width="100" height="200" />' +
					'<rect x="100" y="-500" width="50" height="15" />' +
					'</svg>'
			);

			ShapeLengths(svg)
				.then(results => {
					expect(typeof results).to.be.equal('object');
					expect(results.length).to.be.equal(2);
					expect(results[0].length).to.be.equal(600);
					expect(results[1].length).to.be.equal(130);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('polyline and polygon', done => {
			let svg = new SVG(
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16">' +
					'<polygon points="0,40 40,40 40,80 80,80 80,120 120,120 120,160" />' +
					'<polyline points="0,40 40,40 40,80 80,80 80,120 120,120 120,160" />' +
					'</svg>'
			);

			ShapeLengths(svg)
				.then(results => {
					expect(typeof results).to.be.equal('object');
					expect(results.length).to.be.equal(2);
					expect(Math.round(results[0].length)).to.be.equal(410);
					expect(results[1].length).to.be.equal(240);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('complex shapes converted to path', function(done) {
			let svg = new SVG(
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16">' +
					'<ellipse cx="200" cy="500" rx="100" ry="200" />' +
					'<ellipse cx="100" cy="-500" rx="10" ry="15" />' +
					'<rect x="200" y="500" width="100" height="200" rx="10" ry="20" />' +
					'<polyline points="0,40 40,40 40,80 80,80 80,120 120,120 120,160" />' +
					'<path d="M9 3h6v2h-6v-2z" />' +
					'<rect x="80" width="80" height="32" rx="16" />' +
					'</svg>'
			);

			// Set timeout because this function will use PhantomJS
			this.timeout(15000);

			ShapeLengths(svg)
				.then(results => {
					expect(typeof results).to.be.equal('object');
					expect(results.length).to.be.equal(6);

					// ellipse
					expect(Math.round(results[0].length)).to.be.equal(969);
					expect(Math.round(results[1].length)).to.be.equal(79);

					// rect
					expect(Math.round(results[2].length)).to.be.equal(577);

					// polyline, thrown in there to test mixing shapes parsed with phantomjs and shapes parsed without it
					expect(results[3].length).to.be.equal(240);

					// path
					expect(results[4].length).to.be.equal(16);

					// another rect
					expect(Math.round(results[5].length)).to.be.equal(208);

					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});
	});
})();
