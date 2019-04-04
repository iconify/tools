/**
 * This file is part of the @iconify/tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

"use strict";

const fs = require('fs');
const phantom = require('./phantomjs');

const defaults = {
    color: '#000',
    background: 'transparent',
    height: null,
    reject: true
};

/**
 * Export to .png file
 *
 * @returns {Promise}
 */
module.exports = (svg, target, options) => {
    options = options === void 0 ? Object.create(null) : options;
    Object.keys(defaults).forEach(key => {
        if (options[key] === void 0) {
            options[key] = defaults[key];
        }
    });

    return new Promise((fulfill, reject) => {
        let width = svg.width,
            height = svg.height;

        if (typeof options.height === 'number' && options.height !== height) {
            // Scale
            width = width * options.height / height;
            height = options.height;
        }

        // Get raw SVG
        let content = svg.toString();
        content = content.replace(/currentColor/g, options.color);

        // Generate data
        let data = {
            output: target,
            width: width,
            height: height,
            background: options.background,
            images: [{
                url: 'data:image/svg+xml;base64,' + Buffer.from(content, 'utf8').toString('base64'),
                left: 0,
                top: 0,
                width: width,
                height: height
            }]
        };

        // Process it
        phantom(data).then(res => {
            fulfill(svg);
        }).catch(err => {
            if (reject) {
                reject(err);
            } else {
                fulfill(svg);
            }
        })
    });
};
