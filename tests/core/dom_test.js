'use strict';

(() => {
	const SVG = require('../../src/svg');

	const fs = require('fs'),
		chai = require('chai'),
		expect = chai.expect,
		should = chai.should();

	describe('Testing nodes', () => {
		const tempSVG =
				'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" enable-background="new 0 0 64 64"><circle cx="32" cy="32" r="30" fill="#4fd1d9"/><path d="m28.6 17.5h6.9l10.3 29h-6.6l-1.9-6h-10.7l-2 6h-6.3l10.3-29m-.4 18h7.4l-3.6-11.4-3.8 11.4" fill="#fff"/></svg>',
			basicSVG =
				'<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></svg>';

		it('invalid XML file', done => {
			try {
				let svg = new SVG('foo');
				done('Expected exception');
			} catch (err) {
				done();
			}
		});

		it('testing order of nodes', () => {
			let svg = new SVG(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" enable-background="new 0 0 64 64">
    <path d="m1.1" fill="#fff"/>
    <circle cx="32" cy="32" r="30" fill="#4fd1d9"/>
    <path d="m28.6 17.5h6.9l10.3 29h-6.6l-1.9-6h-10.7l-2 6h-6.3l10.3-29m-.4 18h7.4l-3.6-11.4-3.8 11.4" fill="#fff"/>
    <circle cx="10" cy="10" r="5" fill="#123"/>
</svg>`);

			let children = svg.$svg(':root').children();
			expect(children.length).to.be.equal(4);
			expect(children.get(0).tagName).to.be.equal('path');
			expect(children.get(1).tagName).to.be.equal('circle');
			expect(children.get(2).tagName).to.be.equal('path');
			expect(children.get(3).tagName).to.be.equal('circle');
		});
	});
})();
