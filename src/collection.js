/**
 * This file is part of the @json/tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

"use strict";

const crypto = require('crypto');
const SVG = require('./svg');

/**
 * Default values for merge() options
 *
 * @type {object}
 */
const defaultMergeOptions = {
    // True if icons that exist in older collection, but missing in new collection should be marked as hidden
    markAsHidden: true,

    // True if missing icons should be copied. If false, missing icons will be added as aliases instead.
    copyMissingIcons: false,

    // True if aliases should be checked
    checkAliases: true,

    // True if characters should be checked
    checkChars: true,

    // True if categories should be checked
    checkCategories: true,

    // Function to hash SVG content to compare different icons
    // viewBox and body are merged because order of attributes in toString() might be different for identical icons
    hashCallback: (key, svg) => crypto.createHash('md5').update('<viewBox="' + svg.left + ' ' + svg.top + ' ' + svg.width + ' ' + svg.height + '"/>' + svg.getBody()).digest('hex')
};

/**
 * Class for storing collection of SVG objects
 */
class Collection {
    /**
     * Constructor
     *
     * @param {string|Collection} [param] Items prefix or collection to clone
     */
    constructor(param) {
        this.items = {};
        this.prefix = typeof param === 'string' ? param : '';

        if (param instanceof Collection) {
            // Clone collection
            param.forEach((item, key) => {
                this.items[key] = item;
            });
            this.prefix = param.prefix;
        }
    }

    /**
     * Add item to collection
     *
     * @param {string} key Item name.
     *      If collection has prefix set, item name should not have prefix.
     * @param {SVG} item
     */
    add(key, item) {
        if (item instanceof SVG) {
            this.items[key] = item;
        }
    }

    /**
     * Remove item from collection
     *
     * @param {string} key Item name.
     *      If collection has prefix set, item name should not have prefix.
     */
    remove(key) {
        delete this.items[key];
    }

    /**
     * Change key
     *
     * @param {string} oldKey Old key.
     * @param {string} newKey New key.
     * @return {boolean}
     */
    rename(oldKey, newKey) {
        if (this.items[newKey] !== void 0 || this.items[oldKey] === void 0) {
            return false;
        }
        this.items[newKey] = this.items[oldKey];
        delete this.items[oldKey];
        return true;
    }

    /**
     * Find common prefix in icon names.
     * This function works only if all icons use "-" as prefix.
     * Important: this function ignores icon aliases and other custom properties.
     *
     * @param {boolean} [updateIcons] True if function should update prefix in collection. Default = true
     * @return {string}
     */
    findCommonPrefix(updateIcons) {
        if (this.prefix !== '') {
            // Prefix is already set
            return this.prefix;
        }

        // Find all possible prefixes
        let commonPrefix = {},
            complexPrefix = '';

        let keys = this.keys();
        for (let i = 0; i < keys.length; i++) {
            let parts = keys[i].split(':');
            if (parts.length > 1) {
                if (complexPrefix === '' || parts[0] === complexPrefix) {
                    complexPrefix = parts[0];
                    continue;
                }
                // Cannot combine items with complex prefixes
                return '';
            }

            parts = keys[i].split('-');
            let key = parts.shift(),
                count = 1;
            while (parts.length) {
                if (commonPrefix[count] === void 0) {
                    commonPrefix[count] = key;
                } else if (commonPrefix[count] !== key) {
                    break;
                }

                key = key + '-' + parts.shift();
                count ++;
            }
            commonPrefix[count] = false;
        }

        // Find smallest counter with only 1 item
        let count = 1;
        while (typeof commonPrefix[count] === 'string') {
            count ++;
        }

        let newPrefix;

        // Still 1? Nothing to do
        if (count === 1) {
            if (commonPrefix[1] !== void 0) {
                // No items with simple prefixes
                return '';
            }
            // All items had complex prefixes?
            newPrefix = complexPrefix;
        } else {
            // More than 1? Found some common parts
            newPrefix = commonPrefix[count - 1];
            if (complexPrefix !== '') {
                // Both complex and simple prefixes are found, check if they match
                if (
                    newPrefix !== complexPrefix &&
                    (newPrefix.slice(0, complexPrefix.length + 1) !== (complexPrefix + '-'))
                ) {
                    // Prefixes don't match
                    return '';
                }
                newPrefix = complexPrefix;
            }
        }

        if (!updateIcons) {
            return newPrefix;
        }

        // Update all items
        this.prefix = newPrefix;

        let items = {};
        let start = newPrefix.length + 1;
        Object.keys(this.items).forEach(key => {
            items[key.slice(start)] = this.items[key];
        });
        this.items = items;

        return this.prefix;
    }

    /**
     * Get number of items
     *
     * @return {Number}
     */
    length() {
        return Object.keys(this.items).length;
    }

