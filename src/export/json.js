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
const Optimize = require('../ssvg/optimize');

const defaults = {
    // True if characters table added by importing fonts should be included in JSON output
    includeChars: true,

    // True if aliases should be included in JSON output
    includeAliases: true,

    // True if inlineHeight, inlineTop and verticalAlign attributes should be included in output
    includeInline: true,

    // True if prefix should be included separately
    // If enabled and collection has no prefix, exporter will try to detect common prefix (result is saved in collection)
    separatePrefix: true,

    // If true, common values would be moved to root scope to make JSON file smaller
    optimize: false,

    // If true all white space is removed, making file smaller, but harder to read
    minify: false
};

const transformKeys = ['rotate', 'vFlip', 'hFlip'];

const positionAttributes = ['left', 'top'];

const inlineAttributes = ['inlineHeight', 'inlineTop', 'verticalAlign'];

const extraAttributes = ['deprecated', 'hidden', 'renamed'];

/**
 * Export collection to json file
 *
 * @param {Collection} collection Collection to export
 * @param {string} [target] Target filename
 * @param {object} [options] Options
 * @returns {Promise}
 */
module.exports = (collection, target, options) => {
    options = options === void 0 ? {} : options;
    Object.keys(defaults).forEach(key => {
        if (options[key] === void 0) {
            options[key] = defaults[key];
        }
    });

    // Function to add prefix to name if needed
    let prefix = key => options.separatePrefix ? key : (collection.prefix === '' ? '' : collection.prefix + ':') + key;

    // Return promise
    return new Promise((fulfill, reject) => {
        let json = {};

        if (options.separatePrefix) {
            if (collection.prefix === '' && collection.findCommonPrefix(true) === '') {
                options.separatePrefix = false;
            } else {
                json.prefix = collection.prefix;
            }
        }

        json.icons = {};

        // Export all files
        let keys = collection.keys();
        keys.sort((a, b) => a.localeCompare(b));
        keys.forEach(key => {
            let svg = collection.items[key],
                iconKey = prefix(key);

            json.icons[iconKey] = {
                body: svg.getBody().replace(/\s*\n\s*/g, ''),
                width: svg.width,
                height: svg.height
            };

            // Add left/top
            positionAttributes.forEach(attr => {
                if (svg[attr] !== 0) {
                    json.icons[iconKey][attr] = svg[attr];
                }
            });

            // Add transformations
            transformKeys.forEach(attr => {
                if (svg[attr] !== void 0) {
                    json.icons[iconKey][attr] = svg[attr];
                }
            });

            // Include inline attributes
            if (options.includeInline) {
                inlineAttributes.forEach(attr => {
                    if (svg[attr] !== void 0) {
                        json.icons[iconKey][attr] = svg[attr];
                    }
                });
            }

            // Extra attributes
            extraAttributes.forEach(attr => {
                if (svg[attr] !== void 0) {
                    json.icons[iconKey][attr] = svg[attr];
                }
            });
        });

        // Add aliases
        if (options.includeAliases) {
            let aliases = {};

            collection.forEach((svg, key) => {
                if (svg.aliases) {
                    let parentKey = prefix(key);

                    svg.aliases.forEach(alias => {
                        // Check alias format
                        let item = {
                                parent: parentKey
                            },
                            name;

                        switch (typeof alias) {
                            case 'string':
                                name = alias;
                                break;

                            case 'object':
                                if (alias.name === void 0) {
                                    return;
                                }
                                name = alias.name;
                                transformKeys.forEach(key => {
                                    if (alias[key] !== void 0) {
                                        item[key] = alias[key];
                                    }
                                });
                                break;

                            default:
                                return;
                        }

                        // Add prefix
                        name = prefix(name);

                        // Check for duplicate
                        if (json.icons[name] !== void 0) {
                            return;
                        }

                        // Add alias
                        aliases[name] = item;
                    });
                }
            });

            // Sort keys
            let keys = Object.keys(aliases);
            if (keys.length) {
                keys.sort((a, b) => a.localeCompare(b));
                json.aliases = {};
                keys.forEach(key => {
                    json.aliases[key] = aliases[key];
                });
            }
        }

        // Add characters
        if (options.includeChars) {
            let chars = {};
            collection.forEach((svg, key) => {
                if (svg.char === void 0) {
                    return;
                }
                if (options.includeAliases && svg.aliases) {
                    svg.aliases.forEach(alias => {
                        if (typeof alias === 'object' && alias.char !== void 0 && alias.name !== void 0) {
                            chars[alias.char] = prefix(alias.name);
                        }
                    });
                }
                chars[svg.char] = prefix(key);
            });

            // Sort keys
            let keys = Object.keys(chars);
            if (keys.length) {
                keys.sort((a, b) => a.localeCompare(b));
                json.chars = {};
                keys.forEach(key => {
                    json.chars[key] = chars[key];
                })
            }
        }

        // Optimize common attributes by moving duplicate items to root
        if (options.optimize) {
            Optimize(json);
        }

        // Export
        let content = options.minify ? JSON.stringify(json) : JSON.stringify(json, null, '\t');
        if (typeof target === 'string') {
            try {
                fs.writeFileSync(target, content, 'utf8');
            } catch (err) {
                reject(err);
                return;
            }
        }
        fulfill(json);
    });
};
