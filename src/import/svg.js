/**
 * This file is part of the @json/tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

"use strict";

const fs = require('fs');
const SVG = require('../svg');

const defaults = {
    reject: true,
    contentCallback: null,
    headless: true,
    minify: true
};

/**
 * Import from .svg file
 */
module.exports = (source, options) => {
    options = options === void 0 ? {} : options;
    Object.keys(defaults).forEach(key => {
        if (options[key] === void 0) {
            options[key] = defaults[key];
        }
    });

    return new Promise((fulfill, reject) => {
        fs.readFile(source, 'utf8', (err, data) => {
            let svg;

            if (err) {
                if (options.reject) {
                    reject(err);
                } else {
                    fulfill(null);
                }
            } else {
                if (options.contentCallback) {
                    data = options.contentCallback(data);
                }
                try {
                    svg = new SVG(data);
                } catch (err) {
                    if (options.reject) {
                        reject('Invalid SVG file');
                    } else {
                        fulfill(null);
                    }
                }
                fulfill(svg);
            }
        });
    });
};
