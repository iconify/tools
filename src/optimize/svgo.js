/**
 * This file is part of the simple-svg-tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

"use strict";

const svgo = require('svgo');

/**
 * Default options
 *
 * @type {object}
 */
const defaults = {
    'id-prefix': 'svg-'
};

/**
 * SVGO optimization
 *
 * @param {SVG|string} svg SVG object
 * @param {object} [options] Options
 * @return {Promise}
 */
module.exports = (svg, options) => {
    // Set options
    options = options === void 0 ? {} : options;
    Object.keys(defaults).forEach(key => {
        if (options[key] === void 0) {
            options[key] = defaults[key];
        }
    });

    return new Promise((fulfill, reject) => {
        try {
            let content = typeof svg === 'string' ? svg : svg.toString(),
                plugins = [{
                    removeTitle: true
                }, {
                    removeDesc: true
                }, {
                    removeRasterImages: true
                }, {
                    convertShapeToPath: true
                }, {
                    mergePaths: false
                }];

            if (options['id-prefix'] !== null) {
                plugins.push({
                    cleanupIDs: {
                        remove: true,
                        prefix: options['id-prefix']
                    }
                });
            }

            (new svgo({
                plugins: plugins
            })).optimize(content, result => {
                if (!result || !result.info || !result.data) {
                    return reject(result.error ? result.error : 'Invalid SVG file');
                }

                // Update SVG object or return string
                if (typeof svg === 'string') {
                    fulfill(result.data);
                } else {
                    svg.load(result.data);
                    fulfill(svg);
                }
            });
        } catch (err) {
            reject(err);
        }
    });
};
