/**
 * This file is part of the @json/tools package.
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
const SVGO = require('./svgo');
const SVG = require('../svg');
const Collection = require('../collection');

/**
 * Default options
 *
 * @type {object}
 */
const defaults = {
    // True if SVG needs to be optimized before cropping. Should be enabled for SVG with transformations because
    // PhantomJS has some bugs dealing with transformations
    optimize: false,

    // True if "svg" is list of multiple images {key: svg}
    multiple: false,

    // Round values to grid
    round: true,

    // Cache file
    cropCache: '',

    // PhantomJS command
    phantomjs: 'phantomjs',

    // Format of result. Values: 'collection' = Collection instance, 'svg' = SVG instance, 'string' = string, 'object' = object, '' = auto
    format: '',

    // Grid to round sides to. null = automatic, false = none, value in pixels = fixed value
    defaultCropGrid: null,

    // Limit cropping to descent property. Ignored for objects that do not have descent
    defaultCropLimit: null,

    // Callback for crop: function(item)
    // item = {source: {}, result: {}, options}
    // Modifies item.result
    cropCallback: null,

    // Separate limits for each side, null = ignored
    defaultLeftLimit: null,
    defaultRightLimit: null,
    defaultTopLimit: null,
    defaultBottomLimit: null,
};

/**
 * Generate SVG code
 *
 * @param width
 * @param height
 * @param body
 * @return {string}
 */
function generateSVG(width, height, body) {
    let svg = '<svg';
    svg += ' width="' + width + '"';
    svg += ' height="' + height + '"';
    svg += ' viewBox="0 0 ' + width + ' ' + height + '"';
    svg += ' xmlns="http://www.w3.org/2000/svg">';
    svg += body;
    svg += '</svg>';
    return svg;
}

/**
 * Crop SVG
 *
 * @param {object} svg SVG object or collection. It can also be SVG item or list of items with properties "body", "width", "ascent", "descent"
 * @param {object} [options]
 * @return {Promise}
 */
