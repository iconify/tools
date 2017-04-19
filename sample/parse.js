/**
 * This is a sample file showing how to optimize SVG files.
 *
 * In directory "source" there are several unoptimized SVG files exported from Sketch.
 *
 * Run this file in Node.js: node parse
 *
 * It will optimize SVG images from directory "source" and save them to "optimized/svg".
 * It will also save icons as JSON collection in SimpleSVG format, which you can use to add custom icons to SimpleSVG.
 */
"use strict";

const fs = require('fs');
// const tools = require('simple-svg-tools');
const tools = require('../src/modules');

let collection;
let sourceDir = 'source';

// Create directories
try {
    fs.mkdirSync('optimized');
} catch (err) {
}
try {
    fs.mkdirSync('optimized/svg');
} catch (err) {
}

// Do stuff
tools.ImportDir(sourceDir).then(result => {
    collection = result;
    console.log('Found ' + collection.length() + ' icons.');

    // SVGO optimization
    return collection.promiseAll(svg => tools.SVGO(svg));
}).then(() => {
    // Clean up tags
    return collection.promiseAll(svg => tools.Tags(svg));
}).then(() => {
    // Get palette
    return collection.promiseAll(svg => tools.GetPalette(svg));
}).then(results => {
    // Replace colors. Remove this bit if all your images are supposed to have preset color palette.
    let promises = [];

    Object.keys(results).forEach(key => {
        if (results[key].colors.length < 2) {
            // Add/change color for images with less than 2 colors
            promises.push(tools.ChangePalette(collection.items[key], {
                add: 'currentColor',
                default: 'currentColor'
            }));
        }
    });

    return Promise.all(promises);
}).then(() => {
    // SVGO optimization again. Might make files smaller after color/tags changes
    return collection.promiseAll(svg => tools.SVGO(svg));
}).then(() => {
    // Export as optimized SVG icons
    return tools.ExportDir(collection, 'optimized/svg');
}).then(() => {
    // Export as JSON
    return tools.ExportJSON(collection, 'optimized/icons.json', {
        minify: false,
        optimize: true
    });
}).then(() => {
    console.log('Parsed ' + collection.length() + ' icons.');
}).catch(err => {
    console.log(err);
});