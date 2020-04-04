'use strict';

(() => {
	const SVG = require('../../src/svg');

	const fs = require('fs'),
		chai = require('chai'),
		expect = chai.expect,
		should = chai.should();

	describe('Testing SVG dimensions', () => {
		it('extracting dimensions with width/height', () => {
			let svg = new SVG(
				'<svg xmlns="http://www.w3.org/2000/svg" width="8" height="12"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></svg>'
			);

			expect(svg.getDimensions()).to.be.eql({
				width: 8,
				height: 12,
			});
		});

		it('extracting dimensions with viewbox', () => {
			let svg = new SVG(
				'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 12"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z" /></svg>'
			);

			expect(svg.getDimensions()).to.be.eql({
				width: 8,
				height: 12,
			});
		});

		it('extracting dimensions with error', () => {
			let svg = new SVG(
				'<svg xmlns="http://www.w3.org/2000/svg"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z" /></svg>'
			);

			expect(svg.getDimensions()).to.be.eql({
				width: 0,
				height: 0,
			});
		});
	});
})();
