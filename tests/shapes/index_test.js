'use strict';

(() => {
	const SVG = require('../../src/svg'),
		Index = require('../../src/shapes/index');

	const fs = require('fs'),
		chai = require('chai'),
		expect = chai.expect,
		should = chai.should();

	describe('Testing SVG shape indexing', () => {
		it('adding indexes to SVG with 6 basic shapes', done => {
			let svg = new SVG(
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16"><path fill="#444" d="M9 3h6v2h-6v-2z"/><path fill="#444" d="M9 11h6v2h-6v-2z"/><path fill="#444" d="M5 1h-2v2h-2v2h2v2h2v-2h2v-2h-2z"/><path fill="#444" d="M7 10.4l-1.4-1.4-1.6 1.6-1.6-1.6-1.4 1.4 1.6 1.6-1.6 1.6 1.4 1.4 1.6-1.6 1.6 1.6 1.4-1.4-1.6-1.6z"/><path fill="#444" d="M13 14.5c0 0.552-0.448 1-1 1s-1-0.448-1-1c0-0.552 0.448-1 1-1s1 0.448 1 1z"/><path fill="#444" d="M13 9.5c0 0.552-0.448 1-1 1s-1-0.448-1-1c0-0.552 0.448-1 1-1s1 0.448 1 1z"/></svg>'
			);

			Index(svg)
				.then(shapesCount => {
					expect(shapesCount).to.be.equal(6);
					expect(svg.toMinifiedString()).to.be.equal(
						'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16"><path fill="#444" d="M9 3h6v2h-6v-2z" data-shape-index="0"/><path fill="#444" d="M9 11h6v2h-6v-2z" data-shape-index="1"/><path fill="#444" d="M5 1h-2v2h-2v2h2v2h2v-2h2v-2h-2z" data-shape-index="2"/><path fill="#444" d="M7 10.4l-1.4-1.4-1.6 1.6-1.6-1.6-1.4 1.4 1.6 1.6-1.6 1.6 1.4 1.4 1.6-1.6 1.6 1.6 1.4-1.4-1.6-1.6z" data-shape-index="3"/><path fill="#444" d="M13 14.5c0 0.552-0.448 1-1 1s-1-0.448-1-1c0-0.552 0.448-1 1-1s1 0.448 1 1z" data-shape-index="4"/><path fill="#444" d="M13 9.5c0 0.552-0.448 1-1 1s-1-0.448-1-1c0-0.552 0.448-1 1-1s1 0.448 1 1z" data-shape-index="5"/></svg>'
					);

					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('adding indexes to SVG with nested shapes and custom options, then removing indexes', done => {
			let original =
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16"><path fill="#444" d="M9 3h6v2h-6v-2z"/><g stroke="red"><path fill="none" d="M9 11h6v2h-6v-2z"/></g><path d="M5 1h-2v2h-2v2h2v2h2v-2h2v-2h-2z"/></svg>';
			let svg = new SVG(original);

			// Add indexes
			Index(svg, {
				shapeStartIndex: 10,
				shapeAttribute: 'data-test',
				shapeAttributeValue: 'shape-{index}',
				checkFillStroke: true,
				shapeCallback: item => {
					// Test index
					expect(item.index < 10).to.be.equal(false);

					// Test fill and stroke
					switch (item.index) {
						case 10:
							expect(item.fill).to.be.equal('#444');
							expect(item.stroke).to.be.equal(false);
							break;

						case 11:
							expect(item.fill).to.be.equal(false);
							expect(item.stroke).to.be.equal('red');
							break;

						case 12:
							expect(item.fill).to.be.equal('#000');
							expect(item.stroke).to.be.equal(false);
							break;
					}
					return true;
				},
			})
				.then(shapesCount => {
					expect(shapesCount).to.be.equal(3);
					expect(svg.toMinifiedString()).to.be.equal(
						'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16"><path fill="#444" d="M9 3h6v2h-6v-2z" data-test="shape-10"/><g stroke="red"><path fill="none" d="M9 11h6v2h-6v-2z" data-test="shape-11"/></g><path d="M5 1h-2v2h-2v2h2v2h2v-2h2v-2h-2z" data-test="shape-12"/></svg>'
					);

					// Remove indexes
					Index(svg, {
						shapeAttribute: 'data-test',
						remove: true,
					})
						.then(shapesCount => {
							expect(shapesCount).to.be.equal(3);
							expect(svg.toMinifiedString()).to.be.equal(original);

							done();
						})
						.catch(err => {
							done(err ? err : 'exception');
						});
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});
	});
})();
