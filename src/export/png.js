/**
 * This file is part of the @iconify/tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const helpers = require('../helpers');
const phantom = require('./phantomjs');
const SVG = require('../svg');
const Collection = require('../collection');

const defaults = {
	color: '#000',
	background: 'transparent',

	// Icon dimensions. null = not set, which will set to same as SVG
	width: null,
	height: null,

	// False if errors should be ignored
	reject: true,

	// False if instead of converting icons function should return data for phantom() call
	parse: true,
};

/**
 * Export to .png file
 *
 * @param {SVG|Collection|string} item
 * @param target
 * @param options
 * @return {Promise<any>}
 */
module.exports = (item, target, options) => {
	options = options === void 0 ? Object.create(null) : options;
	Object.keys(defaults).forEach(key => {
		if (options[key] === void 0) {
			options[key] = defaults[key];
		}
	});

	const scaleSVG = (svg, target) => {
		let width = svg.width,
			height = svg.height;

		if (typeof options.height === 'number' && options.height !== height) {
			// Scale
			width = (width * options.height) / height;
			height = options.height;
		}

		// Get raw SVG
		let content = svg.toString();
		content = content.replace(/currentColor/g, options.color);

		// Generate data
		return {
			output: target,
			width: width,
			height: height,
			background: options.background,
			images: [
				{
					url:
						'data:image/svg+xml;base64,' +
						Buffer.from(content, 'utf8').toString('base64'),
					left: 0,
					top: 0,
					width: width,
					height: height,
				},
			],
		};
	};

	return new Promise((fulfill, reject) => {
		// Parse icon
		if (typeof item === 'string') {
			item = new SVG(item);
		}

		if (item instanceof SVG) {
			let data = scaleSVG(item, target);
			if (!options.parse) {
				// Return raw data for running multiple PhantomJS calls at the same time to speed up building many icons
				fulfill(data);
				return;
			}

			phantom(data)
				.then(res => {
					fulfill(item);
				})
				.catch(err => {
					if (options.reject) {
						reject(err);
					} else {
						fulfill(item);
					}
				});
			return;
		}

		// Parse collection
		if (!(item instanceof Collection)) {
			reject('Invalid arguments.');
			return;
		}

		let data = [],
			results = options.parse ? {} : data,
			collection = item;

		collection.forEach((svg, key) => {
			// Get filename
			let filename = target;
			if (typeof filename === 'function') {
				// Callback
				filename = filename(key, svg, collection, options);
				if (filename === null) {
					return;
				}
			} else {
				// Replace keywords with icon data
				if (filename.indexOf('{icon}') === -1) {
					// No {icon} found - treat target as directory name. Append icon name without prefix
					filename +=
						(filename.length && filename.slice(-1) !== '/' ? '/' : '') +
						key +
						'.png';
				} else {
					filename = filename
						.replace('{icon}', key)
						.replace('{prefix}', collection.prefix)
						.replace('{color}', options.color)
						.replace('{width}', options.width)
						.replace('{height}', options.height);
				}
			}

			// Create target directory
			helpers.mkdir(path.dirname(filename));

			// Get data
			data.push(scaleSVG(svg, filename));

			// Set result
			if (options.parse) {
				results[key] = filename;
			}
		});

		// Return data
		if (!options.parse) {
			fulfill(data);
			return;
		}

		// Parse icons in bulk, 16 icons at a time
		const next = () => {
			let items = data.slice(0, 16);

			if (!items.length) {
				// Done
				fulfill(results);
				return;
			}

			data = data.slice(16);
			phantom(items)
				.then(res => {
					next();
				})
				.catch(err => {
					if (options.reject) {
						reject(err);
						return;
					}
					next();
				});
		};

		next();
	});
};
