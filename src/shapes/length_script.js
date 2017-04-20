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
    webpage = require('webpage'),
    sourceData, html, page, results, resultData;

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

if (typeof sourceData !== 'object' || !(sourceData instanceof Array)) {
    console.log('Expected array');
    phantom.exit();
}

// Generate HTML
html = '<!DOCTYPE html>' +
    '<html lang="en">' +
    '   <head><meta charset="UTF-8"></head>' +
    '   <body>' +
    '       <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16">';
sourceData.forEach(function(item, index) {
    html += '<path data-index="' + index + '" d="' + item + '" />';
});
html += '       </svg>' +
    '   </body>' +
    '</html>';

// Create page
page = webpage.create();
page.setContent(html, 'http://localhost/');

// Render image and parse all shapes
results = page.evaluate(function() {
    var shapes = document.querySelectorAll('path'),
        results = [],
        i, node, length;

    for (i = 0; i < shapes.length; i++) {
        node = shapes[i];
        try {
            length = node.getTotalLength();
        } catch (err) {
            length = false;
        }

        // Save as object because node index might not match data-index
        results.push({
            length: length,
            index: parseInt(node.getAttribute('data-index'))
        });
    }

    return results;
});

// Convert results to array
resultData = [];
sourceData.forEach(function(item, index) {
    for (var i = 0; i < results.length; i++) {
        if (results[i].index === index) {
            resultData.push(results[i].length);
            return;
        }
    }
    resultData.push(false);
});

// Write results
try {
    fs.write(system.args[2], JSON.stringify(resultData, null, '\t'), 'w');
} catch (err) {
    console.log('Error writing to target file');
}
phantom.exit();
