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
const Optimize = require('simple-svg-cdn').optimize;

const defaults = {
    'include-chars': true,
    'include-aliases': true,
    'include-inline': true,
    optimize: false,
    minify: true
};

const aliasKeys = ['rotate', 'vFlip', 'hFlip'];

/**
 * Export collection to json file
 */
module.exports = (collection, target, options) => {
    options = options === void 0 ? {} : options;
    Object.keys(defaults).forEach(key => {
        if (options[key] === void 0) {
            options[key] = defaults[key];
        }
    });

    return new Promise((fulfill, reject) => {
        let json = {
            icons: {}
        };

        // Export all files
        collection.forEach((svg, key) => {
            json.icons[key] = {
                body: svg.getBody().replace(/\s*\n\s*/g, ''),
                width: svg.width,
                height: svg.height
            };

            // Add top/left
            ['left', 'top'].forEach(attr => {
                if (svg[attr] !== 0) {
                    json.icons[key][attr] = svg[attr];
                }
            });

            // Include inline attributes
            if (options['include-inline']) {
                ['inlineHeight', 'inlineTop', 'verticalAlign'].forEach(attr => {
                    if (svg[attr] !== void 0) {
                        json.icons[key][attr] = svg[attr];
                    }
                });
            }
        });

        // Add aliases
        if (options['include-aliases']) {
            collection.forEach((svg, key) => {
                if (svg.aliases) {
                    svg.aliases.forEach(alias => {
                        // Check alias format
                        let item = {
                                parent: key
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
                                aliasKeys.forEach(key => {
                                    if (alias[key] !== void 0) {
                                        item[key] = alias[key];
                                    }
                                });
                                break;

                            default:
                                return;
                        }

                        // Check for duplicate
                        if (json.icons[name] !== void 0) {
                            return;
                        }

                        // Add alias
                        if (json.aliases === void 0) {
                            json.aliases = {};
                        }
                        json.aliases[name] = item;
                    });
                }
            });
        }

        // Add characters
        if (options['include-chars']) {
            collection.forEach((svg, key) => {
                if (svg.char === void 0) {
                    return;
                }
                if (json.chars === void 0) {
                    json.chars = {};
                }
                json.chars[svg.char] = key;
            });
        }

        // Optimize common attributes by moving duplicate items to root
        if (options.optimize) {
            Optimize(json);
        }

        // Export
        let content = options.minify ? JSON.stringify(json) : JSON.stringify(json, null, '\t');
        if (target) {
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
