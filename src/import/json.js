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
const SVG = require('../svg');
const Collection = require('../collection');
const deOptimize = require('@iconify/json-tools').Collection.deOptimize;

const defaults = {
    reject: true,
    detectPrefix: false
};

const extraAttributes = ['inlineHeight', 'inlineTop', 'verticalAlign', 'rotate', 'vFlip', 'hFlip', 'deprecated', 'hidden', 'renamed'];

/**
 * Import icons from json file or string
 */
module.exports = (source, options) => {
    options = options === void 0 ? Object.create(null) : options;
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

            let collection = new Collection(json.prefix === void 0 ? '' : json.prefix);

            try {
                // Expand all keys
                deOptimize(json);

                // Add items
                Object.keys(json.icons).forEach(key => {
                    let data = json.icons[key];
                    if (!data.width || !data.height || !data.body) {
                        return;
                    }

                    let viewbox = (data.left === void 0 ? 0 : data.left) + ' ' + (data.top === void 0 ? 0 : data.top) + ' ' + data.width + ' ' + data.height;
                    let svg = new SVG('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="' + viewbox + '">' + data.body + '</svg>');

                    // Copy additional attributes
                    extraAttributes.forEach(attr => {
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
                                let alias = Object.assign(Object.create(null), json.aliases[aliasKey]);
                                delete alias.parent;
                                alias.name = aliasKey;
                                svg.aliases.push(alias);
                            }
                        });
                    }

                    // Add to collection
                    collection.add(key, svg);
                });

                // Add characters
                if (json.chars !== void 0) {
                    Object.keys(json.chars).forEach(char => {
                        let icon = json.chars[char];
                        if (collection.items[icon] !== void 0) {
                            collection.items[icon].char = char;
                        }
                    });
                }

                // Add categories
                if (json.categories) {
                    Object.keys(json.categories).forEach(cat => {
                        json.categories[cat].forEach(icon => {
                            if (collection.items[icon] !== void 0) {
                                if (collection.items[icon].category === void 0) {
                                    collection.items[icon].category = [cat];
                                } else {
                                    collection.items[icon].category.push(cat);
                                }
                            }
                        });
                    });
                }

                // Add themes
                if (typeof json.themes === 'object') {
                    collection.themes = json.themes;
                }

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

            if (options.detectPrefix) {
                collection.findCommonPrefix(true);
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
