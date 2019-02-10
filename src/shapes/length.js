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
const exec = require('child_process').exec;
const tmp = require('tmp');
const cheerio = require('cheerio');
const changeOptions = require('./options');
const convert = require('./convert');
const Index = require('./index');
const SVG = require('../svg');
const Collection = require('../collection');

/**
 * Default options. See also ./options.js
 *
 * @type {object}
 */
const defaults = {
    // PhantomJS command
    phantomjs: 'phantomjs',

    // True if errors should be ignored
    ignoreErrors: false,
};

/**
 * Clean up string value, removing anything that should not be there
 *
 * @param {string} value
 * @return {string}
 */
function cleanupString(value) {
    return value.replace(/[^0-9a-zA-Z\s\-+,.%]+/g, '');
}

/**
 * Check number for percentages and convert to number
 *
 * @param {string} value Value as string
 * @param {number} total Total length for percentage calculations
 * @param {*} defaultValue Value to return if value is empty
 * @return {number|null}
 */
function normalizeNumber(value, total, defaultValue) {
    if (value === '') {
        return defaultValue;
    }

    let units = value.replace(/^[0-9.-]+/g, '');
    value = parseFloat(value);
    if (isNaN(value)) {
        return defaultValue;
    }
    switch (units) {
        case '':
            return value;

        case '%':
            return value * total / 100;

        default:
            return null;
    }
}

/**
 * Normalize node attributes
 *
 * @param $node
 * @param {object} params List of attributes. Key = name, typeof value = type
 * @param {object} [defaults] Default values for missing attributes
 * @return {object|null} List of attributes as object, null on error
 */
function normalizeAttributes($node, params, defaults) {
    defaults = defaults === void 0 ? Object.create(null) : defaults;

    let results = Object.create(null),
        keys = Object.keys(params),
        i, value, key;

    function checkDefault(key) {
        if (defaults[key] === void 0) {
            return false;
        }
        results[key] = defaults[key];
        return true;
    }

    // Check all attributes
    for (i = 0; i < keys.length; i++) {
        key = keys[i];
        value = $node.attr(key);
        if (value === void 0) {
            // Attribute is missing
            if (!checkDefault(key)) {
                return null;
            }
            continue;
        }

        if (typeof value === typeof params[key]) {
            if (typeof value === 'string') {
                value = cleanupString(value);
            }
            results[key] = value;
            continue;
        }

        switch (typeof params[key]) {
            case 'number':
                value = parseFloat(value);
                if (isNaN(value)) {
                    if (!checkDefault(key)) {
                        return null;
                    }
                } else {
                    results[key] = value;
                }
                break;

            case 'boolean':
                switch (typeof value) {
                    case 'string':
                        value = value.toLowerCase();
                        results[key] = value === '1' || value === 'true' || value === key;
                        break;

                    default:
                        results[key] = !!value;
                }
                break;

            default:
                // Wrong type
                if (!checkDefault(key)) {
                    return null;
                }
        }
    }

    return results;
}

/**
 * Functions for calculating length of shapes
 */
let calculate = Object.create(null);

/**
 * Calculate line length
 *
 * @param attributes
 * @return {number}
 */
function calcLineLength(attributes) {
    return Math.sqrt(Math.pow((attributes.x2 - attributes.x1), 2) + Math.pow((attributes.y2 - attributes.y1), 2));

}

/**
 * Length of <line>
 *
 * @param $element
 * @return {number|boolean}
 */
calculate.line = $element => {
    let attributes = normalizeAttributes($element, {
        x1: 0,
        x2: 0,
        y1: 0,
        y2: 0
    }, {
        x1: 0,
        x2: 0,
        y1: 0,
        y2: 0
    });
    if (attributes === null) {
        return false;
    }

    return calcLineLength(attributes);
};

/**
 * Calculate length of <circle>
 *
 * @param $element
 * @return {number|boolean}
 */
calculate.circle = $element => {
    let attributes = normalizeAttributes($element, {
        r: 0
    });
    if (attributes === null) {
        return false;
    }

    return 2 * Math.PI * attributes.r;
};

/**
 * Calculate length of <rect>
 *
 * @param $element
 * @return {number|boolean}
 */
calculate.rect = $element => {
    let attributes = normalizeAttributes($element, {
        width: 0,
        height: 0,
        rx: 0,
        ry: 0,
    }, {
        rx: '',
        ry: '',
    });
    if (attributes === null) {
        return false;
    }

    if (attributes.width === 0 || attributes.height === 0) {
        return 0;
    }

    if (attributes.rx !== '' || attributes.ry !== '') {
        // Complex calculation - convert to shape and use PhantomJS to calculate length
        return false;
    }

    return (attributes.width + attributes.height) * 2;
};

