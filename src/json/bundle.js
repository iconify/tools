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
const getPrefix = require('./prefix');
const optimize = require('./optimize');
const Collection = require('./json');

/**
 * Default options
 *
 * @type {object}
 */
const defaults = {
    // Use default Iconify.design collections
    defaultCollections: true,

    // Array of custom collections. key = prefix, value = location of json file
    customCollections: {},

    // Array of custom icons. key = icon name with prefix, value = JSON data
    // If icon with same name exists in collection, custom icon will be used instead
    customIcons: {},

    // File to write output to, null if none. Optional because content will also be result of returned Promise
    target: null,

    // Function to add before JSON data
    collectionCode: 'Iconify.addCollection',

    // Function to log errors
    log: console.log,
};

/**
 * Default icons path
 */
let defaultIcons = null;

/**
 * Locate collection file
 *
 * @param {string} prefix
 * @param {object} options
 * @returns {string|null}
 */
function locateFile(prefix, options) {
    if (options.customCollections[prefix] !== void 0) {
        return options.customCollections[prefix];
    }

    if (options.defaultCollections) {
        if (defaultIcons === null) {
            defaultIcons = require('@iconify/json');
        }
        return defaultIcons.locate(prefix);
    }

    return null;
}

/**
 * Create bundle
 *
 * @param {Array} icons List of icons to bundle
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

        // Sort custom icons
        let customIcons = {};
        Object.keys(options.customIcons).forEach(key => {
            let data = getPrefix(key);
            if (customIcons[data.prefix] === void 0) {
                customIcons[data.prefix] = {};
            }
            customIcons[data.prefix][data.icon] = options.customIcons[key];
        });

        // Save custom icons
        let customResults = [];
        Object.keys(customIcons).forEach(prefix => {
            let json = {
                prefix: prefix,
                icons: {}
            };
            Object.keys(customIcons[prefix]).forEach(icon => {
                json.icons[icon] = customIcons[data.prefix][data.icon];
            });
            customResults.push(options.collectionCode + '(' + JSON.stringify(json) + ');');
        });

        // Sort icons by prefix
        let sorted = {};
        icons.forEach(icon => {
            let data = getPrefix(icon);

            if (customIcons[data.prefix] !== void 0 && customIcons[data.prefix][data.icon]) {
                // Overwritten by custom icon
                return;
            }

            if (sorted[data.prefix] === void 0) {
                sorted[data.prefix] = {};
            }
            sorted[data.prefix][data.icon] = true;
        });

        // Create promises for all prefixes
        let promises = [];
        Object.keys(sorted).forEach(prefix => {
            let list = Object.keys(sorted[prefix]),
                file = locateFile(prefix, options);

            promises.push(new Promise((fulfill, reject) => {
                // Load file
                fs.readFile(file, 'utf8', (err, data) => {
                    if (err) {
                        options.log('Collection not found: ' + prefix);
                        fulfill(null);
                        return;
                    }
                    let collection = new Collection(prefix);
                    collection.loadJSON(data);
                    if (!collection.loaded) {
                        options.log('Error loading collection: ' + prefix);
                        fulfill(null);
                        return;
                    }

                    // Get icons
                    let result = collection.getIcons(list);
                    if (!Object.keys(result.icons).length) {
                        options.log('Empty result for collection: ' + prefix);
                        fulfill(null);
                        return;
                    }
                    fulfill(result);
                });
            }));
        });

        // Parse all promises
        Promise.all(promises).then(results => {
            results = results.filter(item => item !== null).map(item => {
                optimize(item);
                return options.collectionCode + '(' + JSON.stringify(item) + ');';
            });

            let result = customResults.concat(results).join('\n');

            if (options.target) {
                try {
                    fs.writeFileSync(options.target, result);
                    options.log('Saved ' + options.target + ' (' + result.length + ')');
                } catch (err) {
                }
            }

            fulfill(result);
        }).catch(err => {
            reject(err);
        });
    });
};