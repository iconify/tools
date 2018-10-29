/**
 * This file is part of the @iconify/tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

"use strict";

const _optimizeProps = ['width', 'height', 'top', 'left', 'inlineHeight', 'inlineTop', 'verticalAlign'];

/**
 * Optimize collection items, moving common values to root object
 *
 * @param {object} collection
 * @param {Array} [props]
 */
function optimize(collection, props) {
    let icons = Object.keys(collection.icons);

    props = props === void 0 ? _optimizeProps : props;

    // Delete empty aliases list
    if (collection.aliases !== void 0 && !Object.keys(collection.aliases).length) {
        delete collection.aliases;
    }

    // Check all attributes
    props.forEach(prop => {
        let maxCount = 0,
            maxValue = false,
            counters = {};

        for (let i = 0; i < icons.length; i++) {
            let item = collection.icons[icons[i]];

            if (item[prop] === void 0) {
                return;
            }

            let value = item[prop];

            if (!maxCount) {
                // First item
                maxCount = 1;
                maxValue = value;
                counters[value] = 1;
                continue;
            }

            if (counters[value] === void 0) {
                // First entry for new value
                counters[value] = 1;
                continue;
            }

            counters[value] ++;
            if (counters[value] > maxCount) {
                maxCount = counters[value];
                maxValue = value;
            }
        }

        if (maxCount > 1) {
            // Remove duplicate values
            collection[prop] = maxValue;
            icons.forEach(key => {
                if (collection.icons[key][prop] === maxValue) {
                    delete collection.icons[key][prop];
                }
            });
        }
    });
}

module.exports = optimize;
