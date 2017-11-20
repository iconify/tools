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
        let $root = this.$svg(':root');

        // Add missing viewBox attribute
        if ($root.attr('viewBox') === void 0) {
            $root.attr('viewBox', '0 0 ' + this.width + ' ' + this.height);
        }

        // Add missing width/height
        if ($root.attr('width') === void 0) {
            $root.attr('width', this.width);
        }
        if ($root.attr('height') === void 0) {
            $root.attr('height', this.height);
        }

        return this.$svg.html();
    }

    /**
     * Get SVG as string without whitespaces
     *
     * @return {string}
     */
    toMinifiedString() {
        return this.toString().replace(/\s*\n\s*/g, '');
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

        // Get dimensions and origin
        let viewBox = $root.attr('viewBox');
        if (viewBox !== void 0) {
            let list = viewBox.split(' ');

            this.left = parseFloat(list[0]);
            this.top = parseFloat(list[1]);
            this.width = parseFloat(list[2]);
            this.height = parseFloat(list[3]);
        } else {
            this.left = this.top = 0;
            this.width = parseFloat($root.attr('width'));
            this.height = parseFloat($root.attr('height'));
        }

        ['width', 'height', 'left', 'top'].forEach(attr => {
            if (isNaN(this[attr])) {
                this[attr] = 0;
            }
        });
    }
}

module.exports = SVG;
