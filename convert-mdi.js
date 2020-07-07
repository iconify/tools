'use strict';

const path = require('path');
const util = require('util');
const tools = require('@iconify/tools');

/*
    Locate directory where SVG files are

    Icons are located  in directory "svg" in @mdi/svg package

    require.resolve locates package.json
    path.dirname removes package.json from result, returning only directory
    + '/svg' adds 'svg' directory to result
*/
let source = path.dirname(require.resolve('@mdi/svg/package.json')) + '/svg';

// Target file name
let target = __dirname + '/mdi.json';

// Variable to store collection
let collection;

// Options for SVGO optimization
let SVGOOptions = {
	convertShapeToPath: true,
	mergePaths: false,
};

/**
 * Import directory
 */
tools
	.ImportDir(source, {
		prefix: 'mdi',
	})
	.then((result) => {
		// Copy reference so it can be used in chain of promises
		// collection is instance of tools.Collection class
		collection = result;

		console.log('Imported', collection.length(), 'icons.');

		// Optimize SVG files
		//
		// collection.promiseEach() iterates all icons in collection and runs
		// promise for each icon, one at a time.
		return collection.promiseEach(
			(svg, key) =>
				new Promise((fulfill, reject) => {
					tools
						.SVGO(svg, SVGOOptions)
						.then((res) => {
							fulfill(res);
						})
						.catch((err) => {
							reject('Error optimizing icon ' + key + '\n' + util.format(err));
						});
				}),
			true
		);
	})
	.then(() => {
		// Clean up tags
		return collection.promiseEach(
			(svg, key) =>
				new Promise((fulfill, reject) => {
					tools
						.Tags(svg)
						.then((res) => {
							fulfill(res);
						})
						.catch((err) => {
							reject(
								'Error checking tags in icon ' + key + '\n' + util.format(err)
							);
						});
				}),
			true
		);
	})
	.then(() => {
		// Move icons origin to 0,0
		// This is not needed for most collections, but its useful to know how to do it
		let promises = [];
		collection.forEach((svg, key) => {
			if (svg.top !== 0 || svg.left !== 0) {
				let body = svg.getBody();
				if (body.indexOf('<defs') !== -1) {
					// Do not use this method to move icons with <defs> tags - sometimes results could be wrong
					return;
				}

				let content = '<svg';
				content += ' width="' + svg.width + '"';
				content += ' height="' + svg.height + '"';
				content += ' viewBox="0 0 ' + svg.width + ' ' + svg.height + '"';
				content += ' xmlns="http://www.w3.org/2000/svg">\n';
				content +=
					'<g transform="translate(' +
					(0 - svg.left) +
					' ' +
					(0 - svg.top) +
					')">' +
					body +
					'</g>';
				content += '</svg>';

				svg.load(content);
				promises.push(
					new Promise((fulfill, reject) => {
						// Use SVGO to optimize icon. It will get apply transformation to shapes
						tools
							.SVGO(svg, SVGOOptions)
							.then((res) => {
								fulfill(res);
							})
							.catch((err) => {
								reject(
									'Error changing icon origin for ' +
										key +
										'\n' +
										util.format(err)
								);
							});
					})
				);
			}
		});
		return Promise.all(promises);
	})
	.then(() => {
		// Change color to "currentColor" to all icons
		// Use this only for monotone collections
		let options = {
			default: 'currentColor', // change all colors to "currentColor"
			add: 'currentColor', // add "currentColor" to shapes that are missing color value
		};

		/*
    // For icons that have palette use this instead:
    let options = {
        add: 'currentColor',
    };
    */

		return collection.promiseEach(
			(svg) => tools.ChangePalette(svg, options),
			true
		);
	})
	.then(() => {
		// Export JSON collection
		console.log('Exporting collection to', target);
		return tools.ExportJSON(collection, target, {
			optimize: true,
		});
	})
	.catch((err) => {
		console.error(err);
	});
