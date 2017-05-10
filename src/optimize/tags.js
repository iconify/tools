/**
 * This file is part of the simple-svg-tools package.
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

const defaults = {
    'strict-tags-validation': true,
    allowFont: false,
    browserCSSPrefixes: ['-webkit-', '-moz-', '-ms-', '-o-', '-inkscape-'],
    debug: false,
    log: console.log, // function for logging
};

const complexSelectorTest = /[\+~\[\]\*>]|\S+[\.#]\S+/;

/**
 * Optimize tags
 *
 * Must run SVGO optimization before running tags optimization!
 *
 * @param {SVG} svg SVG object
 * @param {object} options Options
 * @return {Promise}
 */
module.exports = (svg, options) => {
    // Set options
    options = options === void 0 ? {} : options;
    Object.keys(defaults).forEach(key => {
        if (options[key] === void 0) {
            options[key] = defaults[key];
        }
    });

    // Return promise object
    return new Promise((fulfill, reject) => {
        let $root = svg.$svg(':root'),
            rootAttributes = $root.get(0).attribs,
            styles = {},
            usedSelectors = {},
            keepSelectors = {},
            complexSelectors = false,
            styleTags = [],
            xlink = false;

        /**
         * Check color
         *
         * @param value
         */
        function checkColor(value) {
            if (value === '' || value === 'none') {
                return;
            }

            let clr = Color.fromString(value);
            if (clr === null && options['strict-tags-validation']) {
                value = value.toLowerCase();
                if (value === 'transparent' || value.slice(0, 3) === 'url') {
                    return;
                }
                throw new Error('Invalid color value: "' + value + '"');
            }
        }

        /**
         * Removed used styles
         *
         * @param $tag
         * @return {boolean}
         */
        function removeUsedStyles($tag) {
            let tokens = (new Tokenizer({
                    splitRules: true
                })).tree($tag.text()),
                changed = false;

            tokens.forEach((token, index) => {
                if (token.token !== '{' || !token.selectors) {
                    return;
                }

                let unused = false;
                token.selectors.forEach(selector => {
                    if (usedSelectors[selector] === void 0 || keepSelectors[selector]) {
                        unused = true;
                    }
                });
                if (!unused) {
                    tokens[index] = null;
                    changed = true;
                }
            });

            if (!changed) {
                return false;
            }

            tokens = tokens.filter(token => token !== null);
            if (!tokens.length) {
                $tag.remove();
                return true;
            }

            $tag.text(Tokenizer.build(tokens));
            return false;
        }

        /**
         * Check style
         *
         * @param {string} code
         * @param {boolean} inline
         */
        function checkStyle(code, inline) {
            let tokens = (new Tokenizer({
                splitRules: true
            })).tokenize(code);

            let selectors = false;

            tokens.forEach(token => {
                switch (token.token) {
                    case '{':
                        if (token.selectors) {
                            selectors = token.selectors;
                        }
                        return;

                    case '}':
                        selectors = false;
                        return;

                    case 'rule':
                        let key = token.key.toLowerCase();
                        switch (key) {
                            case 'stop-color':
                            case 'fill':
                            case 'stroke':
                                // Check color value
                                let result = checkColor(token.value.toLowerCase());
                                if (typeof result === 'string') {
                                    token.value = result;
                                }
                                break;

                            default:
                                // Remove css rules that aren't supposed to be in SVG file (leftovers from bad editors)
                                let key = token.key;
                                options.browserCSSPrefixes.forEach(prefix => {
                                    if (key.slice(0, prefix.length) === prefix) {
                                        key = key.slice(prefix.length);
                                    }
                                });
                                let list = key.split('-');
                                switch (list[0]) {
                                    case 'fill':
                                    case 'stroke':
                                    case 'clip':
                                    case 'transform':
                                    case 'stop':
                                        break;

                                    case 'font':
                                    case 'line':
                                    case 'text':
                                    case 'mix':
                                    case 'block':
                                    case 'isolation':
                                    case 'white':
                                    case 'word':
                                        token.token = 'ignore';
                                        return;

                                    case 'marker':
                                        if (token.value === 'none') {
                                            token.token = 'ignore';
                                            return;
                                        }
                                        break;

                                    default:
                                        if (options['strict-tags-validation']) {
                                            throw new Error('Invalid css rule: ' + token.key + ':' + token.value);
                                        }
                                        return;
                                }
                        }
                        if (!inline && selectors !== false && !complexSelectors) {
                            selectors.forEach(selector => {
                                // Check for complex selectors
                                if (complexSelectorTest.test(selector)) {
                                    complexSelectors = true;
                                    return;
                                }

                                if (styles[selector] === void 0) {
                                    styles[selector] = {};
                                }
                                styles[selector][key] = token;
                            });
                        }
                        return;

                    default:
                        return;
                }
            });

            return Tokenizer.build(tokens, {minify: true});
        }

        /**
         * Check shape
         *
         * @param {object} $node
         * @param {object} node
         * @param {object} extra
         */
        function checkShape($node, node, extra) {
            let nodeAttributes = node.attribs;

            function expandClass(name) {
                let style = styles[name];
                Object.keys(style).forEach(key => {
                    if (nodeAttributes[key] === void 0 || style[key].important) {
                        $node.attr(key, style[key].value);
                    }
                });
                usedSelectors[name] = true;
            }

            // Check attributes
            if (nodeAttributes) {
                // Expand style
                if (nodeAttributes.style !== void 0) {
                    let value = checkStyle(nodeAttributes.style, true);
                    $node.removeAttr('style');

                    // Tokenize and move style to attributes
                    let tokens = (new Tokenizer({
                        splitRules: true
                    })).tree(value);
                    tokens.forEach(token => {
                        if (token.token === 'rule') {
                            let key = token.key.toLowerCase();
                            if (nodeAttributes[key] === void 0) {
                                $node.attr(key, token.value);
                            }
                        }
                    });
                }

                // Expand class and id
                if (!complexSelectors) {
                    if (nodeAttributes['class'] !== void 0 && styles['.' + nodeAttributes['class']] !== void 0) {
                        let classList = nodeAttributes['class'].split(/\s+/g);
                        if (classList.length > 1) {
                            // More than one selector - do nothing, mark selectors as undeletable
                            classList.forEach(className => {
                                keepSelectors['.' + className] = true;
                            });
                        } else {
                            expandClass('.' + nodeAttributes['class']);
                            $node.removeAttr('class');
                        }
                    }
                    if (nodeAttributes['id'] !== void 0 && styles['#' + nodeAttributes['id']] !== void 0) {
                        expandClass('#' + nodeAttributes['id']);
                    }
                }

                // Check other attributes
                Object.keys(nodeAttributes).forEach(attr => {
                    let value = nodeAttributes[attr];

                    //noinspection FallThroughInSwitchStatementJS
                    switch (attr) {
                        case 'stop-color':
                            if (!extra.gradient) {
                                throw new Error('Unexpected attribute "' + attr + '" outside of gradient');
                            }

                        case 'fill':
                        case 'stroke':
                            checkColor(value.toLowerCase());
                            break;

                        default:
                            let list = attr.split('-');
                            switch (list[0]) {
                                // Clean up BPMN junk
                                case 'font':
                                case 'line':
                                case 'text':
                                case 'mix':
                                case 'block':
                                case 'isolation':
                                case 'overflow':
                                case 'white':
                                case 'word':
                                case 'color':
                                    $node.removeAttr(attr);
                                    return;

                                case 'marker':
                                    if (value === 'none') {
                                        $node.removeAttr(attr);
                                        return;
                                    }
                                    break;

                                default:
                            }
                    }
                });
            }

            checkChildElements($node, extra);
        }

        /**
         * Check child elements
         *
         * @param {object} $parent
         * @param {object} extra
         */
        function checkChildElements($parent, extra) {
            $parent.children().each((index, child) => {
                let $child = cheerio(child),
                    shape = true;

                //noinspection FallThroughInSwitchStatementJS
                switch (child.tagName) {
                    case 'style':
                        let value = checkStyle($child.text(), false);
                        if (typeof value === 'string') {
                            if (!value.length) {
                                $child.remove();
                                return;
                            } else {
                                $child.text(value);
                            }
                        }
                        styleTags.push($child);
                        return;

                    case 'g':
                    case 'switch':
                        checkChildElements($child, extra);

                        // Remove empty tags
                        if (!$child.children().length) {
                            $child.remove();
                            return;
                        }
                        shape = false;

                    case 'path':
                    case 'circle':
                    case 'line':
                    case 'polygon':
                    case 'polyline':
                    case 'rect':
                    case 'ellipse':
                        checkShape($child, child, extra);
                        return;

                    case 'text':
                        if (!options.allowFont) {
                            throw new Error('Unexpected tag "' + child.tagName + '"');
                        }
                        checkShape($child, child, extra);
                        return;

                    case 'linearGradient':
                    case 'radialGradient':
                        checkShape($child, child, Object.assign({}, extra, {gradient: true}));
                        return;

                    case 'stop':
                        if (!extra.gradient) {
                            throw new Error('Unexpected tag "' + child.tagName + '"');
                        }
                        checkShape($child, child, extra);
                        return;

                    case 'use':
                        xlink = true;
                    case 'mask':
                    case 'defs':
                    case 'clipPath':
                        checkChildElements($child, extra);
                        return;

                    case 'font':
                        if (!options.allowFont) {
                            throw new Error('Unexpected tag "' + child.tagName + '"');
                        }
                        // Ignore font
                        return;

                    case 'filter':
                        // Ignore filter
                        return;

                    default:
                        throw new Error('Unexpected tag "' + child.tagName + '"');
                }
            });
        }

        // Do stuff
        try {
            checkChildElements($root, {});
        } catch (err) {
            reject(err);
            return;
        }

        // Clean up root element attributes
        let attributes = {
            xmlns: 'http://www.w3.org/2000/svg',
            preserveAspectRatio: 'xMidYMid meet',
            width: svg.width,
            height: svg.height,
            viewBox: rootAttributes.viewBox === void 0 ? svg.left + ' ' + svg.top + ' ' + svg.width + ' ' + svg.height : rootAttributes.viewBox
        };
        if (xlink) {
            attributes['xmlns:xlink'] = 'http://www.w3.org/1999/xlink';
        }
        Object.keys(attributes).forEach(attr => {
            $root.attr(attr, attributes[attr]);
        });

        // Remove styles that were changed to inline attributes
        if (!complexSelectors && Object.keys(usedSelectors).length) {
            styleTags.forEach($tag => {
                if (!removeUsedStyles($tag) && options.debug) {
                    options.log('Style attribute was found');
                }
            });
        }
        if (complexSelectors && options.debug) {
            options.log('Style with complex selectors was found.');
        }

        fulfill(svg);
    });
};
