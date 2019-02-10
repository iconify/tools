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

const defaults = {
    reject: true
};

/**
 * Export to .svg file
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
        fs.writeFile(target, svg.toString(), 'utf8', err => {
            if (err) {
                // Attempt to create directories
                let dirs = target.split('/'),
                    dir;

                dirs.pop(); // remove file name
                dir = '';

                while (dirs.length) {
                    dir += (dir.length ? '/' : '') + dirs.shift();
                    try {
                        fs.mkdirSync(dir);
                    } catch (err) {
                    }
                }

                fs.writeFile(target, svg.toString(), 'utf8', err => {
                    if (err) {
                        if (options.reject) {
                            reject(err);
                        } else {
                            fulfill(null);
                        }
                    } else {
                        fulfill(svg);
                    }
                });
            } else {
                fulfill(svg);
            }
        });
    });
};