    /**
     * Get item keys
     *
     * @param {boolean} [prefixed] True if results must include prefix
     * @return {Array}
     */
    keys(prefixed) {
        let results = Object.keys(this.items);
        if (prefixed && this.prefix !== '') {
            results = results.map(item => this.prefix + ':' + item);
        }
        return results;
    }

    /**
     * Run callback on all items
     *
     * @param callback
     */
    forEach(callback) {
        Object.keys(this.items).forEach(key => {
            callback(this.items[key], key, this.prefix);
        });
    }

    /**
     * Run custom promise on all items
     *
     * Example:
     *  collection.promiseAll(svg => somePromise(svg)).then(
     *    results => {
     *      Object.keys(results).forEach(key => {
     *        ... // key = collection key, results[key] = xml
     *      });
     *    }
     *  );
     *
     *
     * @param {function} promise Callback to return Promise for item: callback(svg, key, prefix)
     * @return {Promise}
     */
    promiseAll(promise) {
        return this._runPromises(key => promise(this.items[key], key, this.prefix));
    }

    /**
     * Run custom promise on all items.
     * Same as promiseAll(), but executes each promise separately and result is different.
     *
     * Result is an object: {
     *      success: list of successful promises,
     *      error: list of failed promises
     *  }
     *
     * Each list in result is object where key is icon key, value is result or error.
     *
     * Rejected object only contains "error" part of result.
     *
     * @param {function} promise Callback to return Promise for item: callback(svg, key, prefix)
     * @param {boolean} [stopOnError] True if execution should halt upon finding error. Default = false
     *      If false, promise will be fulfilled unless all promises fail
     * @returns {Promise}
     */
    promiseEach(promise, stopOnError) {
        let items = this.items,
            prefix = this.prefix;

        stopOnError = stopOnError === true;

        return new Promise((fulfill, reject) => {
            // Convert to arrays
            let keys = Object.keys(items),
                failed = 0,
                success = 0,
                results = {
                    success: {},
                    error: {},
                    skipped: {}
                };

            function next() {
                let key = keys.shift();
                if (key === void 0) {
                    return done();
                }

                // Get promise
                let func = promise(items[key], key, prefix);
                if (func === null) {
                    results.skipped[key] = true;
                    process.nextTick(next);
                    return;
                }

                // Run promise
                func.then(result => {
                    results.success[key] = result;
                    success ++;

                    process.nextTick(next);
                }).catch(err => {
                    results.error[key] = err;
                    failed ++;

                    if (stopOnError) {
                        reject(results.error);
                    } else {
                        process.nextTick(next);
                    }
                });
            }

            function done() {
                if (!success && failed) {
                    reject(results.error);
                } else {
                    fulfill(results);
                }
            }

            next();
        });
    }

    /**
     * Run promise on all items
     *
     * @param {function} callback Function that returns Promise for one item (key, prefix)
     * @return {Promise}
     * @private
     */
    _runPromises(callback) {
        let prefix = this.prefix;

        return new Promise((fulfill, reject) => {
            // Convert to arrays
            let keys = Object.keys(this.items),
                promises = [],
                resultKeys = [];

            keys.forEach((key, index) => {
                let result = callback(key, prefix);
                if (result !== null) {
                    promises.push(result);
                    resultKeys.push(key);
                }
            });

            // Run all promises
            Promise.all(promises).then(results => {
                let filtered = {};
                resultKeys.forEach((key, index) => {
                    filtered[key] = results[index];
                });
                fulfill(filtered);
            }).catch(err => {
                reject(err);
            });
        });
    }

