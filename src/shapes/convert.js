/**
 * This file is part of the @iconify/tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

"use strict";

const kappa = 0.5522847498307935;

/**
 * Functions for converting shapes to path.
 *
 * All functions assume that attributes are valid.
 * Check attributes before calling functions or bad things might happen.
 *
 * @type {object}
 */
let convert = {};

/**
 * Convert rectangle to path
 *
 * @param {{x, y, width, height, rx, ry}} attr
 */
convert.rect = attr => {
    let path;

    if (attr.rx === 0 && attr.ry === 0) {
        // Move to left, top
        path = 'M ' + attr.x + ' ' + attr.y + ' ';
        // Horizontal line
        path += 'H ' + (attr.x + attr.width) + ' ';
        // Vertical line
        path += 'V ' + (attr.y + attr.height) + ' ';
        // Horizontal line
        path += 'H ' + attr.x + ' ';
        // Vertical line
        path += 'V ' + attr.y + ' ';
        // Close path
        path += 'Z';
    } else {
        let right = attr.x + attr.width,
            bottom = attr.y + attr.height;

        // Using quadratic Bezier curve commands
        /*
         // Move to left + arc width, top
         path = 'M ' + (attr.x + attr.rx) + ' ' + attr.y + ' ';
         // Horizontal line to right - arc width, top
         path += 'H ' + (attr.x + attr.width - attr.rx) + ' ';
         // Arc
         path += 'Q ' + right + ' ' + attr.y + ' ' + right + ' ' + (attr.y + attr.ry) + ' ';
         // Vertical line to right, bottom - arc height
         path += 'V ' + (attr.y + attr.height - attr.ry) + ' ';
         // Arc
         path += 'Q ' + right + ' ' + bottom + ' ' + (right - attr.rx) + ' ' + bottom + ' ';
         // Horizontal line to left + arc width, bottom
         path += 'H ' + (attr.x + attr.rx) + ' ';
         // Arc
         path += 'Q ' + attr.x + ' ' + bottom + ' ' + attr.x + ' ' + (bottom - attr.ry) + ' ';
         // Vertical line to left, top + arc height
         path += 'V ' + (attr.y + attr.ry) + ' ';
         // Arc
         path += 'Q ' + attr.x + ' ' + attr.y + ' ' + (attr.x + attr.rx) + ' ' + attr.y + ' ';
         // Close path
         path += 'Z';
         */

        // Using cubic Bezier curve commands
        let dx = attr.rx * kappa,
            dy = attr.ry * kappa;

        // Move to left + arc width, top
        path = 'M ' + (attr.x + attr.rx) + ' ' + attr.y + ' ';
        // Horizontal line to right - arc width, top
        path += 'H ' + (right - attr.rx) + ' ';
        // First arc
        path += 'c ' + dx + ' 0 ' +
            attr.rx + ' ' + (attr.ry - dy) + ' ' +
            attr.rx + ' ' + attr.ry + ' ';
        // Vertical line to right, bottom - arc height
        path += 'V ' + (bottom - attr.ry) + ' ';
        // Second arc
        path += 'c 0 ' + dy + ' ' +
            (0 - attr.rx + dx) + ' ' + attr.ry + ' ' +
            (0 - attr.rx) + ' ' + attr.ry + ' ';
        // Horizontal line to left + arc width, bottom
        path += 'H ' + (attr.x + attr.rx) + ' ';
        // Third arc
        path += 'c ' + (0 - dx) + ' 0 ' +
            (0 - attr.rx) + ' ' + (0 - attr.ry + dy) + ' ' +
            (0 - attr.rx) + ' ' + (0 - attr.ry) + ' ';
        // Vertical line to left, top + arc height
        path += 'V ' + (attr.y + attr.ry) + ' ';
        // Fourth arc
        path += 'c 0 ' + (0 - dy) + ' ' +
            (attr.rx - dx) + ' ' + (0 - attr.ry) + ' ' +
            attr.rx + ' ' + (0 - attr.ry) + ' ';
        // Close path
        path += 'Z';
    }

    return path;
};

/**
 * Convert ellipse to path
 *
 * @param {{cx, cy, rx, ry}} attr
 */
convert.ellipse = attr => {
    let dx = attr.rx * kappa,
        dy = attr.ry * kappa,
        path;

    // Move to top
    path = 'M ' + attr.cx + ' ' + (attr.cy - attr.ry) + ' ';
    // First arc
    path += 'C ' + (attr.cx + dx) + ' ' + (attr.cy - attr.ry) + ' ' +
        (attr.cx + attr.rx) + ' ' + (attr.cy - dy) + ' ' +
        (attr.cx + attr.rx) + ' ' + attr.cy + ' ';
    // Second arc
    path += 'C ' + (attr.cx + attr.rx) + ' ' + (attr.cy + dy) + ' ' +
        (attr.cx + dx) + ' ' + (attr.cy + attr.ry) + ' ' +
        attr.cx + ' ' + (attr.cy + attr.ry) + ' ';
    // Third arc
    path += 'C ' + (attr.cx - dx) + ' ' + (attr.cy + attr.ry) + ' ' +
        (attr.cx - attr.rx) + ' ' + (attr.cy + dy) + ' ' +
        (attr.cx - attr.rx) + ' ' + attr.cy + ' ';
    // Fourth arc
    path += 'C ' + (attr.cx - attr.rx) + ' ' + (attr.cy - dy) + ' ' +
        (attr.cx - dx) + ' ' + (attr.cy - attr.ry) + ' ' +
        attr.cx + ' ' + (attr.cy - attr.ry) + ' ';
    // Close path
    path += 'Z';

    return path;
};

/**
 * Convert circle to path
 *
 * @param {{cx, cy, r}} attr
 */
convert.circle = attr => {
    return convert.ellipse({
        cx: attr.cx,
        cy: attr.cy,
        rx: attr.r,
        ry: attr.r
    });
};

/**
 * Convert polyline to path
 *
 * @param {{points}} attr
 */
convert.polyline = attr => {
    let points = typeof attr.points === 'string' ? attr.points.split(/\s+/) : attr.points,
        path = '';

    points.forEach((point, index) => {
        path += (index ? 'L ' : 'M ') + point.replace(',', ' ') + ' ';
    });

    return path.trim();
};

/**
 * Convert polygon to path
 *
 * @param {{points}} attr
 */
convert.polygon = attr => {
    return convert.polyline(attr) + ' Z';
};


module.exports = convert;