/**
 * This file is part of the simple-svg-tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

"use strict";

var unitsSplit = /(-?[0-9.]*[0-9]+[0-9.]*)/g,
    unitsTest = /^-?[0-9.]*[0-9]+[0-9.]*$/g;

/**
 * Calculate second dimension when only 1 dimension is set
 *
 * @param {string|number} size One dimension (such as width)
 * @param {number} ratio Width/height ratio.
 *      If size == width, ratio = height/width
 *      If size == height, ratio = width/height
 * @param {number} [precision] Floating number precision in result to minimize output. Default = 100
 * @return {string|number|null} Another dimension, null on error
 */
function calculateDimension(size, ratio, precision) {
    var split, number;

    if (ratio === 1) {
        return size;
    }

    precision = precision === void 0 ? 100 : precision;
    if (typeof size === 'number') {
        return Math.ceil(size * ratio * precision) / precision;
    }

    // split code into sets of strings and numbers
    split = size.split(unitsSplit);
    if (split === null || !split.length) {
        return null;
    }
    let results = [],
        code = split.shift(),
        isNumber = unitsTest.test(code),
        valid = false,
        num;

    while (true) {
        if (isNumber) {
            num = parseFloat(code);
            if (isNaN(num)) {
                return null;
            }
            valid = true;
            results.push(Math.ceil(num * ratio * precision) / precision);
        } else {
            results.push(code);
        }

        // next
        code = split.shift();
        if (code === void 0) {
            return valid ? results.join('') : null;
        }
        isNumber = !isNumber;
    }
}

module.exports = calculateDimension;
