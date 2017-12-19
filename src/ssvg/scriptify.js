/**
 * This file is part of the simple-svg-tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

"use strict";

const SVG = require('../svg');
const getPrefix = require('./prefix');
const Optimize = require('./optimize');

/**
 * Convert SVG icons to JS script to move icons to separate file
 *
 * @param {object} icons List of icons. Key = icon name, value = SVG object or string
 * @returns {Promise}
 */
module.exports = icons => {
    return new Promise((fulfill, reject) => {
        let results = {},
            rejected = false;
        Object.keys(icons).forEach(key => {
            if (rejected) {
                return;
            }

            let svg = typeof icons[key] === 'string' ? new SVG(icons[key]) : icons[key];
            if (!(svg instanceof SVG)) {
                reject('Bad icon ' + key);
                rejected = true;
                return;
            }

            let item = {
                body: svg.getBody(),
                width: svg.width,
                height: svg.height
            };
            ['left', 'top'].forEach(attr => {
                if (svg[attr] !== 0) {
                    item[attr] = svg[attr];
                }
            });

            let icon = getPrefix(key);
            if (results[icon.prefix] === void 0) {
                results[icon.prefix] = {};
            }
            results[icon.prefix][icon.icon] = item;
        });

        if (!rejected) {
            let jsonp = [];
            Object.keys(results).forEach(prefix => {
                let data = {
                    prefix: prefix,
                    icons: results[prefix]
                };
                Optimize(data);
                jsonp.push('SimpleSVG.addCollection(' + JSON.stringify(data) + ');');
            });

            fulfill(jsonp.join('\n'));
        }
    });
};
