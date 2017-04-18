/**
 * This file is part of the simple-svg-tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

"use strict";

const fs = require('fs');
const Exporter = require('./svg');

const defaults = {
    'export-filename': key => key + '.svg'
};

/**
 * Export collection to directory
 */
module.exports = (collection, target, options) => {
    options = options === void 0 ? {} : options;
    Object.keys(defaults).forEach(key => {
        if (options[key] === void 0) {
            options[key] = defaults[key];
        }
    });

    return new Promise((fulfill, reject) => {
        if (target.slice(-1) === '/') {
            target = target.slice(0, target.length - 1);
        }

        // Export all files
        Promise.all(collection.keys().map(key => Exporter(collection.items[key], target + '/' + options['export-filename'](key, collection, {reject: false})))).then(results => {
            let count = 0;
            results.forEach(result => {
                if (result !== null) {
                    count ++;
                }
            });
            fulfill(count);
        }).catch(err => {
            reject();
        });
    });
};
