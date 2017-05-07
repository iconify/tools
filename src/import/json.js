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
const SVG = require('../svg');
const Collection = require('../collection');

const defaults = {
    reject: true
};

/**
 * Import icons from json file or string
 */
module.exports = (source, options) => {
    options = options === void 0 ? {} : options;
    Object.keys(defaults).forEach(key => {
        if (options[key] === void 0) {
            options[key] = defaults[key];
        }
    });

    return new Promise((fulfill, reject) => {
        // Loaded file
        function loaded(json) {
            if (typeof json !== 'object' || json.icons === void 0) {
                if (options.reject) {
                    reject('Invalid JSON file');
                } else {
                    fulfill(null);
                }
                return;
            }

            let collection = new Collection();

            try {
                // Expand all keys
                Object.keys(json).forEach(attr => {
                    let value = json[attr];
                    if (typeof value === 'object') {
                        return;
                    }

                    Object.keys(json.icons).forEach(key => {
                        if (json.icons[key][attr] === void 0) {
                            json.icons[key][attr] = value;
                        }
                    });
                });

                // Add items
                Object.keys(json.icons).forEach(key => {
                    let data = json.icons[key];
                    if (!data.width || !data.height || !data.body) {
                        return;
                    }

                    let viewbox = (data.left === void 0 ? 0 : data.left) + ' ' + (data.top === void 0 ? 0 : data.top) + ' ' + data.width + ' ' + data.height;
                    let svg = new SVG('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="' + viewbox + '">' + data.body + '</svg>');

                    // Copy additional attributes
                    ['inlineHeight', 'inlineTop', 'verticalAlign'].forEach(attr => {
                        if (data[attr] !== void 0) {
                            svg[attr] = data[attr];
                        }
                    });

                    // Check for aliases
                    if (json.aliases !== void 0) {
                        Object.keys(json.aliases).forEach(aliasKey => {
                            if (json.aliases[aliasKey].parent === key) {
                                // Found alias
                                if (svg.aliases === void 0) {
                                    svg.aliases = [];
                                }
                                let alias = Object.assign({}, json.aliases[aliasKey]);
                                delete alias.parent;
                                alias.name = aliasKey;
                                svg.aliases.push(alias);
                            }
                        });
                    }

                    // Check for characters map
                    if (json.chars !== void 0) {
                        Object.keys(json.chars).forEach(char => {
                            if (json.chars[char] === key) {
                                svg.char = char;
                            }
                        });
                    }

                    // Add to collection
                    collection.add(key, svg);
                });
            } catch (err) {
                collection = null;
            }

            if (collection === null || !collection.length()) {
                if (options.reject) {
                    reject('Invalid JSON file');
                } else {
                    fulfill(null);
                }
                return;
            }
            fulfill(collection);
        }

        // Check if source is JSON string
        if (source.slice(0, 1) === '{') {
            try {
                let data = JSON.parse(source);
                process.nextTick(function() {
                    loaded(data);
                });
                return;
            } catch (err) {
            }
        }

        // Load from file
        fs.readFile(source, 'utf8', (err, data) => {
            if (err) {
                if (options.reject) {
                    reject(err);
                } else {
                    fulfill(null);
                }
                return;
            }

            let json = null;
            try {
                json = JSON.parse(data);
            } catch (err) {
            }
            loaded(json);
        });
    });
};
