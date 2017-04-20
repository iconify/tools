/**
 * This file is part of the simple-svg-tools package.
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
    resultData = {},
    sourceData, keys;

if (system.args.length < 3) {
    console.log('Invalid arguments. Requires 2 arguments: source.json target.json');
    phantom.exit();
}

var debug = (system.args.length > 3 && system.args[3] === '--debug');

try {
    sourceData = JSON.parse(fs.read(system.args[1]));
} catch (err) {
    console.log('Error reading source file.');
    phantom.exit();
}

if (typeof sourceData !== 'object') {
    console.log('Expected array');
    phantom.exit();
}

/*

    sourceData object:

    {
        key: {
            body: [array of SVG body strings],
            width: number,
            height: number
        }
    }

 */

// Get all keys, parse next key
keys = Object.keys(sourceData);
next();

/**
 * Parse next set of images
 */
function next() {
    var key = keys.shift(),
        images, width, height,
        loading, queue, html;

    if (key === void 0) {
        // Done
        try {
            fs.write(system.args[2], JSON.stringify(resultData, null, '\t'), 'w');
        } catch (err) {
            console.log('Error writing to target file');
        }
        phantom.exit();
    }

    // Compare next set of SVG images
    images = [];
    html = [];
    width = sourceData[key].width;
    height = sourceData[key].height;
    loading = true;
    queue = 0;
    sourceData[key].body.forEach(function(body) {
        var image = new Image(),
            svg;

        image.onload = function() {
            queue --;
            if (!loading && !queue) {
                loaded();
            }
        };

        svg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">' + body + '</svg>';
        html.push(svg);
        images.push(image);
        queue ++;
        image.src = 'data:image/svg+xml;base64,' + btoa(svg);
    });

    loading = false;
    if (!queue) {
        loaded();
    }

    /**
     * Loaded images
     */
    function loaded() {
        var match = true,
            lastURL = '',
            urls = [],
            debugOutput;

        images.forEach(function(image, index) {
            var canvas = document.createElement('canvas'),
                ctx, url;

            canvas.setAttribute('width', width);
            canvas.setAttribute('height', height);
            ctx = canvas.getContext('2d');

            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(image, 0, 0, width, height, 0, 0, width, height);

            // Get URL
            url = canvas.toDataURL('image/png');
            urls.push(url);
            if (index > 0) {
                if (lastURL !== url) {
                    match = false;
                }
            }
            lastURL = url;
        });

        resultData[key] = {
            match: match
        };
        if (!match) {
            resultData[key].svg = html;
            if (debug || sourceData[key].debug) {
                debugOutput = '<!DOCTYPE html>' +
                    '<html lang="en">' +
                    '   <head><meta charset="UTF-8"></head>' +
                    '   <style>' +
                    '       html, body { margin: 0; padding: 0; } ' +
                    '       p { clear: both; }' +
                    '       svg { margin: 8px; border: 1px solid #ccc; float: left; }' +
                    '       div { position: relative; }' +
                    '       div svg { position: absolute; top: 0; left: 0; opacity: ' + (1 / html.length) + '; border-width: 0; margin: 0; } '+
                    '   </style>' +
                    '   <body>' +
                    '       <p>Each SVG image has gray border. Compare them visually.</p>';

                html.forEach(function(html) {
                    debugOutput += html;
                });
                debugOutput += '<p>All images on top of each other:</p><div>';
                html.forEach(function(html) {
                    debugOutput += html;
                });
                debugOutput += '</div>' +
                    '</body>' +
                    '</html>';

                fs.write('_' + key + '.html', debugOutput, 'w');
            }
        }

        setTimeout(next);
    }
}