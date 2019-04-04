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
const path = require('path');
const child_process = require('child_process');
const crypto = require('crypto');

/**
 * Generate image from data
 *
 * @param {object} data
 * @return {Promise<any>}
 */
module.exports = data => new Promise((fulfill, reject) => {
    let rootDir = path.dirname(path.dirname(path.dirname(__filename))),
        tempDir = rootDir + '/temp',
        cmd = path.dirname(__filename) + '/phantomjs_script.js';

    // Generate temporary file
    data = JSON.stringify(data, null, 4);

    let tempFile = crypto.createHash('md5').update(data).digest('hex') + '-' + Date.now() + '.json',
        tempFilename = tempDir + '/' + tempFile;

    try {
        fs.mkdirSync(tempDir);
    } catch (err) {
    }

    fs.writeFile(tempFilename, data, 'utf8', err => {
        if (err) {
            reject(err);
            return;
        }

        // Execute
        child_process.execFile('phantomjs', [
            cmd,
            tempFilename
        ], {
            cwd: rootDir,
            env: process.env,
            uid: process.getuid()
        }, (error, stdout, stderr) => {
            fs.unlinkSync(tempFilename);
            // console.log(stdout);
            if (error) {
                reject('Error executing: ' + cmd + ': ' + error);
            } else {
                fulfill();
            }
        });
    });
});
