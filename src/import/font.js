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
const cheerio = require('cheerio');
const SVG = require('../svg');
const Collection = require('../collection');
const crop = require('../optimize/crop');

/**
 * Default options
 *
 * @type {object}
 */
const defaults = {
    // Collection prefix
    prefix: '',

    // Array of characters to ignore, false if none
    ignoreCharacters: false,

    // List of changes for font: {height: 1000}, false if no changes
    fontChanges: false,

    // List of changes for each character: [hex] = {height: 1000}
    characterChanges: Object.create(null),

    // Crop glyphs
    crop: false,
};

/**
 * Generate SVG code
 *
 * @param {object} character
 * @param {string} path
 * @returns {string}
 */
function generateSVG(character, path) {
    return '<svg ' +
        'width="' + character.width + '" ' +
        'height="' + character.height + '" ' +
        'viewBox="0 0 ' + character.width + ' ' + character.height + '" ' +
        'xmlns="http://www.w3.org/2000/svg" ' +
        'xmlns:xlink="http://www.w3.org/1999/xlink"' +
    '>\n' + getSVGBody(character, path) + '</svg>';
}

/**
 * Get SVG body
 *
 * @param character
 * @param path
 * @return {string}
 */
function getSVGBody(character, path) {
    let svg = '';

    svg += '\t<g transform="translate(' + (0 - character.left) + ' ' + (character.height + character.bottom) + ')">\n';
    svg += '\t\t<g transform="scale(1 -1)">\n';
    svg += '\t\t\t<path d="' + path + '" />\n';
    svg += '\t\t</g>\n';
    svg += '\t</g>\n';

    return svg;
}

/**
 * Apply option changes to object
 *
 * @param data
 * @param options
 */
function applyOptions(data, options) {
    Object.keys(data).forEach(key => {
        if (options[key] !== void 0) {
            switch (typeof options[key]) {
                case 'function':
                    data[key] = options[key](data[key], data);
                    break;

                default:
                    data[key] = options[key];
            }
        }
    });
}

/**
 * Load SVG font
 *
 * @param {string} source
 * @param {object} [options]
 * @return {Promise}
 */
