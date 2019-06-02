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

const functions = {
    /**
     * Recursively create directory
     *
     * @param path
     */
    mkdir: path => {
        if (typeof path === 'string' && path === '.') {
            return;
        }

        let dirs = typeof path === 'string' ? path.split('/') : path,
            dir;

        if (dirs.length) {
            dir = '';
            dirs.forEach(part => {
                dir += part;
                if (dir.length) {
                    try {
                        fs.mkdirSync(dir, 0o755);
                    } catch (err) {
                    }
                }
                dir += '/';
            });
        }
    }
};

module.exports = functions;
