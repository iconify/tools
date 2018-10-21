/**
 * This file is part of the @json/tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

"use strict";

/**
 * De-optimize collection items
 *
 * @param {object} collection
 */
function deOptimize(collection) {
    let defaults = {};

    // Get default values for icons
    Object.keys(collection).forEach(function(attr) {
        if (attr === 'icons' || attr === 'aliases' || attr === 'prefix') {
            return;
        }
        if (typeof collection[attr] !== 'object') {
            defaults[attr] = collection[attr];
        }
    });

    // Parse icons
    let defaultKeys = Object.keys(defaults);
    if (collection.icons !== void 0 && defaultKeys.length) {
        let iconKeys = Object.keys(collection.icons);
        defaultKeys.forEach(attr => {
            iconKeys.forEach(key => {
                if (collection.icons[key][attr] === void 0) {
                    collection.icons[key][attr] = defaults[attr];
                }
            });
            delete collection[attr];
        });
    }
}

module.exports = deOptimize;
