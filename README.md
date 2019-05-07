# Iconify Tools

This library is a collection of tools for importing, exporting and processing SVG images. 

Its main purpose is to convert icon sets and fonts to Iconify JSON collections, but it can be used for other purposes.

## Installation

First install it by running this command:

```
npm install @iconify/tools --save
```

Then you can use it in your Node.js files:

```
const tools = require('@iconify/tools');
```

## What tools are available?

* Import SVG from various sources
* Export SVG to various formats
* Optimize images
* Crop images
* Clean up images
* Get/change color palette
* Find shapes, get lengths of shapes
* Convert shapes to paths

## Core

Core of tools are SVG and Collections classes. All tools create or manipulate instances of SVG or Collection classes.

All tools are based on Promises. If you are not familiar with JavaScript Promises, do read up. There are many tutorials
available online. Make sure you are reading something from 2016 or newer, not tutorials for old implementations.

### SVG class

SVG class represents one SVG image. It is a simple class, it does not manipulate anything, except for
cleaning up junk code that could otherwise cause XML parser to fail.

You can find code in src/svg.js

Creating SVG instance is easy:

```
let svg = new tools.SVG('<svg ...></svg>');
```

That code will load SVG from string, extract image dimensions and clean up a bit, removing all junk image editors left
behind.

SVG instance has multiple methods to get SVG as string:

* svg.toString() - returns SVG as string
* svg.toMinifiedString() - same as toString(), but without white spaces
* svg.getBody() - returns body as string: child elements of `<svg>` element.

Then you can get dimensions:

* svg.getDimensions() - returns object containing width and height properties
* svg.width - returns width
* svg.height - returns height

Last method replaces content of SVG instance:

* svg.load(content) - same as constructor, but instead of making new instance it changes existing instance.

You can see usage examples in unit tests: tests/core/svg_test.js

### Collection class

Collection is a set of SVG instances.

You can find code in src/collection.js

To create Collection instance use this:

```
let collection = new tools.Collection();
```

That will create empty collection.

To clone another collection add collection as parameter to constructor:

```
let newCollection = new tools.Collection(oldCollection);
```

To add/remove items there are several methods:

* collection.add('icon-name', svg) - add new item to collection
* collection.remove('icon-name') - remove item from collection
* collection.rename('old-name', 'new-name') - rename item

where "svg" is instance of SVG class

To access any item use this:

* collection.items['item-name']

There are other helpful functions:

* collection.length() - returns number of items in collection
* collection.keys() - returns list of all icon names

Then there are main functions that are used to manipulate SVG instances in collection:

* collection.forEach(callback) - iterates through all SVG instances. Callback function arguments: (svg, name), where svg is SVG instance, name is icon name.
* collection.promiseAll(promise) - runs promise on all items in collection. It is similar to Promise.all()
* collection.promiseEach(promise, stopOnError) - runs promise on all items in collection, but only one at a time.

How to use forEach():

```
collection.forEach((svg, name) {
    console.log('Found icon ' + name + ': ' + svg.toString());
});
```

How to use promiseAll() and promiseEach():

```
collection.promiseAll((svg, name) => {
    return new Promise((fulfill, reject) {
        // do stuff to "svg" variable
        fulfill('Result for icon ' + name);
    });
}).then(results => {
    // Results of all promises as object. Key = icon name, value = result for that icon

    Object.keys(results).forEach(name => {
        console.log('Result for icon ' + name + ':', results[name]);
    });
}).catch(err => {
    console.error('Promise failed:', err);
});
```

promiseAll() and promiseEach() are almost identical. First argument is callback that returns Promise for one icon.

The only difference is promiseAll() runs all promises at the same time using Promise.all() function, promiseEach() runs promises one after another. It is better to use promiseEach() when dealing with large collections.

You can find examples throughout this library and unit tests. Everything in this library is based on promises.

## Importing

There are several importers available. Some import one file, some import collections.

### Importing one SVG file

```
tools.ImportSVG('path-to-file.svg').then(svg => {
    // SVG was imported
    // Variable 'svg' is instance of SVG class
    console.log(svg.toString());
}).catch(err => {
    console.error(err);
});
```

### Importing directory

```
tools.ImportDir('directory').then(collection => {
    // Collection was imported
    // Variable 'collection' is instance of Collection class
    console.log('Found icons: ' + collection.keys().join(', '));
}).catch(err => {
    console.error(err);
});
```

There are several options available for importing directory, options should be passed as second parameter to ImportDir
function:

* 'include-subdirs' - check subdirectories. Default = true
* keywordCallback - custom callback to get image name from file. It is a function with 2 arguments: function(file_without_extension, filename). Function should return string. See default function in src/import/dir.js for example
* ignoreDuplicates - if true, when files with duplicate keywords are found script will log a error message.
* ignoreFiles - array of files to ignore. Values are keywords, not file names.
* contentCallback - callback to change content. Use it if content contains some weird stuff you need to remove before importing SVG. function(content). Function should return modified content as string.

