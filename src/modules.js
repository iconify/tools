/**
 * This file is part of the @iconify/tools package.
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
    ImportJSON: require('./import/json'),

    // Shapes
    IndexShapes: require('./shapes/index'),
    ShapeLengths: require('./shapes/length'),
    ConvertShapes: require('./shapes/convert'),

    // Misc
    Scale: require('./optimize/scale'),

    // Iconify.design specific modules
    Scriptify: require('./json/scriptify'),
    JSONOptimize: require('./json/optimize'),
    JSONDeOptimize: require('./json/deoptimize'),
    JSONPrefix: require('./json/prefix'),
    JSONBundle: require('./json/bundle')
};

module.exports = Modules;
