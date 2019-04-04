"use strict";

var system = require('system'),
    fs = require('fs'),
    webpage = require('webpage'),
    data, done;

if (system.args.length < 2) {
    console.log('Invalid arguments');
    phantom.exit();
}

data = JSON.parse(fs.read(system.args[1]));
if (typeof data !== 'object') {
    console.log('Invalid arguments');
    phantom.exit();
}

// Done
done = function(png) {
    var page;

    // Create page
    page = webpage.create();
    page.viewportSize = {
        width: data.width,
        height: data.height
    };

    page.open(png, function() {
        page.render(data.output);
        console.log(JSON.stringify({
            output: data.output,
            width: data.width,
            height: data.height
        }));
        phantom.exit();
    });
};

// Create canvas
(function() {
    var canvas = document.createElement('canvas'),
        ctx, pending, images, canComplete;

    function loaded(index) {
        var item;

        if (index === true) {
            // failed image
            pending --;
        } else if (index !== false) {
            // loaded image
            pending --;
            item = data.images[index];
            ctx.drawImage(images[index], item.left, item.top, item.width, item.height);
        }

        if (!canComplete || pending > 0) {
            return;
        }

        canComplete = false;
        done(canvas.toDataURL('image/png', 1));
    }

    canvas.setAttribute('width', data.width);
    canvas.setAttribute('height', data.height);
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, data.width, data.height);

    if (data.background !== 'transparent') {
        ctx.fillStyle = data.background;
        ctx.fillRect(0, 0, data.width, data.height);
    }

    images = [];
    pending = 0;
    canComplete = false;

    data.images.forEach(function(item, index) {
        var image = new Image();
        image.onload = function() {
            loaded(index);
        };
        image.onerror = function() {
            loaded(true);
        };

        pending ++
        images.push(image);
        image.setAttribute('src', item.url);
    });

    canComplete = true;
    loaded(false);
})();
