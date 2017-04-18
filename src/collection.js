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
     * @param {Collection|object} [parent] Items to copy
     */
    constructor(parent) {
        this.items = {};

        if (parent instanceof Collection) {
            // Clone collection
            parent.forEach((item, key) => {
                this.items[key] = item;
            });
        } else if (typeof parent === 'object') {
            // Copy from object
            Object.keys(parent).forEach(key => {
                if (parent.hasOwnProperty(key) && parent[key] instanceof SVG) {
                    this.items[key] = parent[key];
                }
            });
        }
    }

    /**
     * Add item to collection
     *
     * @param {string} key
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
     * @param {string} key
     */
    remove(key) {
        delete this.items[key];
    }

    /**
     * Change key
     *
     * @param {string} oldKey
     * @param {string} newKey
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
     * @return {Array}
     */
    keys() {
        return Object.keys(this.items);
    }

    /**
     * Run callback on all items
     *
     * @param callback
     */
    forEach(callback) {
        Object.keys(this.items).forEach(key => {
            callback(this.items[key], key);
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
     * @param {function} promise Callback to return Promise for item: callback(svg, key)
     * @return {Promise}
     */
    promiseAll(promise) {
        return this._runPromises(key => promise(this.items[key], key));
    }

    /**
     * Run promise on all items
     *
     * @param {function} callback Function that returns Promise for one item
     * @return {Promise}
     * @private
     */
    _runPromises(callback) {
        return new Promise((fulfill, reject) => {
            // Convert to arrays
            let keys = Object.keys(this.items),
                promises = [],
                resultKeys = [];

            keys.forEach((key, index) => {
                let result = callback(key);
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