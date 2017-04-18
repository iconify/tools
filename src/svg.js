/**
 * This file is part of the simple-svg-tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

"use strict";

const cheerio = require('cheerio');

class SVG {
    /**
     * Constructor
     *
     * @param {string} content SVG content
     */
    constructor(content) {
        this.load(content);
    }

    /**
     * Get SVG as string
     *
     * @return {string}
     */
    toString() {
        return this.$svg.html();
    }

    /**
     * Get SVG as string without whitespaces
     *
     * @return {string}
     */
    toMinifiedString() {
        return this.$svg.html().replace(/\s*\n\s*/g, '');
    }

    /**
     * Get body
     *
     * @return {string}
     */
    getBody() {
        return this.$svg('svg').html();
    }

    /**
     * Get dimensions
     *
     * @return {object}
     */
    getDimensions() {
        return {
            width: this.width,
            height: this.height
        };
    }

    /**
     * Load SVG
     *
     * @param {string} content
     */
    load(content) {
        // Remove junk
        function remove(str1, str2, append) {
            let start = 0,
                end;

            while ((start = content.indexOf(str1, start)) !== -1) {
                end = content.indexOf(str2, start + str1.length);
                if (end === -1) {
                    return;
                }
                content = content.slice(0, start) + append + content.slice(end + str2.length);
                start = start + append.length;
            }
        }

        // Remove comments
        remove('<!--', '-->', '');

        // Remove doctype and XML declaration
        remove('<?xml', '?>', '');
        remove('<!DOCTYPE svg', '<svg', '<svg');

        // Remove Adobe Illustrator junk
        remove('xmlns:x="&ns_extend;" xmlns:i="&ns_ai;" xmlns:graph="&ns_graphs;"', '', '');
        remove('xml:space="preserve"', '', '');
        remove('<foreignObject', '</foreignObject>', '');

        remove('<i:pgf', '</i:pgf>', '');

        // Entypo stuff
        remove('enable-background="', '"', '');

        // Remove empty <g> elements
        content = content.replace(/<g>\s*<\/g>/g, '');

        // Create _svg element
        this.$svg = cheerio.load(content.trim(), {
            lowerCaseAttributeNames: false,
            xmlMode: true
        });

        // Check root
        let $root = this.$svg(':root');
        if ($root.length > 1 || $root.get(0).tagName !== 'svg') {
            throw new Error('Invalid SVG file');
        }

        // Get width and height
        let width = $root.attr('width'),
            height = $root.attr('height');

        if (width === void 0 || height === void 0) {
            let viewBox = $root.attr('viewBox');
            if (viewBox !== void 0) {
                let list = viewBox.split(' ');

                width = list[2];
                height = list[3];
            }
        }

        width = parseFloat(width);
        height = parseFloat(height);

        this.width = isNaN(width) ? 0 : width;
        this.height = isNaN(height) ? 0 : height;
    }
}

module.exports = SVG;