/**
 * Calculate length of polygon or polyline
 *
 * @param {string} points
 * @param {boolean} closed
 * @return {number|boolean}
 */
function calcPolyLength(points, closed) {
    let result = 0,
        startX, startY,
        lastX, lastY;

    points = typeof points === 'string' ? points.split(/\s+/) : points;
    points.forEach((point, index) => {
        let coords = typeof point === 'string' ? point.split(',').map(value => parseFloat(value)) : point;
        if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
            throw new Error('Bad coordinates');
        }
        if (!index) {
            startX = lastX = coords[0];
            startY = lastY = coords[1];
            return;
        }

        result += calcLineLength({
            x1: lastX,
            y1: lastY,
            x2: coords[0],
            y2: coords[1]
        });
        lastX = coords[0];
        lastY = coords[1];
    });

    if (closed) {
        result += calcLineLength({
            x1: lastX,
            y1: lastY,
            x2: startX,
            y2: startY
        });
    }

    return result;
}

/**
 * Calculate length of <polyline>
 *
 * @param $element
 * @return {number|boolean}
 */
calculate.polyline = $element => {
    let attributes = normalizeAttributes($element, {
        points: ''
    });
    if (attributes === null) {
        return false;
    }

    try {
        return calcPolyLength(attributes.points, false);
    } catch (err) {
        return 0;
    }
};

/**
 * Calculate length of <polygon>
 *
 * @param $element
 * @return {number|boolean}
 */
calculate.polygon = $element => {
    let attributes = normalizeAttributes($element, {
        points: ''
    });
    if (attributes === null) {
        return false;
    }

    try {
        return calcPolyLength(attributes.points, true);
    } catch (err) {
        return 0;
    }
};

/**
 * Functions to convert shapes to path.
 *
 * Functions get attributes from node, check attributes and call converter function
 *
 * @type {object}
 */
let converter = Object.create(null),
    converterData = {
        rect: {
            attr: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                rx: '',
                ry: '',
            },
            def: {
                x: 0,
                y: 0,
                rx: '',
                ry: '',
            },
            test: attributes => {
                if ((attributes.rx = normalizeNumber(attributes.rx, attributes.width, 'auto')) === null) {
                    return false;
                }
                if ((attributes.ry = normalizeNumber(attributes.ry, attributes.height, 'auto')) === null) {
                    return false;
                }

                // rx and rx are not set
                if (attributes.rx === 'auto' && attributes.ry === 'auto') {
                    attributes.rx = attributes.ry = 0;
                }

                // rx and ry are set
                if (attributes.rx !== 'auto' && attributes.ry !== 'auto') {
                    return true;
                }

                // one attribute is set
                if (attributes.ry === 'auto') {
                    // rx is set
                    if (attributes.width === 0) {
                        return false;
                    }
                    attributes.ry = attributes.height * attributes.rx / attributes.width;
                } else {
                    // ry is set
                    if (attributes.height === 0) {
                        return false;
                    }
                    attributes.rx = attributes.width * attributes.ry / attributes.height;
                }
                return true;
            }
        },
        circle: {
            attr: {
                cx: 0,
                cy: 0,
                r: 0,
            },
            def: {
                cx: 0,
                cy: 0,
            }
        },
        ellipse: {
            attr: {
                cx: 0,
                cy: 0,
                rx: 0,
                ry: 0,
            },
            def: {
                cx: 0,
                cy: 0,
            }
        },
        line: {
            attr: {
                x1: 0,
                x2: 0,
                y1: 0,
                y2: 0,
            },
            def: {
                x1: 0,
                x2: 0,
                y1: 0,
                y2: 0,
            }
        },
        polyline: {
            attr: {
                points: '',
            }
        },
        polygon: {
            attr: {
                points: '',
            }
        },
    };

/**
 * Convert path to... path
 *
 * @param $element
 * @return {string|boolean}
 */
converter.path = $element => {
    let attributes = normalizeAttributes($element, {
        d: ''
    });
    if (attributes === null) {
        return false;
    }

    return attributes.d;
};

/**
 * Convert all other shapes to path
 *
 * @param $element
 * @return {string|boolean}
 */
Object.keys(converterData).forEach(key => {
    let data = converterData[key];
    converter[key] = $element => {
        let attributes = normalizeAttributes($element, data.attr, data.def);
        if (attributes === null) {
            return false;
        }
        if (data.test !== void 0 && data.test(attributes) === false) {
            return false;
        }
        return convert[key](attributes);
    }
});


/**
 * Find lengths of all shapes
 *
 * Must run SVGO optimization before using this module!
 *
 * @param {SVG|Collection} svg SVG or Collection object
 * @param {object} options Options
 * @return {Promise}
 */