    /**
     * Merge collection with older version of same collection
     *
     * @param {Collection} oldCollection Collection to merge with
     * @param {object} [options]
     * @returns {object|string} String on error, object with statistics on success
     */
    merge(oldCollection, options) {
        if (this.prefix !== oldCollection.prefix) {
            return 'Cannot merge collections with different prefixes.';
        }

        let results = {
            identical: 0, // number of icons that are identical
            updated: 0, // number of icons that are different
            removed: 0, // number of icons that were missing in this collection
            renamed: 0 // number of icons that were renamed
        };

        // Check options
        options = options ? options : {};
        Object.keys(defaultMergeOptions).forEach(key => {
            if (options[key] === void 0) {
                options[key] = defaultMergeOptions[key];
            }
        });

        let oldKeys = oldCollection.keys(),
            newKeys = this.keys();

        // Find all aliases and hash all icons
        let newAliases = {},
            newHashes = {},
            oldHashes = {},
            newChars = {};

        newKeys.forEach(key => {
            let svg = this.items[key];
            newHashes[key] = options.hashCallback(key, svg, this);
            if (options.checkAliases && svg.aliases !== void 0) {
                svg.aliases.forEach(alias => {
                    if (typeof alias === 'string') {
                        newAliases[alias] = key;
                    } else {
                        newAliases[alias.name] = key;
                    }
                });
            }
            if (options.checkChars && svg.char !== void 0) {
                newChars[svg.char] = key;
            }
        });
        oldKeys.forEach(key => {
            let svg = oldCollection.items[key];
            oldHashes[key] = options.hashCallback(key, svg, oldCollection);
        });

        // Check each old file
        oldKeys.forEach(oldKey => {
            let oldSVG = oldCollection.items[oldKey];

            if (newHashes[oldKey] !== void 0) {
                // Item exists. Check aliases
                if (newHashes[oldKey] !== oldHashes[oldKey]) {
                    results.updated ++;
                } else {
                    results.identical ++;
                }

                let newSVG = this.items[oldKey];

                // Check all aliases
                if (options.checkAliases && oldSVG.aliases) {
                    oldSVG.aliases.forEach(alias => {
                        let name = typeof alias === 'string' ? alias : alias.name;
                        if (newAliases[name] === void 0 && newHashes[name] === void 0) {
                            // Missing alias
                            if (this.items[oldKey].aliases === void 0) {
                                this.items[oldKey].aliases = [];
                            }
                            this.items[oldKey].aliases.push(alias);
                            newAliases[name] = oldKey;
                        }
                    });
                }

                // Add character if its missing
                if (options.checkChars && oldSVG.char !== void 0) {
                    let char = oldSVG.char;
                    if (newChars[char] === void 0 && newSVG.char === void 0) {
                        newSVG.char = oldSVG.char;
                        newChars[char] = oldKey;
                    }
                }

                // Add category if its missing
                if (options.checkCategories && oldSVG.category !== void 0 && newSVG.category === void 0) {
                    newSVG.category = oldSVG.category;
                    if (oldSVG.subcategory !== void 0) {
                        newSVG.subcategory = oldSVG.subcategory;
                    }
                }

                return;
            }

            if (newAliases[oldKey] !== void 0) {
                // Item exists as other icon's alias
                return;
            }

            // Item is missing. Check for matching item
            let newKey = null,
                oldHash = oldHashes[oldKey];
            Object.keys(newHashes).forEach(key => {
                if (newKey === null && newHashes[key] === oldHash) {
                    newKey = key;
                }
            });

            if (newKey !== null) {
                // Item was renamed
                results.renamed ++;
                if (this.items[newKey].aliases === void 0) {
                    this.items[newKey].aliases = [];
                }
                this.items[newKey].aliases.push(oldKey);
                newAliases[oldKey] = newKey;

                if (options.checkAliases && oldSVG.aliases) {
                    oldSVG.aliases.forEach(alias => {
                        let name = typeof alias === 'string' ? alias : alias.name;
                        if (newAliases[name] === void 0 && newHashes[name] === void 0) {
                            // Missing alias
                            this.items[newKey].aliases.push(alias);
                            newAliases[name] = newKey;
                        }
                    });
                }

                if (options.checkChars && oldSVG.char !== void 0) {
                    let char = oldSVG.char;
                    if (newChars[char] === void 0 && this.items[newKey].char === void 0) {
                        this.items[newKey].char = oldSVG.char;
                        newChars[char] = newKey;
                    }
                }
                return;
            }

            // Item was deleted
            if (!oldSVG.hidden) {
                results.removed ++;
            }
            this.add(oldKey, new SVG(oldSVG.toString()));

            let newSVG = this.items[oldKey];
            if (options.markAsHidden) {
                newSVG.hidden = true;
            }
            newHashes[oldKey] = oldHashes[oldKey];

            if (oldSVG.aliases) {
                newSVG.aliases = [];
                oldSVG.aliases.forEach(alias => {
                    let name = typeof alias === 'string' ? alias : alias.name;
                    if (newAliases[name] === void 0 && newHashes[name] === void 0) {
                        // Missing alias
                        newSVG.aliases.push(typeof alias === 'string' ? alias : Object.assign({}, alias));
                        newAliases[name] = oldKey;
                    }
                });
            }

            // Add character if its missing
            if (options.checkChars && oldSVG.char !== void 0) {
                let char = oldSVG.char;
                if (newChars[char] === void 0) {
                    this.items[oldKey].char = oldSVG.char;
                    newChars[char] = oldKey;
                }
            }

            // Add category if its missing
            if (options.checkCategories && oldSVG.category !== void 0) {
                this.items[oldKey].category = oldSVG.category;
                if (oldSVG.subcategory !== void 0) {
                    this.items[oldKey].subcategory = oldSVG.subcategory;
                }
            }
        });

        return results;
    }
}

module.exports = Collection;