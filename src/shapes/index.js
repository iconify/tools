/**
 * This file is part of the simple-svg-tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

"use strict";

const cheerio = require('cheerio');
const changeOptions = require('./options');

/**
 * Default options. See also ./options.js
 *
 * @type {object}
 */
const defaults = {
    // True if nodes should be returned instead of number of nodes
    returnNodes: false,
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
        options = options === void 0 ? {} : options;
        changeOptions(options, defaults);

        let $root = svg.$svg(':root'),
            shapeIndex = options.shapeStartIndex,
            total = 0,
            nodes = [];

        function checkChildElements($node) {
            $node.children().each((index, child) => {
                let $child = cheerio(child),
                    tag = child.tagName;

                if (options.ignoreTags.indexOf(tag) !== -1) {
                    return;
                }

                if (options.shapeTags.indexOf(tag) !== -1) {
                    // Callback should add/remove attributes
                    if (options.shapeCallback === null || options.shapeCallback({
                        $node: $child,
                        node: child,
                        svg: svg,
                        index: shapeIndex,
                        tag: tag,
                        options: options
                    }) !== false) {
                        // Add/remove attribute
                        if (options.remove) {
                            $child.removeAttr(options.shapeAttribute);
                        } else {
                            $child.attr(options.shapeAttribute, options.shapeAttributeValue.replace('{index}', shapeIndex));
                        }
                    }

                    if (options.returnNodes) {
                        nodes.push($child);
                    }
                    shapeIndex ++;
                    total ++;
                }

                checkChildElements($child);
            });
        }

        try {
            checkChildElements($root);
        } catch (err) {
            reject(err);
            return;
        }

        fulfill(options.returnNodes ? nodes : total);
    });
};