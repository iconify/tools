/**
 * This file is part of the simple-svg-tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

"use strict";

/**
 * Calculate transformation
 *
 * @param {number} rotate Number of 90deg rotations
 * @param {boolean} hFlip True if icon is horizontally flipped
 * @param {boolean} vFlip True if icon is vertically flipped
 * @return {string}
 */
function calculateTransformation(rotate, hFlip, vFlip) {
    function rotation() {
        while (rotate < 1) {
            rotate += 4;
        }
        return 'rotate(' + (rotate * 90) + 'deg)';
    }

    if (vFlip && hFlip) {
        rotate += 2;
        while (rotate > 3) {
            rotate -= 4;
        }
        return rotation();
    }

    if (vFlip || hFlip) {
        return (rotate ? rotation() + ' ' : '') + 'scale(' + (hFlip ? '-' : '') + '1, ' + (vFlip ? '-' : '') + '1)';
    }
    return rotation();
}

module.exports = calculateTransformation;
