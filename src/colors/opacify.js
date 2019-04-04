/**
 * This file is part of the @iconify/tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

"use strict";

const cheerio = require('cheerio');
const Color = require('cyberalien-color');
const Tokenizer = require('simple-tokenizer');

const defaultCallback = (color, defaultColor) => {
    let obj = Color.fromString(color);
    if (obj === null) {
        return {
            color: color,
            opacity: 1
        };
    }

    let lightness = obj.getLightness(),
        opacity = Math.round(100 - lightness) / 100;

    return {
        color: defaultColor,
        opacity: opacity
    };
};

/**
 * Change colors to opacity
 *
 * Must run SVGO optimization before running this script!
 *
 * @param {SVG} svg SVG object
 * @param {string|function} setColor:
 *  If string, color will be changed to value, opacity will be set to color lightness (black = 1, white = 0)
 *  If callback, callback takes color as argument and should return object: {color: color string, opacity: opacity number}
 * @return {Promise}
 */
module.exports = (svg, setColor) => {
    return new Promise((fulfill, reject) => {
        let $root = svg.$svg(':root');

        if (typeof setColor !== 'function') {
            let defaultColor = typeof setColor === 'string' ? setColor : '#000';
            setColor = color => defaultCallback(color, defaultColor);
        }

        /**
         * Check if value equals 'none'
         *
         * @param {string} value
         * @returns {boolean}
         */
        function isNone(value) {
            return value.toLowerCase().trim() === 'none';
        }

        /**
         * Parse style
         *
         * @param {string} style
         * @returns {string}
         */
        function parseStyle(style) {
            if (typeof style !== 'string') {
                return '';
            }

            let oldTokens = (new Tokenizer({
                    splitRules: true
                })).tokenize(style),
                newTokens = [],
                opacity = null;

            oldTokens.forEach(token => {
                if (token.token === 'rule') {
                    let key = token.key.toLowerCase();
                    switch (key) {
                        case 'fill':
                        case 'stroke':
                            if (isNone(token.value)) {
                                newTokens.push(token);
                                return;
                            }

                            let changes = setColor(token.value);

                            // Change color
                            token.value = changes.color;
                            newTokens.push(token);

                            // Save opacity
                            if (!opacity) {
                                opacity = {};
                            }
                            opacity[key] = opacity[key] === void 0 ? changes.opacity : changes.opacity * opacity[key];
                            break;

                        case 'fill-opacity':
                        case 'stroke-opacity':
                            key = key.split('-').shift();

                            // Save opacity
                            if (!opacity) {
                                opacity = {};
                            }
                            opacity[key] = opacity[key] === void 0 ? token.value : token.value * opacity[key];
                            break;
                    }
                } else {
                    if (opacity !== null) {
                        Object.keys(opacity).forEach(key => {
                            newTokens.push({
                                token: 'rule',
                                key: key + '-opacity',
                                value: opacity[key]
                            });
                        });
                    }
                    newTokens.push(token);
                    opacity = null;
                }
            });

            return Tokenizer.build(newTokens, {minify: true});
        }

        /**
         * Check child elements of tag
         *
         * @param {object} $tag
         */
        function parseChildElements($tag) {
            $tag.children().each((index, child) => {
                let $child = cheerio(child);

                switch (child.tagName) {
                    case 'style':
                        $child.text(parseStyle($child.text()));
                        return;

                    default:
                        if (Object.keys(child.attribs).length) {
                            let props = child.attribs;

                            // Check for fill and stroke
                            ['fill', 'stroke'].forEach(attr => {
                                if (props[attr] !== void 0) {
                                    if (isNone(props[attr])) {
                                        return;
                                    }

                                    // Change color
                                    let changes = setColor(props[attr]);
                                    if (!changes) {
                                        return;
                                    }

                                    $child.attr(attr, changes.color);
                                    if (changes.opacity < 1) {
                                        let opacity = props[attr + '-opacity'] === void 0 ? 1 : parseInt(props[attr + '-opacity']);
                                        $child.attr(attr + '-opacity', changes.opacity * (isNaN(opacity) ? 1 : opacity));
                                    }
                                }
                            });
                        }
                        parseChildElements($child);
                }
            });
        }

        // Do stuff
        parseChildElements($root);

        fulfill(svg);
    });
};