module.exports = (svg, options) => {
    return new Promise((fulfill, reject) => {
        options = options === void 0 ? Object.create(null) : options;
        changeOptions(options, defaults);

        let shapes = Object.create(null),
            queue = [],
            tempKeyAttribute = '_lengthKey';

        // Copy items
        let collection = svg instanceof Collection;
        let items;
        if (collection) {
            items = svg;
            items.forEach((svg, key) => {
                svg[tempKeyAttribute] = key;
                shapes[key] = [];
            });
        } else {
            items = new Collection();
            svg[tempKeyAttribute] = 'icon';
            items.add('icon', svg);
            shapes.icon = [];
        }

        // Copy options to overwrite shapeCallback
        let indexOptions = Object.assign(Object.create(null), options);
        indexOptions.checkFillStroke = true;

        // Callback for finding shapes
        indexOptions.shapeCallback = item => {
            let key = item.svg[tempKeyAttribute],
                result = {
                    node: item.$node,
                    index: item.index,
                    fill: item.fill,
                    stroke: item.stroke
                },
                returnValue = false;

            shapes[key].push(result);

            // Callback
            if (options.shapeCallback !== null) {
                returnValue = options.shapeCallback(item);
            }

            // Calculate length
            if (calculate[item.tag] !== void 0) {
                let length = calculate[item.tag](item.$node);
                if (length !== false) {
                    result.length = length;
                    return returnValue;
                }
            }

            if (converter[item.tag] === void 0) {
                // Unknown tag
                if (!options.ignoreErrors) {
                    throw new Error('Cannot calculate length for tag "' + item.tag + '"' + (collection ? ' in icon ' + item.svg[tempKeyAttribute] : '') + '.');
                }
                return false;
            }

            // Get shape
            let path = converter[item.tag](item.$node);
            if (path === false || path === '') {
                // Bad shape
                if (!options.ignoreErrors) {
                    throw new Error('Shape "' + item.tag + '"' + (collection ? ' in icon ' + item.svg[tempKeyAttribute] : '') + ' has bad attributes.');
                }
                return false;
            }

            // Queue for parsing
            result.queueIndex = queue.indexOf(path);
            if (result.queueIndex === -1) {
                result.queueIndex = queue.length;
                queue.push(path);
            }

            return returnValue;
        };

        // Find all shapes
        items.promiseAll(svg => Index(svg, indexOptions)).then(() => {
            if (!queue.length) {
                // Resolved all shapes
                done();
                return;
            }

            // Some shapes are too complex, running real browser to calculate their length
            tmp.setGracefulCleanup();
            let sourceFile = tmp.tmpNameSync({postfix: '.json'}),
                targetFile = tmp.tmpNameSync({postfix: '.json'});

            fs.writeFileSync(sourceFile, JSON.stringify(queue), 'utf8');
            // fs.writeFileSync('_src.' + Date.now() + '.json', JSON.stringify(queue, null, '\t'), 'utf8');

            // Execute
            let params = [__dirname + '/length_script.js', sourceFile, targetFile];
            // console.log('Exec params:', params);

            exec(options.phantomjs + ' ' + params.map(param => '"' + param + '"').join(' '), {
                cwd: __dirname
            }, (error, stdout, stderr) => {
                if (error) {
                    console.log(error);
                    reject('Error executing phantomjs script. Make sure phantomjs is installed');
                    return;
                }

                let data;
                try {
                    data = fs.readFileSync(targetFile, 'utf8');
                    // fs.writeFileSync('_data.' + Date.now() + '.json', data, 'utf8');
                    data = JSON.parse(data);
                } catch (err) {
                    reject('Error executing phantomjs script: temp file is missing');
                    return;
                }

                if (typeof data !== 'object' || !(data instanceof Array) || queue.length !== data.length) {
                    reject('Error executing phantomjs script: wrong result');
                    return;
                }

                // Match data and shapes
                Object.keys(shapes).forEach(key => {
                    shapes[key].forEach(shape => {
                        if (shape.queueIndex !== void 0) {
                            shape.length = data[shape.queueIndex];
                        }
                    });
                });

                done();
            });
        }).catch(err => {
            reject(err);
        });

        /**
         * Create results, fulfill promise
         */
        function done() {
            let results = Object.create(null);

            Object.keys(shapes).forEach(key => {
                results[key] = [];
                shapes[key].forEach(shape => {
                    results[key].push({
                        length: shape.length,
                        fill: shape.fill,
                        stroke: shape.stroke,
                        $node: shape.node
                    })
                });
            });

            fulfill(collection ? results : results.icon);
        }
    });
};