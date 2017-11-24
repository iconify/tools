/**
 * This file is part of the simple-svg-tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

"use strict";

const SVG = require('./svg');

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
}

module.exports = Collection;