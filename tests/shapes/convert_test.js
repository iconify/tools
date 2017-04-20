"use strict";

(() => {
    const Convert = require('../../src/shapes/convert');

    const fs = require('fs'),
        exec = require('child_process').exec,
        tmp = require('tmp'),
        chai = require('chai'),
        expect = chai.expect,
        should = chai.should();

    /**
     * Merge attributes to string
     *
     * @param {object} attr
     * @return {string}
     */
    function mergeAttributes(attr) {
        let result = '';
        Object.keys(attr).forEach(key => {
            result += key + '="' + attr[key] + '" ';
        });
        return result;
    }

    /**
     * Compare SVG images
     *
     * @param {object} data
     * @return {Promise}
     * @constructor
     */
    function Compare(data) {
        return new Promise((fulfill, reject) => {
            tmp.setGracefulCleanup();
            let sourceFile = tmp.tmpNameSync({postfix: '.json'}),
                targetFile = tmp.tmpNameSync({postfix: '.json'});

            fs.writeFileSync(sourceFile, JSON.stringify(data), 'utf8');
            // fs.writeFileSync('_src.' + Date.now() + '.json', JSON.stringify(data, null, '\t'), 'utf8');

            // Execute
            let params = [__dirname + '/compare_svg_script.js', sourceFile, targetFile];
            // console.log('Exec params:', params);

            exec('phantomjs ' + params.map(param => '"' + param + '"').join(' '), {
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

                fulfill(data);
            });
        });
    }

    /**
     * Start tests
     */
    describe('Testing converting SVG shapes to path', () => {
        let extraAttributes = {
            fill: 'rgba(255, 0, 0, .5)',
            'stroke-width': 2,
            stroke: 'rgba(0, 0, 255, .5)',
            'stroke-linecap': 'round',
        };

        /**
         * List of tests
         * All tests are done in bulk because PhantomJS takes a while to load
         *
         * @type {object}
         */
        let tests = {
            rect1: {
                shape: 'rect',
                width: 100,
                height: 100,
                attributes: {
                    x: 10,
                    y: 15,
                    width: 40,
                    height: 50,
                    rx: 0,
                    ry: 0
                }
            },
            rect2: {
                shape: 'rect',
                width: 100,
                height: 100,
                attributes: {
                    x: 10,
                    y: 15,
                    width: 40,
                    height: 50,
                    rx: 10,
                    ry: 15,
                }
            },
            ellipse1: {
                shape: 'ellipse',
                width: 100,
                height: 100,
                attributes: {
                    cx: 50,
                    cy: 40,
                    rx: 30,
                    ry: 20
                }
            },
            circle1: {
                shape: 'circle',
                width: 100,
                height: 100,
                attributes: {
                    cx: 50,
                    cy: 40,
                    r: 30
                }
            },
            polygon1: {
                shape: 'polygon',
                width: 100,
                height: 100,
                attributes: {
                    points: '25.693,17.699 8.763,26.584 0.598,56.484 9.003,76.657   11.764,75.815 11.404,74.615 4.68,56.724 13.686,49.999 14.886,47.598 14.886,51.44 20.53,47.358 23.412,49.579 30.211,82.301   37.537,82.301 41.423,58.404 68.438,62.968 74.084,63.089 81.289,82.301 91.974,82.301 87.892,61.647 94.977,40.513 97.761,57.646   97.321,60.208 98.274,65.746 99.402,59.967 98.24,57.566 96.297,39.313 81.169,23.342 33.4,23.305 32.36,24.025 30.497,22.262'
                }
            },
            polyline1: {
                shape: 'polyline',
                width: 140,
                height: 180,
                attributes: {
                    points: '0,40 40,40 40,80 80,80 80,120 120,120 120,160'
                }
            },
        };

        let testResults;

        before(function(done) {
            let data = {};

            Object.keys(tests).forEach(key => {
                let test = tests[key],
                    body = [
                        '<' + test.shape + ' ' + mergeAttributes(test.attributes) + mergeAttributes(extraAttributes) + '/>',
                        '<path d="' + Convert[test.shape](test.attributes) + '" ' + mergeAttributes(extraAttributes) + '/>'
                    ];

                data[key] = {
                    width: test.width,
                    height: test.height,
                    body: body,
                    debug: true
                };
            });

            this.timeout(15000);

            // Compare items
            Compare(data).then(results => {
                expect(typeof results).to.be.equal('object');
                testResults = results;
                done();
            }).catch(err => {
                done(err);
            });
        });

        it('rectangle', () => {
            let key = 'rect1',
                results = testResults[key];

            expect(results.match).to.be.equal(true, 'Rectangle and path are not the same. See _' + key + '.html');
        });

        it('rectangle with rounded corners', () => {
            let key = 'rect1',
                results = testResults[key];

            expect(results.match).to.be.equal(true, 'Rectangle and path are not the same. See _' + key + '.html');
        });

        it('circle', () => {
            let key = 'circle1',
                results = testResults[key];

            expect(results.match).to.be.equal(true, 'Circle and path are not the same. See _' + key + '.html');
        });

        it('ellipse', () => {
            let key = 'ellipse1',
                results = testResults[key];

            expect(results.match).to.be.equal(true, 'Ellipse and path are not the same. See _' + key + '.html');
        });

        it('polygon', () => {
            let key = 'polygon1',
                results = testResults[key];

            expect(results.match).to.be.equal(true, 'Polygon and path are not the same. See _' + key + '.html');
        });

        it('polyline', () => {
            let key = 'polyline1',
                results = testResults[key];

            expect(results.match).to.be.equal(true, 'Polyline and path are not the same. See _' + key + '.html');
        });
    });
})();