```
tools.ImportDir('directory', {
    'include-subdirs': false,
    ignoreFiles: ['bad-icon'],
    keywordCallback: (file, filename) => 'prefix-' + file
}).then(collection => {
    // Collection was imported
    // Variable 'collection' is instance of Collection class
    console.log('Found icons: ' + collection.keys().join(', '));
}).catch(err => {
    console.error(err);
});
```

### Importing WebIcon

WebIcon format is one big SVG image that contains multiple images.

```
tools.ImportWebIcon('path-to-file.svg').then(collection => {
    // Collection was imported
    // Variable 'collection' is instance of Collection class
    console.log('Found icons: ' + collection.keys().join(', '));
}).catch(err => {
    console.error(err);
});
```

### Importing SVG font

There are many popular glyph fonts, such as FontAwesome, that are not available as individual files. This importer will
import SVG font as collection. It will not import keywords though for each icon - that is different for every
collection and should be done separately.

```
tools.ImportFont('path-to-file.svg').then(collection => {
    // Collection was imported
    // Variable 'collection' is instance of Collection class
    console.log('Found icons: ' + collection.keys().join(', '));
}).catch(err => {
    console.error(err);
});
```

There are several options available for importing SVG font, options should be passed as second parameter to ImportFont
function:

* ignoreCharacters - list of characters to ignore. Array
* characterChanges - changes for each character, object. Key is character's hexadecimal code, value is list of changes for that character.
* fontChanges - changes for all characters

Keys for characterChanges and fontChanges objects are similar:

* height, width - custom height and width
* left, bottom - custom left and bottom indexes. Why bottom instead of top? SVG fonts flip icons vertically, so height is counted from bottom

Each value can be a number or a function(oldValue) that should return new value.

Example:

```
tools.ImportFont('path-to-file.svg', {
    fontChanges: {
        height = height => Math.ceil(height / 16) * 16 // Round up height to 16px grid
    },
    characterChanges: {
        f19c: { width: 1920 },
        f0fc: { left: 64, width: 1600 },
    }
}).then(collection => {
    // Collection was imported
    // Variable 'collection' is instance of Collection class
    console.log('Found icons: ' + collection.keys().join(', '));
}).catch(err => {
    console.error(err);
});
```

If you are going to crop images after import, there is no point in worrying about fixing characters. Crop will fix it (unless font is really badly messed up).

## Exporting

There are several exporters available that work with Collection or SVG instances:

### Exporting SVG

Exports one SVG instance.

```
tools.ExportSVG(svg, 'filename.svg').then(() => {
    console.log('Exported!');
}).catch(err => {
    console.error(err);
});
```

### Exporting collection to directory

```
tools.ExportDir(collection, 'directory').then(count => {
    console.log('Exported ' + count + ' files');
}).catch(err => {
    console.error(err);
});
```

### Exporting collection to JSON file

This is main export function, it exports collection to JSON format used by Iconify.

```
tools.ExportJSON(collection, 'filename.json').then(json => {
    console.log('Exported collection. JSON data: ' + JSON.stringify(json));
}).catch(err => {
    console.error(err);
});
```

### Exporting image to PNG

You can also export images to PNG.

Important: this function requires PhantomJS to be installed and accessible from command line!

```
tools.ExportPNG(svg, 'filename.png', {
    // options object here
}).then(() => {
    console.log('Exported filename.png');
}).catch(err => {
    console.error(err);
});
```

Options object has following properties:
* width, height: dimensions of PNG image. Default = same as SVG dimensions.
* color: color for monotone images that use currentColor (see ChangePalette function). Default = '#000'
* background: background color, default = 'transparent'


## Manipulating

Most functions require SVG to be optimized. Therefore before doing anything else, you should optimize icon.

### SVGO optimization

This module optimizes SVG images, removing any unnecessary code and cleaning up stuff. It does not merge shapes to avoid
potential problems with images that rely on specific order of shapes.

```
tools.SVGO(svg).then(svg => {
    // svg variable is the same as in argument. Optimizer does not create new instance of SVG class
    console.log('Optimized SVG');
}).catch(err => {
    console.error(err);
});
```

Want to optimize entire collection? Use collection's promiseAll function:

```
collection.promiseAll(svg => tools.SVGO(svg)).then(results => {
    console.log('Optimized entire collection');
}).catch(err => {
    console.error(err);
});
```

### Cropping images

This module crops SVG icons imported from fonts.

Important! This function requires PhantomJS to be installed. See http://phantomjs.org/

How to crop one image:

```
tools.Crop(svg).then(svg => {
    console.log('Cropped SVG: ' + svg.toString());
}).catch(err => {
    console.error(err);
});
```

How to crop entire collection:

```
tools.Crop(collection).then(collection => {
    console.log('Cropped ' + svg.length() + ' images');
}).catch(err => {
    console.error(err);
});
```

How does crop work? By drawing SVG on canvas and checking all 4 sides for transparent pixels. First it appends space on
all sides of SVG, until all sides have nothing but empty pixels. Then it slowly cuts all sides until it reaches pixels
that aren't empty. Process doesn't take long because script checks pixels in bulk by zooming in.

