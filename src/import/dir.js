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
const Importer = require('./svg');
const Collection = require('../collection');

const defaults = {
    includeSubDirs: true,
    directoryAsPrefix: false,
    // If directoryAsPrefix is enabled and filename includes prefix, such as "fa-pro/fa-pro-home"
    // this option will remove duplicate prefix
    removeDirectoryPrefix: false,
    keywordCallback: key => key.toLowerCase().replace(/_/g, '-').replace(/[^a-zA-Z0-9\-_:]/g, '').replace(/--*/, '-'),
    ignoreDuplicates: false,
    ignoreFiles: false,
    contentCallback: null, // callback to call to test content
    debug: false,
    minify: true,
    headless: true,
    log: console.log
};

/**
 * Scan directory
 *
 * @param dir
 * @param prefix
 * @param options
 * @return {Array}
 */
function scan(dir, prefix, options) {
    let results = [];

    fs.readdirSync(dir).forEach(file => {
        let filename = dir + '/' + file;
        if (fs.lstatSync(filename).isDirectory()) {
            if (options.includeSubDirs) {
                results = results.concat(scan(filename, prefix + file + '/', options));
            }
        } else {
            if (file.toLowerCase().slice(-4) === '.svg') {
                results.push(prefix + file);
            }
        }
    });

    return results;
}

/**
 * Import files from directory
 */
module.exports = (source, options) => {
    options = options === void 0 ? {} : options;
    Object.keys(defaults).forEach(key => {
        if (options[key] === void 0) {
            options[key] = defaults[key];
        }
    });

    // Old option
    if (options['include-subdirs'] !== void 0) {
        options.includeSubDirs = options['include-subdirs'];
    }

    return new Promise((fulfill, reject) => {
        let promises = [],
            keywords = [],
            filenames = [],
            collection = new Collection();

        // Remove trailing slash and find all files
        if (source.slice(-1) === '/') {
            source = source.slice(0, source.length - 1);
        }
        let files = scan(source, '', options);

        // Get promise for each file
        files.forEach(file => {
            // Get keyword
            let fileSplit = file.split('/'),
                keyword = fileSplit.pop().split('.')[0];

            if (options.directoryAsPrefix && fileSplit.length) {
                let dir = fileSplit.pop();
                if (options.removeDirectoryPrefix && keyword.slice(0, dir.length + 1) === dir + '-') {
                    keyword = keyword.slice(dir.length + 1);
                }
                keyword = dir + ':' + keyword;
            }
            keyword = options.keywordCallback(keyword, file);

            if (typeof keyword !== 'string') {
                return;
            }

            if (!keyword.length) {
                if (options.debug) {
                    options.log('Cannot extract keyword from file: ' + file);
                }
                return;
            }

            if (keywords.indexOf(keyword) !== -1) {
                if (options.debug && !options.ignoreDuplicates) {
                    options.log('Duplicate keyword: ' + keyword);
                }
                return;
            }

            // Check if file is ignored
            if (options.ignoreFiles && options.ignoreFiles.indexOf(keyword) !== -1) {
                return;
            }

            // Load file
            filenames.push(file);
            keywords.push(keyword);
            promises.push(Importer(source + '/' + file, {
                reject: false,
                contentCallback: options.contentCallback,
                headless: options.headless,
                minify: options.minify
            }));
        });

        // Load all files
        Promise.all(promises).then(results => {
            keywords.forEach((keyword, index) => {
                if (results[index] === null) {
                    if (options.debug) {
                        options.log('Failed to load: ' + filenames[index]);
                    }
                    return;
                }
                collection.add(keyword, results[index]);
            });
            fulfill(collection);
        }).catch(err => {
            reject(err);
        });
    });
};
