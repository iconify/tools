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
    // Function to generate filename for icon
    exportFilename: exportFilename,

    // True if prefix should be included in filename
    includePrefix: true,

    // true: prefix/icon.svg, false: prefix-icon.svg
    prefixAsDirectory: false,

    // Custom prefix string to override collection prefix. False if none
    customPrefix: false,
};

/**
 * Generate filename
 *
 * @param {string} key
 * @param {string} prefix
 * @param {object} options
 * @returns {string}
 */
function exportFilename(key, prefix, options) {
    if (prefix === '') {
        // Check for complex prefix
        let list = key.split(':');
        if (list.length === 2) {
            prefix = list[0];
            key = list[1];
        }
    }

    return (
        options.includePrefix && prefix !== '' ? (
            options.prefixAsDirectory ? prefix + '/' : prefix + '-'
        ) : ''
    ) + key + '.svg';
}

/**
 * Export collection to directory
 *
 * @returns {Promise}
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
        Promise.all(collection.keys(false).map(
            key => Exporter(
                collection.items[key],
                target + '/' + options.exportFilename(key, options.customPrefix === false ? collection.prefix : options.customPrefix, options),
                {
                    reject: false
                }
            ))
        ).then(results => {
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
