/**
 * This file is part of the @iconify/tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

"use strict";

const cheerio = require('cheerio');
const svgo = require('svgo');
const SVG = require('../svg');
const cleanUpFlags = require('./flags');

/**
 * Default options
 *
 * @type {object}
 */
const defaults = {
    'id-prefix': 'svg-',
    mergePaths: false,
    convertShapeToPath: true,
    noSpaceAfterFlags: false
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
    options = options === void 0 ? Object.create(null) : options;
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
                    convertShapeToPath: options.convertShapeToPath
                }];

            if (!options.noSpaceAfterFlags) {
                plugins.push({
                    mergePaths: options.mergePaths === false ? false : {
                        noSpaceAfterFlags: false
                    }
                });
                plugins.push({
                    convertPathData: {
                        noSpaceAfterFlags: false
                    }
                })
            } else {
                plugins.push({
                    mergePaths: options.mergePaths
                });
            }

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
            })).optimize(content).then(result => {
                if (!result || !result.info || !result.data) {
                    return reject(result.error ? result.error : 'Invalid SVG file');
                }

                let code;
                try {
                    code = options.noSpaceAfterFlags ? result.data : cleanUpFlags(result.data);
                } catch (err) {
                    return reject(err);
                }

                // Update SVG object or return string
                if (typeof svg === 'string') {
                    fulfill(code);
                } else {
                    svg.load(code);
                    fulfill(svg);
                }
            }).catch(err => {
                return reject(err);
            });
        } catch (err) {
            reject(err);
        }
    });
};
