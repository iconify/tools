"use strict";

(() => {
    const Optimize = require('../../src/ssvg/optimize'),
        DeOptimize = require('../../src/ssvg/deoptimize');

    const fs = require('fs'),
        chai = require('chai'),
        expect = chai.expect,
        should = chai.should();

    describe('Testing optimization', () => {
        let original = {
            icons: {
                test: {
                    body: 'body',
                    width: 100,
                    height: 200
                },
                test2: {
                    body: 'body',
                    width: 150,
                    height: 200,
                    hFlip: true
                }
            },
            aliases: {
                test3: {
                    parent: 'test',
                    width: 150
                }
            }
        };

        let optimized = {
            icons: {
                test: {
                    body: 'body',
                    width: 100
                },
                test2: {
                    body: 'body',
                    width: 150,
                    hFlip: true
                }
            },
            aliases: {
                test3: {
                    parent: 'test',
                    width: 150
                }
            },
            height: 200
        };

        it('optimizing', () => {
            let clone = JSON.parse(JSON.stringify(original));

            Optimize(clone);
            expect(clone).to.be.eql(optimized);
        });

        it('de-optimizing', () => {
            let clone = JSON.parse(JSON.stringify(optimized));

            DeOptimize(clone);
            expect(clone).to.be.eql(original);
        });
    });
})();
