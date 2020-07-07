'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const tools = require('@iconify/tools');

/**
 * Locate FontAwesomePro directory
 */
let faLocation = null;

// Attempt to find it in node_modules
try {
	const packageJSON = require.resolve('font-awesome-pro/package.json');
	faLocation = checkDirectory(packageJSON);
} catch (err) {}

// Attempt to find directory
if (!faLocation) {
	// Check current directory
	fs.readdirSync(__dirname).forEach((file) => {
		if (faLocation || file.slice(0, 1) === '.' || file === 'node_modules') {
			return;
		}
		faLocation = checkDirectory(__dirname + '/' + file + '/package.json');
	});
}

// Check if directory has been located
if (!faLocation) {
	console.error('Could not locate font-awesome-pro package.');
	return;
}

console.log('Located FontAwesome Pro version ' + faLocation.version);

// Generate sources list
const variations = [];
faLocation.variations.forEach((variation) => {
	const prefix = 'fa-pro-' + variation;
	variations.push({
		prefix,
		source: faLocation.svgs + '/' + variation,
		target: __dirname + '/' + prefix + '.json',
	});
});

parseNextVariation();

/**
 * Parse next variation
 */
function parseNextVariation() {
	const nextItem = variations.shift();
	if (nextItem === void 0) {
		return;
	}

	const source = nextItem.source;
	const target = nextItem.target;
	const prefix = nextItem.prefix;

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
			prefix,
		})
		.then((result) => {
			// Copy reference so it can be used in chain of promises
			// collection is instance of tools.Collection class
			collection = result;

			console.log('Imported', collection.length(), 'icons for', prefix);

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
								reject(
									'Error optimizing icon ' + key + '\n' + util.format(err)
								);
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
			// Change color to "currentColor" to all icons
			// Use this only for monotone collections
			let options = {
				default: 'currentColor', // change all colors to "currentColor"
				add: 'currentColor', // add "currentColor" to shapes that are missing color value
			};

			return collection.promiseEach(
				(svg) => tools.ChangePalette(svg, options),
				true
			);
		})
		.then(() => {
			// Export JSON collection
			console.log('Exporting', prefix, 'to', target);
			return tools.ExportJSON(collection, target, {
				optimize: true,
			});
		})
		.then(() => {
			parseNextVariation();
		})
		.catch((err) => {
			console.error(err);
			parseNextVariation();
		});
}

/**
 * Check directory for possible FontAwesome files
 *
 * @param {string} packageJSON
 * @returns {object | null}
 *
 * Returns {root, version, svgs, variations} on success.
 * Returns null on error.
 */
function checkDirectory(packageJSON) {
	try {
		const rawData = fs.readFileSync(packageJSON, 'utf8');
		const parsedData = JSON.parse(rawData);
		if (
			typeof parsedData === 'object' &&
			parsedData.name === 'font-awesome-pro' &&
			typeof parsedData.version === 'string'
		) {
			// Located FontAwesome Pro!
			const root = path.dirname(packageJSON);
			const version = parsedData.version;

			// Check for 'svgs' directory
			const svgs = root + '/svgs';
			const stat = fs.lstatSync(svgs);
			if (!stat.isDirectory()) {
				return null;
			}

			// Get icon variations
			const variations = fs.readdirSync(svgs).filter((dir) => {
				if (!dir.match(/^[a-z]+$/)) {
					return false;
				}

				const fullDir = svgs + '/' + dir;
				try {
					const stat = fs.lstatSync(fullDir);
					return stat.isDirectory();
				} catch (err) {
					return false;
				}
			});
			if (!variations.length) {
				return null;
			}

			// Return data
			return {
				root,
				version,
				svgs,
				variations,
			};
		}
	} catch (err) {
		return null;
	}
}
