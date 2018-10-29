/**
 * This file is part of the @iconify/tools package.
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
 * Default options
 *
 * @type {object}
 */
const defaults = {
    // Function to add before JSON data
    collectionCode: 'SimpleSVG.addCollection',
};

/**
 * Convert SVG icons to JS script to move icons to separate file
 *
 * @param {object} icons List of icons. Key = icon name, value = SVG object or string
 * @param {object} [options] Options
 * @returns {Promise}
 */
module.exports = (icons, options) => {
    return new Promise((fulfill, reject) => {
        // Merge options
        options = options === void 0 ? {} : options;
        Object.keys(defaults).forEach(key => {
            if (options[key] === void 0) {
                options[key] = defaults[key];
            }
        });

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
                jsonp.push(options.collectionCode + '(' + JSON.stringify(data) + ');');
            });

            fulfill(jsonp.join('\n'));
        }
    });
};
