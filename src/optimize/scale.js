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
 * Scale SVG
 *
 * @param {SVG} svg SVG object
 * @param {number} scale
 * @return {Promise}
 */
module.exports = (svg, scale) => {
    return new Promise((fulfill, reject) => {
        try {
            let width = svg.width * scale,
                height = svg.height * scale,
                left = svg.left * scale,
                top = svg.top * scale,
                content = '<svg width="' + width + '" height="' + height + '" viewBox="' + left + ' ' + top + ' ' + width + ' ' + height + '" xmlns="http://www.w3.org/2000/svg">' +
                    '<g transform="scale(' + scale + ')">' +
                    svg.getBody() +
                    '</g></svg>';

            (new svgo({
                plugins: [{
                    mergePaths: false
                }]
            })).optimize(content, result => {
                if (!result || !result.info || !result.data) {
                    return reject(result.error ? result.error : 'Invalid SVG file');
                }

                // Update SVG object
                svg.load(result.data);
                fulfill(svg);
            });
        } catch (err) {
            reject(err);
        }
    });
};
