'use strict';

(() => {
	const SVG = require('../../src/svg'),
		Optimize = require('../../src/optimize/flags');

	const fs = require('fs'),
		chai = require('chai'),
		expect = chai.expect,
		should = chai.should();

	describe('Testing fixing flags in path', () => {
		it('nothing to fix', () => {
			let svg =
				'<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M31.293 37.879a.503.503 0 0 1-.274-.081L20 30.601 8.98 37.798a.5.5 0 0 1-.756-.55l3.437-12.704-10.247-8.257a.499.499 0 0 1 .288-.889l13.146-.656 4.686-12.298c.146-.389.787-.389.934 0l4.685 12.298 13.146.656a.5.5 0 0 1 .288.889L28.34 24.544l3.437 12.704a.5.5 0 0 1-.484.631zM20 29.505a.5.5 0 0 1 .273.081l10.194 6.657-3.18-11.753a.503.503 0 0 1 .169-.521l9.479-7.639-12.16-.606a.5.5 0 0 1-.441-.321L20 4.026l-4.335 11.377a.496.496 0 0 1-.441.321l-12.16.606 9.48 7.639a.502.502 0 0 1 .169.521l-3.18 11.753 10.194-6.657a.5.5 0 0 1 .273-.081z"/></svg>';

			let result = Optimize(svg);
			expect(result).to.be.equal(
				'<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M31.293 37.879a.503.503 0 0 1-.274-.081L20 30.601L8.98 37.798a.5.5 0 0 1-.756-.55l3.437-12.704l-10.247-8.257a.499.499 0 0 1 .288-.889l13.146-.656l4.686-12.298c.146-.389.787-.389.934 0l4.685 12.298l13.146.656a.5.5 0 0 1 .288.889L28.34 24.544l3.437 12.704a.5.5 0 0 1-.484.631zM20 29.505a.5.5 0 0 1 .273.081l10.194 6.657l-3.18-11.753a.503.503 0 0 1 .169-.521l9.479-7.639l-12.16-.606a.5.5 0 0 1-.441-.321L20 4.026l-4.335 11.377a.496.496 0 0 1-.441.321l-12.16.606l9.48 7.639a.502.502 0 0 1 .169.521l-3.18 11.753l10.194-6.657a.5.5 0 0 1 .273-.081z"/></svg>'
			);
		});

		it('compressed flags in arc', () => {
			let svg =
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M12 4a4 4 0 110 8 4 4 0 010-8zm0 10c4.418 0 8 1.79 8 4v2H4v-2c0-2.21 3.582-4 8-4z"/></svg>';

			let result = Optimize(svg);
			expect(result).to.be.equal(
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M12 4a4 4 0 1 1 0 8a4 4 0 0 1 0-8zm0 10c4.418 0 8 1.79 8 4v2H4v-2c0-2.21 3.582-4 8-4z"/></svg>'
			);
		});

		it('path without z at the end', () => {
			let svg =
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M-18.2 1050.713h5.931"/></svg>';

			let result = Optimize(svg);
			expect(result).to.be.equal(
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M-18.2 1050.713h5.931"/></svg>'
			);
		});

		it('number compression', () => {
			let svg =
				'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path opacity=".3" d="M4 6h16v10H4z"/><path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>';

			let result = Optimize(svg);
			expect(result).to.be.equal(
				'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path opacity=".3" d="M4 6h16v10H4z"/><path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>'
			);
		});
	});
})();
