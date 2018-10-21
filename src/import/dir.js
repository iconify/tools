/**
 * This file is part of the @json/tools package.
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
    // Prefix for icons
    prefix: null,

    // Check sub-directories
    includeSubDirs: true,

    // Treat subdirectory as prefix: "fa-pro/icon.svg" -> prefix = "fa-pro"
    directoryAsPrefix: false,

    // If filename includes prefix, such as "fa-pro/fa-pro-home"
    // this option will remove duplicate prefix
    removePrefix: false,

    // Function to create keyword from filename
    keywordCallback: keyword,

    // If false, error will be logged when files with duplicate names are found. See "log" option
    ignoreDuplicates: false,

    // Array of files to ignore. Each entry is keyword or full file name
    // It could also be function(name) that should return true if file is ignored, false if not
    ignoreFiles: false,

    // Options for SVG importer. See "svg.js" in this directory
    contentCallback: null, // callback to call to test content
    minify: true,
    headless: true,

    // Function to log errors. function(message)
    log: null,

    // Functions to overwrite for custom importer or scanner (used for unit testing)
    scan: scan,
    importer: Importer
};

/**
 * Scan directory. Returns array of svg files
 *
 * @param {string} dir
 * @param {string} prefix
 * @param {object} options
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
 * Get keyword from file
 *
 * @param {string} key
 * @param {string} file
 * @param {object} options
 * @returns {string}
 */
function keyword(key, file, options) {
    let result = key.toLowerCase().replace(/_/g, '-').replace(/[^a-zA-Z0-9\-_:]/g, '').replace(/--*/, '-');
    if (options.prefix && options.removePrefix && result.slice(0, options.prefix.length + 1) === options.prefix + '-') {
        result = result.slice(options.prefix.length + 1);
    }
    return result;

}

/**
 * Import files from directory
 *
 * @param {string} source Source directory
 * @param {object} [options] List of options
 */
module.exports = (source, options) => {
    options = options === void 0 ? {} : options;
    Object.keys(defaults).forEach(key => {
        if (options[key] === void 0) {
            options[key] = defaults[key];
        }
    });

    // Check if name (filename or keyword) is ignored
    let isIgnored = name => {
        if (options.ignoreFiles === false) {
            return false;
        }
        if (typeof options.ignoreFiles === 'function') {
            return option.ignoreFiles(name);
        }
        return typeof options.ignoreFiles === 'object' && options.ignoreFiles.indexOf(name) !== -1;
    };

    // Return promise
    return new Promise((fulfill, reject) => {
        let promises = [],
            keywords = [],
            filenames = [],
            collection = new Collection(options.prefix);

        // Remove trailing slash and find all files
        if (source.slice(-1) === '/') {
            source = source.slice(0, source.length - 1);
        }
        let files = options.scan(source, '', options);

        // Get promise for each file
        files.forEach(file => {
            // Check if keyword is ignored
            if (isIgnored(file)) {
                return;
            }

            // Get keyword
            let fileSplit = file.split('/'),
                keyword = fileSplit.pop().split('.')[0];

            if (options.directoryAsPrefix) {
                let dir;
                if (fileSplit.length) {
                    dir = fileSplit.pop();
                } else {
                    dir = source.split('/').pop();
                }
                if (options.removeDirectoryPrefix && keyword.slice(0, dir.length + 1) === dir + '-') {
                    keyword = keyword.slice(dir.length + 1);
                }
                keyword = dir + ':' + keyword;
            }

            keyword = options.keywordCallback(keyword, file, options);

            if (typeof keyword !== 'string') {
                return;
            }

            if (!keyword.length) {
                if (options.log) {
                    options.log('Cannot extract keyword from file: ' + file);
                }
                return;
            }

            if (keywords.indexOf(keyword) !== -1) {
                if (options.log && !options.ignoreDuplicates) {
                    options.log('Duplicate keyword: ' + keyword);
                }
                return;
            }

            // Check if keyword is ignored
            if (isIgnored(keyword)) {
                return;
            }

            // Load file
            filenames.push(file);
            keywords.push(keyword);
            promises.push(options.importer(source + '/' + file, {
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
                    if (options.log) {
                        options.log('Failed to load: ' + filenames[index]);
                    }
                    return;
                }
                collection.add(keyword, results[index]);
            });

            // Detect prefix
            if (options.prefix === null) {
                collection.findCommonPrefix(true);
            }

            fulfill(collection);
        }).catch(err => {
            reject(err);
        });
    });
};
