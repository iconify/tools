/**
 * This file is part of the @iconify/tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * This script is for phantomjs, not nodejs
 */
"use strict";

var system = require('system'),
    fs = require('fs'),
    webpage = require('webpage'),
    data, keys, results;

var scales = [2, 3, 5, 7, 11, 13];
var sides = ['Left', 'Right', 'Top', 'Bottom'];

if (system.args.length < 3) {
    console.log('Invalid arguments. Requires 2 arguments: source.json target.json');
    phantom.exit();
}

var debug = (system.args.length > 3 && system.args[3] === '--debug');

try {
    data = JSON.parse(fs.read(system.args[1]));
} catch (err) {
    console.log('Error reading source file.');
    phantom.exit();
}
keys = Object.keys(data);
if (debug) {
    console.log('Parsing ' + keys.length + ' items...');
}
results = {};

next();


/**
 * Find numbers dimensions can be divided by
 *
 * @param {string} key
 * @return {Array}
 */
function findDivisionPoints(key) {
    var item = data[key],
        height,
        ascent,
        descent,
        results = [],
        scale = 1,
        match;

    if (item.descent === void 0 || item.descent > 0) {
        height = item.height === void 0 ? item.ascent : item.height;
        ascent = height;
        descent = 0;
    } else {
        descent = 0 - item.descent;
        ascent = item.ascent;
        height = item.height === void 0 ? ascent + descent : item.height;
    }

    function findMatch() {
        var i, test, testScale;

        for (i = 0; i < scales.length; i ++) {
            test = scales[i];
            if (
                (ascent / scale) % test === 0 &&
                (!descent || (descent / scale) % test === 0)
            ) {
                testScale = scale * test;
                if (testScale >= ascent || (descent && testScale >= descent) || height / testScale < 16) {
                    return false;
                }
                return test;
            }
        }
        return false;
    }

    while ((match = findMatch()) !== false) {
        scale *= match;
        results.push(match);
    }
    return results;
}

/**
 * Parse next item
 */
