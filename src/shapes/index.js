/**
 * This file is part of the @iconify/tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const changeOptions = require('./options');

/**
 * Default options. See also ./options.js
 *
 * @type {object}
 */
const defaults = {
	// True if nodes should be returned instead of number of nodes
	returnNodes: false,

	// True if shapes should be checked for fill/stroke. Works only if shapeCallback is set.
	// fill/stroke properties are added to callback argument. Value is false if disabled, string if set
	checkFillStroke: false,
};

/**
 * Add shape index to tags
 *
 * Must run SVGO optimization before using this module!
 *
 * @param {SVG} svg SVG object
 * @param {object} options Options
 * @return {Promise}
 */
module.exports = (svg, options) => {
	return new Promise((fulfill, reject) => {
		options = options === void 0 ? Object.create(null) : options;
		changeOptions(options, defaults);

		let $root = svg.$svg(':root'),
			shapeIndex = options.shapeStartIndex,
			total = 0,
			nodes = [];

		function checkChildElements($node, style) {
			$node.children().each((index, child) => {
				let $child = svg.$svg(child),
					tag = child.tagName;

				if (options.ignoreTags.indexOf(tag) !== -1) {
					return;
				}

				// Merge fill/stroke
				let childStyle;
				if (options.checkFillStroke) {
					childStyle = Object.create(null);
					['fill', 'stroke'].forEach((attr) => {
						if (child.attribs && child.attribs[attr] !== void 0) {
							let value = child.attribs[attr].toLowerCase();
							childStyle[attr] =
								value === '' || value === 'inherit'
									? style[attr]
									: value === 'none'
									? false
									: child.attribs[attr];
						} else {
							childStyle[attr] = style[attr];
						}
					});
				} else {
					childStyle = style;
				}

				// Check if item is a shape
				if (options.shapeTags.indexOf(tag) !== -1) {
					// Callback should add/remove attributes
					let callbackData;
					if (options.shapeCallback !== null) {
						callbackData = {
							$node: $child,
							node: child,
							svg: svg,
							index: shapeIndex,
							tag: tag,
							options: options,
						};
						if (options.checkFillStroke) {
							callbackData.fill = childStyle.fill;
							callbackData.stroke = childStyle.stroke;
						}
					}
					if (
						options.shapeCallback === null ||
						options.shapeCallback(callbackData) !== false
					) {
						// Add/remove attribute
						if (options.remove) {
							$child.removeAttr(options.shapeAttribute);
						} else {
							$child.attr(
								options.shapeAttribute,
								options.shapeAttributeValue.replace('{index}', shapeIndex)
							);
						}
					}

					if (options.returnNodes) {
						nodes.push($child);
					}
					shapeIndex++;
					total++;
				}

				// Check child elements
				checkChildElements($child, childStyle);
			});
		}

		try {
			checkChildElements($root, {
				fill: '#000',
				stroke: false,
			});
		} catch (err) {
			reject(err);
			return;
		}

		fulfill(options.returnNodes ? nodes : total);
	});
};