When it crops SVG or Collection instance (like in examples above), each SVG instance receives additional properties
that you might want to use later: _cropData. _cropData is an object with list of cropped edges: left, top, right, bottom.

Node.js is not a browser, it does not support canvas and cannot render SVG images. Because of that calculations are
done in PhantomJS and script requires PhantomJS to be installed.

### Tags validation

This module checks elements used in SVG image, changes stylesheet into inline style and removes useless attributes.

Stylesheet parser is very simple, it parses only basic stylesheets that are generated by some image editors. If SVG
contains fishy elements that aren't vector images, such as bitmaps or scripts, it will reject with error message.

Important! Before running this function you need to optimize SVG image using tools.SVGO()

Usage:

```
tools.Tags(svg).then(svg => {
    console.log('Cleaned up tags in SVG: ' + svg.toString());
}).catch(err => {
    console.error(err);
});
```

This function is used for optimizing SVG images that contain a lot of junk code.

### Extracting palette from SVG

If you don't know if SVG is colored or monotone or maybe doesn't have any colors at all, this tool will find all colors
used in SVG and return you array of used colors.

Result is object with 2 properties:

* colors - array of color strings
* notices - array of error messages

Usage:

```
tools.GetPalette(svg).then(result => {
    console.log('Colors used in SVG: ' + result.colors.join(', ');
    if (result.notices.length) {
        result.notices.forEach(notice => console.warn(notice));
    }
}).catch(err => {
    console.error(err);
});
```

Using it with collection:

```
collection.promiseAll(svg => tools.GetPalette(svg)).then(result => {
    Object.keys(results).forEach(key => {
        console.log('Colors found in image ' + key + ': ' + result[key].colors.join(', ');
    });
}).catch(err => {
    console.error(err);
});
```

### Replacing palette in SVG

This tool can be used to change colors in SVG or add colors to shapes that are missing color values.

```
tools.ChangePalette(svg, {
    '#ff8000': '#0080ff',
    '#123': '#234'
}).then(svg => {
    // Variable "svg" in result is the same as in first parameter of ChangePalette.
    // Function changes existing SVG instance 
    console.log('Changed palette');
}).catch(err => {
    console.error(err);
});
```

Code above will change #ff8000 to #0080ff and #123 to #234. 

But there are more options:

```
tools.ChangePalette(svg, 'red').then(svg => {
    console.log('Added palette to elements without palette');
}).catch(err => {
    console.error(err);
});
```

Code above will add color "red" to all elements that do not have color. It is identical to this:

```
tools.ChangePalette(svg, {
    add: 'red'
}).then(svg => {
    console.log('Added palette to elements without palette');
}).catch(err => {
    console.error(err);
});
```

You can also change all colors by using keyword "default":

```
tools.ChangePalette(svg, {
    default: 'green'
}).then(svg => {
    console.log('Changed all colors to green');
}).catch(err => {
    console.error(err);
});
```

Or you can combine all those attributes:

```
tools.ChangePalette(svg, {
    default: 'green',
    add: '#000',
    '#123': '#234
}).then(svg => {
    console.log('Changed all colors to green, except for #123 that was changed to #234, added black color to elements without color');
}).catch(err => {
    console.error(err);
});
```

Primary use of this tool in Iconify is to replace all colors in monotone with "currentColor" keyword and add it to shapes that are missing color values:

```
collection.promiseAll(svg => tools.ChangePalette(svg, {
    default: 'primaryColor',
    add: 'primaryColor'
})).then(() => {
    console.log('Changed color to primaryColor');
}).catch(err => {
    console.error(err);
});
```

## Indexing shapes and getting shape lengths

If you are doing stroke animations, you might need to index shapes (add unique class names for them to apply different
animations to different shapes) and get length of those shapes.

tools.IndexShapes adds custom attribute to all shapes:

```
tools.IndexShapes(svg, {
    // Attribute to set
    shapeAttribute: 'data-shape-index',
    // Attribute value. {index} is replaced with index, incrementing with each shape
    shapeAttributeValue: '{index}',
}).then(shapesCount => {
    console.log('Added data-shape-index attribute to ' + shapesCount + ' shapes.');
}).catch(err => {
    console.error(err);
});
```

You can also get those shapes by setting option returnNodes to true. Instead of number of shapes Promise will return
array of nodes. Each node is cheerio node object. See cheerio documentation for details. 

tools.ShapeLengths counts lengths of all shapes. It also returns all nodes, so you can change shapes (add/remove 
attributes or class name):

```
tools.ShapeLength(svg).then(results => {
    console.log('Found ' + results.length + ' shapes:');
    results.forEach(result => {
        console.log('Shape ' + result.$node.get(0).tagName + ' has length of ' + result.length);
    });
}).catch(err => {
    console.error(err);
});
```

## Sample

In directory "sample" you will find a sample script that parses the directory of SVG images. It optimizes images, exports
them as optimized SVG images and as JSON collection.

## More tools

If you need any other tool to help with custom SVG icon sets development, suggest it by opening an issue on GitHub repository.

## License

Library is released with MIT license.

© 2016 - 2019 Vjacheslav Trushkin