function next() {
    var key = keys.shift();

    if (key === void 0) {
        try {
            fs.write(system.args[2], JSON.stringify(results, null, '\t'), 'w');
        } catch (err) {
            console.log('Error writing to target file');
        }
        phantom.exit();
        return;
    }

    var item = data[key],
        limited = item.limit === void 0 ? item.descent !== void 0 && item.descent < 0 : item.limit,
        itemWidth,
        itemHeight,
        ascent,
        descent,
        offset = 0 - item.descent;

    // Calculate height from ascent/descent attributes from font
    if (item.descent === void 0 || item.descent > 0) {
        itemHeight = item.height === void 0 ? item.ascent : item.height;
        ascent = itemHeight;
        descent = 0;
    } else {
        descent = 0 - item.descent;
        ascent = item.ascent;
        itemHeight = item.height === void 0 ? ascent + descent : item.height;
    }

    // Add origin
    if (item.top === void 0) {
        item.top = 0;
    }
    if (item.left === void 0) {
        item.left = 0;
    }

    // Calculate divisions and grid
    var division = findDivisionPoints(key),
        scale = 1,
        grid = item.grid === void 0 ? 1 : item.grid;

    division.forEach(function(div) {
        scale *= div;
        if (item.grid === void 0 && itemHeight / (grid * div) > 40) {
            grid *= div;
        }
    });

    // Get item dimensions rounded to grid, offset (change in any direction when extending viewBox)
    itemWidth = item.width === void 0 ? (item['horiz-adv-x'] === void 0 ? itemHeight : item['horiz-adv-x']) : item.width;
    if (descent) {
        offset = descent;
    } else {
        offset = grid;
        if (item.limit === void 0) {
            limited = false;
        }
    }
    offset = Math.ceil(offset / scale) * scale;

    var roundedItemWidth = Math.ceil(itemWidth / scale) * scale;
    var roundedItemHeight = Math.ceil(itemHeight / scale) * scale;

    // console.log(key + ' scale =', scale, ' offset =', offset, ' grid =', grid);

    var offsetTop = offset,
        offsetLeft = offset,
        offsetRight = offset,
        offsetBottom = offset;

    var showedResizeNotice = false;

    /**
     * Generate SVG code
     *
     * @param {object} size
     * @return {string}
     */
    function svg(size) {
        return '<svg ' +
            'width="' + size.width + '" height="' + size.height + '" ' +
            'viewBox="' + size.left + ' ' + size.top + ' ' + size.width + ' ' + size.height + '" ' +
            'xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' + item.body + '</svg>';
    }

    /**
     * Create canvas object, return context
     *
     * @param {number} width
     * @param {number} height
     * @return {object}
     */
    function createCanvas(width, height) {
        var canvas = document.createElement('canvas');

        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);

        return {
            canvas: canvas,
            ctx: canvas.getContext('2d'),
            width: width,
            height: height
        };
    }

    /**
     * Create canvas and draw image on it
     *
     * @param {Image} image
     * @param {object} size
     * @param {number} scale
     * @return {{width, height, left, top, canvasWidth, canvasHeight, canvas, ctx, scale}}
     */
    function drawImage(image, size, scale) {
        var canvasWidth = size.width / scale,
            canvasHeight = size.height / scale,
            canvas = createCanvas(canvasWidth, canvasHeight);

        canvas.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        canvas.ctx.drawImage(image, 0, 0, size.width, size.height, 0, 0, canvasWidth, canvasHeight);

        Object.keys(size).forEach(function(key) {
            canvas[key] = size[key];
        });
        canvas.canvasWidth = canvasWidth;
        canvas.canvasHeight = canvasHeight;
        canvas.scale = scale;

        return canvas;
    }

    /**
     * Check horizontal line for empty pixels
     *
     * @param canvas
     * @param y
     * @param minX
     * @param maxX
     * @return {boolean}
     */
    function testHorizontalLine(canvas, y, minX, maxX) {
        var pixels = canvas.ctx.getImageData(0, y, canvas.canvasWidth, 1).data,
            x;

        for (x = minX; x < maxX; x ++) {
            if (pixels[x * 4 + 3] > 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check vertical line for empty pixels
     *
     * @param canvas
     * @param x
     * @param minY
     * @param maxY
     * @return {boolean}
     */
    function testVerticalLine(canvas, x, minY, maxY) {
        var pixels = canvas.ctx.getImageData(x, 0, 1, canvas.canvasHeight).data,
            y;

        for (y = minY; y < maxY; y ++) {
            if (pixels[y * 4 + 3] > 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * Load image
     */
    function testImage() {
        var image = new Image();
        var size = {
            width: roundedItemWidth + offsetLeft + offsetRight,
            height: roundedItemHeight + offsetTop + offsetBottom,
            left: item.left - offsetLeft,
            top: item.top - offsetTop
        };
        var limits;

        /**
         * Scan canvas for empty rows/columns, change limits
         * @param canvas
         */
        function testCanvas(canvas) {
            var x, y, left, right, top, bottom;
            // console.log('Testing canvas. Scale = ' + scale);

            left = (limits.left.current - size.left) / scale;
            right = (limits.right.current - size.left) / scale;

            // Crop at top
            for (y = limits.top.current; y <= limits.top.max; y += scale) {
                limits.top.current = y;
                if (!testHorizontalLine(canvas, (y - size.top) / scale, left, right)) {
                    // console.log('Failed at y:', (y - size.top) / scale);
                    break;
                }
            }

            // Crop at bottom
            for (y = limits.bottom.current; y >= limits.bottom.min; y -= scale) {
                if (!testHorizontalLine(canvas, (y - size.top) / scale, left, right)) {
                    break;
                }
                limits.bottom.current = y;
            }

            top = (limits.top.current - size.top) / scale;
            bottom = (limits.bottom.current - size.top) / scale;

            // Crop on left side
            for (x = limits.left.current; x <= limits.left.max; x += scale) {
                limits.left.current = x;
                if (!testVerticalLine(canvas, (x - size.left) / scale, top, bottom)) {
                    break;
                }
            }

            // Crop at bottom
            for (x = limits.right.current; x >= limits.right.min; x -= scale) {
                if (!testVerticalLine(canvas, (x - size.left) / scale, top, bottom)) {
                    break;
                }
                limits.right.current = x;
            }

            /*
            // Save debug pictures
            canvas.ctx.fillStyle = 'rgba(255, 0, 0, .1)';
            canvas.ctx.fillRect((limits.left.current - size.left) / scale, (limits.top.current - size.top) / scale, (limits.right.current - limits.left.current) / scale, (limits.bottom.current - limits.top.current) / scale);

            var curLeft = Math.floor(limits.left.current / grid) * grid;
            var curTop = Math.floor(limits.top.current / grid) * grid;
            var curRight = Math.ceil(limits.right.current / grid) * grid;
            var curBottom = Math.ceil(limits.bottom.current / grid) * grid;

            canvas.ctx.fillStyle = 'rgba(0, 255, 0, .1)';
            canvas.ctx.fillRect((curLeft - size.left) / scale, (curTop - size.top) / scale, (curRight - curLeft) / scale, (curBottom - curTop) / scale);

            canvas.ctx.fillStyle = 'rgba(0, 0, 255, .1)';
            canvas.ctx.fillRect(0 - size.left / scale, 0 - size.top / scale, itemWidth / scale, itemHeight / scale);

            fs.write('_' + key + '.' + scale + '.html', '<img src="' + canvas.canvas.toDataURL('image/png') + '" />', 'w');
            */
        }

        /**
         * Loaded image - check edges on scaled down sample, extend edges if needed
         */
        image.onload = function() {
            var canvas = drawImage(image, size, scale),
                redraw = false,
                sideLimits = {},
                limitMultipliers = {};

            // Check all sides for filled pixels
            if (!testVerticalLine(canvas, 0, 0, size.width / scale)) {
                offsetLeft += offset;
                redraw = true;
            }
            if (!testVerticalLine(canvas, canvas.canvasWidth - 1, 0, size.width / scale)) {
                offsetRight += offset;
                redraw = true;
            }
            if (!testHorizontalLine(canvas, 0, 0, size.height / scale)) {
                offsetTop += offset;
                redraw = true;
            }
            if (!testHorizontalLine(canvas, canvas.canvasHeight - 1, 0, size.height / scale)) {
                offsetBottom += offset;
                redraw = true;
            }

            if (redraw) {
                if (!showedResizeNotice && debug) {
                    console.log(key + ' has some off-canvas items. Increasing canvas area...');
                    showedResizeNotice = true;
                }
                setTimeout(testImage, 0);
                return;
            }

            // fs.write('_' + key + '.' + scale + '.html', '<img src="' + canvas.canvas.toDataURL('image/png') + '" />', 'w');

            // Set canvas limits
            sides.forEach(function(side) {
                sideLimits[side] = !descent || item['limit' + side] === void 0 ? limited : item['limit' + side];
                limitMultipliers[side] = typeof sideLimits[side] === 'number' ? sideLimits[side] : 1;
            });

            limits = {
                left: {
                    min: size.left,
                    max: sideLimits.Left === false ? size.width / 2 + size.left : descent * limitMultipliers.Left
                },
                top: {
                    min: size.top,
                    max: sideLimits.Top === false ? size.height / 2 + size.top : descent * limitMultipliers.Top
                },
                right: {
                    min: sideLimits.Right === false ? size.width / 2 + size.left : itemWidth - (descent * limitMultipliers.Right),
                    max: size.left + size.width
                },
                bottom: {
                    min: sideLimits.Bottom === false ? size.height / 2 + size.top : itemHeight - (descent * limitMultipliers.Bottom),
                    max: size.top + size.height
                }
            };
            limits.left.current = limits.left.min;
            limits.top.current = limits.top.min;
            limits.right.current = limits.right.max;
            limits.bottom.current = limits.bottom.max;

            // console.log('Limits for ' + key + '@' + scale + ':', JSON.stringify(limits, null, 4));

            // Image is loaded and entire icon fits in it. Canvas has smallest image
            testCanvas(canvas, scale);
            var div;
            while ((div = division.shift()) !== void 0) {
                scale /= div;
                canvas = drawImage(image, size, scale);
                testCanvas(canvas, scale);
            }

            if (debug) {
                console.log('Limits for ' + key + ':', JSON.stringify(limits, null, 4));
            }

            results[key] = {
                left: limits.left.current,
                top: limits.top.current,
                right: limits.right.current,
                bottom: limits.bottom.current,
                grid: grid
            };

            setTimeout(next);
            // phantom.exit();
        };
        image.src = 'data:image/svg+xml;base64,' + btoa(svg(size));
    }

    testImage();
}