module.exports = (source, options) => {
    options = options === void 0 ? Object.create(null) : options;
    Object.keys(defaults).forEach(key => {
        if (options[key] === void 0) {
            options[key] = defaults[key];
        }
    });

    return new Promise((fulfill, reject) => {

        fs.readFile(source, 'utf8', (err, data) => {
            if (err) {
                // is source svg font?
                if (source.slice(0, 1) === '<') {
                    data = source;
                } else {
                    return reject(err);
                }
            }

            let svg = cheerio.load(data, {
                lowerCaseAttributeNames: false,
                xmlMode: true
            });

            // Check root
            let $root = svg(':root');
            if (
                $root.length > 1 ||
                $root.get(0).tagName !== 'svg' ||
                !$root.children('defs').length
            ) {
                reject('Invalid SVG font');
                return;
            }

            // Crop queue
            let cropQueue = Object.create(null);

            // Find fonts
            let glyphs = new Collection(options.prefix);

            try {
                $root.children('defs').each((index, def) => {
                    let $def = cheerio(def);

                    $def.children('font').each((index, row) => {
                        let $font = cheerio(row);

                        let $ff = $font.children('font-face');
                        if ($ff.length !== 1) {
                            console.log('Font is missing font-face');
                            return;
                        }

                        let font = {
                            width: 0,
                            height: 0,
                            ascent: 0,
                            descent: 0,
                            box: false
                        };

                        let fontAttributes = row.attribs,
                            ffAttributes = $ff.get(0).attribs;

                        // Get width
                        if (ffAttributes['units-per-em'] && parseInt(ffAttributes['units-per-em'])) {
                            font.width = parseInt(ffAttributes['units-per-em']);
                        }
                        if (ffAttributes['horiz-adv-x'] && parseInt(ffAttributes['horiz-adv-x'])) {
                            font.width = Math.abs(parseInt(ffAttributes['horiz-adv-x']));
                        } else if (fontAttributes['horiz-adv-x'] && parseInt(fontAttributes['horiz-adv-x'])) {
                            font.width = Math.abs(parseInt(fontAttributes['horiz-adv-x']));
                        }

                        // Get height
                        ['ascent', 'descent'].forEach(key => {
                            if (ffAttributes[key] !== void 0) {
                                font[key] = parseFloat(ffAttributes[key]);
                                if (isNaN(font[key])) {
                                    throw new Error('Invalid number for ' + key + ': ' + ffAttributes[key]);
                                }
                            }
                        });

                        font.height = (font.ascent === font.descent) ? font.width : font.ascent - font.descent;

                        // // Get bounding box
                        // if (ffAttributes.bbox) {
                        //     font.box = ffAttributes.bbox.split(' ').map(item => {
                        //         let result = parseFloat(item);
                        //         if (isNaN(result)) {
                        //             throw new Error('Invalid bounding box value: ' + ff.bbox);
                        //         }
                        //         return result;
                        //     });
                        // }

                        if (!font.width || !font.height) {
                            throw new Error('SVG is missing required attributed');
                        }

                        // Get all glyphs
                        $font.children('glyph').each((index, row) => {
                            let $glyph = cheerio(row),
                                glyphAttributes = row.attribs;

                            if (glyphAttributes.d === void 0 || glyphAttributes.d.length < 6 || glyphAttributes.unicode === void 0) {
                                return;
                            }

                            // Get character hexadecimal value
                            let key = glyphAttributes.unicode.codePointAt(0);
                            if (isNaN(key)) {
                                return;
                            }
                            let hex = key.toString(16);

                            // Check if character is ignored
                            if (options.ignoreCharacters && options.ignoreCharacters.indexOf(hex) !== -1) {
                                return;
                            }

                            let character = Object.assign({
                                key: hex,
                                left: 0,
                                bottom: 0
                            }, font);

                            // Set custom width from horiz-adv-x attribute
                            if (glyphAttributes['horiz-adv-x'] && parseInt(glyphAttributes['horiz-adv-x'])) {
                                character.width = Math.abs(parseInt(glyphAttributes['horiz-adv-x']));
                            }

                            // Overwrite ascent/descent
                            ['ascent', 'descent'].forEach(key => {
                                if (glyphAttributes[key] !== void 0) {
                                    character[key] = parseInt(glyphAttributes[key]);
                                }
                            });

                            character.bottom = character.descent;
                            character.height = (character.ascent === character.descent) ? character.width : character.ascent - character.descent;

                            // // Change coordinates to bounding box
                            // if (character.box !== false) {
                            //     character.bottom = character.box[1];
                            //     if (character.box[3] - character.box[1] > character.height) {
                            //         character.height = character.box[3] - character.box[1];
                            //     }
                            // }

                            // Check options
                            let oldHeight = character.height;

                            // Custom font changes
                            if (options.fontChanges) {
                                applyOptions(character, options.fontChanges);
                            }
                            if (options.characterChanges && options.characterChanges[hex]) {
                                applyOptions(character, options.characterChanges[hex]);
                            }

                            // Adjust bottom position for custom height
                            if (character.height !== oldHeight) {
                                character.bottom += (oldHeight - character.height) / 2;
                                if (options.fontChanges && options.fontChanges.bottom !== void 0) {
                                    applyOptions(character, options.fontChanges);
                                }
                                if (options.characterChanges && options.characterChanges[hex] && options.characterChanges[hex].bottom !== void 0) {
                                    applyOptions(character, options.characterChanges[hex]);
                                }
                            }

                            // Save item
                            let verticalAlign = Math.round(font.descent / (font.ascent - font.descent) * 1000) / 1000;
                            if (options.crop !== false) {
                                cropQueue[hex] = {
                                    body: getSVGBody(character, glyphAttributes['d']),
                                    ascent: font.ascent,
                                    descent: font.descent,
                                    width: character.width,
                                    originalHeight: character.height,
                                    verticalAlign: verticalAlign
                                };
                            }
                            try {
                                let svg = new SVG(generateSVG(character, glyphAttributes['d']));
                                svg.inlineTop = 0;
                                svg.inlineHeight = character.height;
                                svg.verticalAlign = verticalAlign;
                                glyphs.add(hex, svg);
                            } catch (err) {
                            }
                        });
                    });
                });

            } catch (err) {
                reject(err);
            }

            // Crop images
            if (Object.keys(cropQueue).length) {
                let cropOptions = Object.assign({
                    defaultRightLimit: false,
                    defaultLeftLimit: false
                }, typeof options.crop === 'object' ? options.crop : Object.create(null));

                cropOptions.multiple = true;
                cropOptions.format = 'svg';

                // Need to run SVGO before cropping to remove transformations because PhantomJS has bugs with transformations
                cropOptions.optimize = true;

                crop(cropQueue, cropOptions).then(results => {
                    Object.keys(results).forEach(hex => {
                        let svg = results[hex];

                        // top > 0 - something was cropped above icon
                        svg.inlineTop = svg._cropData.top <= 0 ? 0 : 0 - svg._cropData.top;
                        svg.inlineHeight = cropQueue[hex].originalHeight;
                        svg.verticalAlign = cropQueue[hex].verticalAlign;

                        glyphs.add(hex, svg);
                    });
                    fulfill(glyphs);
                }).catch(err => {
                    reject(err);
                });
            } else {
                fulfill(glyphs);
            }
        });
    });
};