module.exports = (svg, options) => {
    return new Promise((fulfill, reject) => {
        options = options === void 0 ? {} : options;
        Object.keys(defaults).forEach(key => {
            if (options[key] === void 0) {
                options[key] = defaults[key];
            }
        });

        let cache = {},
            results = [];

        let items = [],
            collection = null;

        // Check for collection
        if (svg instanceof Collection) {
            options.multiple = true;
            collection = svg;
            svg = collection.items;
        }

        // Convert items to array
        if (!options.multiple) {
            items.push({
                key: 'icon',
                source: svg
            });
        } else {
            Object.keys(svg).forEach(key => {
                items.push({
                    key: key,
                    source: svg[key]
                });
            });
        }

        // Convert SVG objects to strings or clone object and adjust properties
        items.forEach(item => {
            if (typeof item.source === 'string') {
                let obj = new SVG(item.source);
                item.source = {
                    body: obj.getBody(),
                    width: obj.width,
                    height: obj.height,
                    left: obj.left,
                    top: obj.top,
                };
            } else if (item.source instanceof SVG) {
                item.source = {
                    body: item.source.getBody(),
                    width: item.source.width,
                    height: item.source.height,
                    left: item.source.left,
                    top: item.source.top,
                };
            } else {
                item.source = Object.assign({}, item.source);
            }

            if (item.source.grid === void 0 && options.defaultCropGrid !== null) {
                item.source.grid = options.defaultCropGrid;
            }
            if (item.source.limit === void 0) {
                if (options.defaultCropLimit !== null) {
                    item.source.limit = options.defaultCropLimit;
                }
            }
            ['Left', 'Right', 'Top', 'Bottom'].forEach(side => {
                if (item.source['limit' + side] === void 0 && options['default' + side + 'Limit'] !== null) {
                    item.source['limit' + side] = options['default' + side + 'Limit'];
                }
            });
        });

        // Check cache
        if (options.cropCache && options.multiple) {
            try {
                let data = JSON.parse(fs.readFileSync(options.cropCache, 'utf8'));
                if (typeof data === 'object') {
                    cache = data;

                    let found = false;
                    items.forEach(item => {
                        if (!item.key || cache[item.key] === void 0) {
                            return;
                        }
                        let cachedData = cache[item.key];
                        if (!cachedData.source || !cachedData.result || !cachedData.body) {
                            return;
                        }

                        // Check if all source attributes match
                        let match = true;
                        let keys = Object.keys(item.source);
                        if (Object.keys(cachedData.source).length !== keys.length) {
                            return;
                        }
                        keys.forEach(key => {
                            if (cachedData.source[key] !== item.source[key]) {
                                match = false;
                            }
                        });
                        if (!match) {
                            return;
                        }

                        // Match!
                        Object.keys(cachedData).forEach(attr => {
                            if (attr !== 'source') {
                                item[attr] = cachedData[attr];
                            }
                        });
                        results.push(item);
                        found = true;
                    });

                    if (found) {
                        // Check if all items have been resolved
                        items = items.filter(item => item.result === void 0);
                        if (!items.length) {
                            // All results have been cached
                            returnResults();
                            return;
                        }
                    }
                }
            } catch (err) {
            }
        }

        /**
         * Optimize images before cropping, if option is enabled
         */
        if (options.optimize) {
            let promises = [];
            items.forEach(item => {
                let source = item.source,
                    height, width;

                if (source.descent === void 0 || source.descent > 0) {
                    height = source.height === void 0 ? source.ascent : source.height;
                } else {
                    height = source.height === void 0 ? source.ascent - source.descent : source.height;
                }
                width = source.width === void 0 ? (source['horiz-adv-x'] === void 0 ? height : source['horiz-adv-x']) : source.width;

                promises.push(SVGO(new SVG(generateSVG(width, height, item.source.body)), {'id-prefix': null}));
            });

            Promise.all(promises).then(results => {
                results.forEach((result, index) => {
                    items[index].body = result.getBody();
                });

                cropImages();
            }).catch(err => {
                reject(err);
            })
        } else {
            cropImages();
        }

        /**
         * Crop images
         */
        function cropImages() {
            // Generate source data
            let data = {};
            items.forEach(item => {
                data[item.key] = item.source;
                if (item.body !== void 0) {
                    // Copy object and overwrite body
                    data[item.key] = Object.assign({}, data[item.key], {
                        body: item.body
                    });
                }
            });

            // Files
            tmp.setGracefulCleanup();
            let sourceFile = tmp.tmpNameSync({postfix: '.json'}),
                targetFile = tmp.tmpNameSync({postfix: '.json'});

            fs.writeFileSync(sourceFile, JSON.stringify(data), 'utf8');
            // fs.writeFileSync('_src.' + Date.now() + '.json', JSON.stringify(data, null, '\t'), 'utf8');

            // Execute
            let params = [__dirname + '/crop_script.js', sourceFile, targetFile];
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

                if (typeof data !== 'object') {
                    reject('Error executing phantomjs script: wrong result');
                    return;
                }

                // Set data
                let found = false;
                items.forEach(item => {
                    if (data[item.key] !== void 0) {
                        item.result = data[item.key];
                        found = true;
                    }
                });

                if (!found) {
                    reject('Error executing phantomjs script: no matches');
                    return;
                }

                // Check for missing items
                if (items.filter(item => item.result === void 0).length) {
                    reject('Not all images have been cropped');
                    return;
                }

                cropResults();
            });
        }

        /**
         * Crop results and move origin to 0 0
         */
        function cropResults() {
            // fs.writeFileSync(__dirname + '/_results' + Object.keys(items).length + '.json', JSON.stringify(items, null, '\t'));

            let promises = [],
                indexes = [];
            items.forEach((item, index) => {
                // Adjust to grid
                let result = item.result;

                if (options.cropCallback !== null) {
                    options.cropCallback(result, options);
                }

                if (options.round) {
                    let grid = result.grid;
                    result.left = Math.floor(result.left / grid) * grid;
                    result.top = Math.floor(result.top / grid) * grid;
                    result.right = Math.ceil(result.right / grid) * grid;
                    result.bottom = Math.ceil(result.bottom / grid) * grid;
                }

                if (result.left !== 0 || result.top !== 0) {
                    let width = result.right - result.left,
                        height = result.bottom - result.top,
                        body = '<g transform="translate(' + (0 - result.left) + ' ' + (0 - result.top) + ')">' + (item.body === void 0 ? item.source.body : item.body) + '</g>';

                    indexes.push(index);
                    promises.push(SVGO(new SVG(generateSVG(width, height, body)), {'id-prefix': null}));
                }
            });

            if (promises.length) {
                Promise.all(promises).then(results => {
                    results.forEach((result, index) => {
                        items[indexes[index]].body = result.getBody();
                    });
                    mergeAndCacheResults();
                    returnResults();
                }).catch(err => {
                    reject(err);
                })
            } else {
                mergeAndCacheResults();
                returnResults();
            }
        }

        /**
         * Merge and cache results
         */
        function mergeAndCacheResults() {
            results = results.concat(items);

            if (options.cropCache && options.multiple) {
                results.forEach(item => {
                    cache[item.key] = item;
                });
                try {
                    fs.writeFileSync(options.cropCache, JSON.stringify(cache, null, '\t'), 'utf8');
                } catch (err) {
                }
            }
        }

        /**
         * Parse data, return results
         */
        function returnResults() {
            let data;

            /**
             * Generate result object
             *
             * @param item
             * @return {*}
             */
            function generateResultObject(item) {
                return Object.assign({
                    body: !item.body ? item.source.body : item.body,
                    left: 0,
                    top: 0,
                    width: item.result.right - item.result.left,
                    height: item.result.bottom - item.result.top,
                }, item.result);
            }

            /**
             * Generate result
             *
             * @param data
             * @param format
             * @param original
             * @param item
             * @return {*}
             */
            function generateResultItem(data, format, original, item) {
                switch (format) {
                    case 'string':
                        return generateSVG(data.width, data.height, data.body);

                    case 'svg':
                    case 'collection':
                        let content = generateSVG(data.width, data.height, data.body),
                            result;

                        if (original instanceof SVG) {
                            original.load(content);
                            result = original;
                        } else {
                            result = new SVG(content);
                        }
                        // {left, top, right, bottom, grid}
                        result._cropData = item.result;
                        return result;

                    case 'object':
                        return Object.assign(typeof original === 'object' ? original : {}, data);

                    default:
                        return generateResultItem(
                            data,
                            typeof original === 'string' ? 'string' : (
                                original instanceof SVG ? 'svg' : 'object'),
                            original,
                            item
                        );
                }
            }

            // Return in same format as source: string, SVG instance or object
            let result;
            if (!options.multiple) {
                result = generateResultItem(generateResultObject(results[0]), options.format, svg, results[0]);
            } else {
                // Check for collection object
                // Make shallow copy to keep old stuff
                svg = Object.assign({}, svg);
                results.forEach(item => {
                    if (typeof svg[item.key] === 'object' && !(svg[item.key] instanceof SVG)) {
                        svg[item.key] = Object.assign({}, svg[item.key]);
                    }
                    svg[item.key] = generateResultItem(generateResultObject(item), options.format, svg[item.key] === void 0 ? {} : svg[item.key], item);
                });

                // Check for collection object
                result = collection !== null ? collection : svg;
            }
            fulfill(result);
        }
    });
};
