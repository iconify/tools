/**
 * This file is part of the simple-svg-tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

"use strict";

let Modules = {
    // Core
    SVG: require('./svg'),
    Collection: require('./collection'),

    // Optimizations
    SVGO: require('./optimize/svgo'),
    Tags: require('./optimize/tags'),
    Crop: require('./optimize/crop'),

    // Colors
    GetPalette: require('./colors/get_palette'),
    ChangePalette: require('./colors/change_palette'),

    // Export
    ExportSVG: require('./export/svg'),
    ExportDir: require('./export/dir'),
    ExportJSON: require('./export/json'),

    // Import
    ImportSVG: require('./import/svg'),
    ImportDir: require('./import/dir'),
    ImportFont: require('./import/font'),
    ImportWebIcon: require('./import/web_icons'),

    // Misc
    Scale: require('./optimize/scale'),
};

module.exports = Modules;
