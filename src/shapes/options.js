/**
 * This file is part of the @json/tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

"use strict";

/**
 * Default options for shape functions
 *
 * @type {object}
 */
const defaults = {
    // List of tags that should be ignored
    ignoreTags: ['style', 'mask', 'clipPath', 'defs'],

    // List of shape tags
    shapeTags: ['path', 'circle', 'line', 'polygon', 'polyline', 'rect', 'ellipse'],

    // Index for first shape
    shapeStartIndex: 0,

    // Attribute to add to tags
    shapeAttribute: 'data-shape-index',

    // Value of attribute. {index} is replaced by index number
    shapeAttributeValue: '{index}',

    // True if tags should be removed rather than added
    remove: false,

    // Callback for shape. function({$node, node, index, tag, svg})
    // If callback returns false, attribute will not be added/removed
    shapeCallback: null,
};

module.exports = (options, moduleDefaults) => {
    Object.keys(defaults).forEach(key => {
        if (options[key] === void 0) {
            options[key] = defaults[key];
        }
    });
    Object.keys(moduleDefaults).forEach(key => {
        if (options[key] === void 0) {
            options[key] = moduleDefaults[key];
        }
    });
};
