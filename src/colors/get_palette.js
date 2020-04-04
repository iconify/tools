/**
 * This file is part of the @iconify/tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const cheerio = require('cheerio');
const Color = require('cyberalien-color');
const Tokenizer = require('simple-tokenizer');

/**
 * Get colors used in SVG image
 *
 * Must run SVGO optimization before running this script!
 *
 * @param {SVG} svg SVG object
 * @return {Promise}
 */
module.exports = svg => {
	return new Promise((fulfill, reject) => {
		let $root = svg.$svg(':root'),
			colors = [],
			notices = [];

		/**
		 * Add color to palette
		 *
		 * @param {string} value
		 */
		function addColor(value) {
			let clr = Color.fromString(value);
			if (clr === null) {
				// Keywords
				switch (value.toLowerCase()) {
					case 'currentcolor':
						value = 'currentColor';
						break;

					default:
						return;
				}
			} else {
				value = clr.toString({ compress: true });
			}

			// Add to list of colors
			if (colors.indexOf(value) === -1) {
				colors.push(value);
			}
		}

		/**
		 * Check style
		 *
		 * @param {string} code
		 */
		function scanStyle(code) {
			notices.push('Style attribute found');

			let tokens = new Tokenizer({
				splitRules: true,
			}).tokenize(code);

			tokens.forEach(token => {
				if (token.token === 'rule') {
					let key = token.key.toLowerCase();
					switch (key) {
						case 'stop-color':
						case 'fill':
						case 'stroke':
							addColor(token.value);
							break;
					}
				}
			});
		}

		/**
		 * Check shape
		 *
		 * @param {object} $tag
		 * @param {object} tag
		 */
		function scanElement($tag, tag) {
			// Check attributes
			if (tag.attribs) {
				Object.keys(tag.attribs).forEach(attr => {
					let value = tag.attribs[attr];

					switch (attr) {
						case 'stop-color':
						case 'fill':
						case 'stroke':
							addColor(value);
							break;

						case 'style':
							scanStyle(value);
							break;
					}
				});
			}

			scanChildElements($tag);
		}

		/**
		 * Check child elements of tag
		 *
		 * @param {object} $tag
		 */
		function scanChildElements($tag) {
			$tag.children().each((index, child) => {
				let $child = cheerio(child);

				switch (child.tagName) {
					case 'mask': // do not scan colors inside mask
					case 'clipPath': // do not scan colors inside clip path
						return;

					case 'style':
						scanStyle($child.text());
						return;

					default:
						scanElement($child, child);
				}
			});
		}

		scanChildElements($root);

		fulfill({
			colors: colors,
			notices: notices,
		});
	});
};
