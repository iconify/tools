"use strict";

(() => {
    const SVG = require('../../src/svg'),
        Optimize = require('../../src/optimize/svgo'),
        GetPalette = require('../../src/colors/get_palette');

    const fs = require('fs'),
        chai = require('chai'),
        expect = chai.expect,
        should = chai.should();

    describe('Testing colors', () => {
        it('extracting colors from u1F3CC-golfer.svg', done => {
            let svg = new SVG(fs.readFileSync('tests/files/u1F3CC-golfer.svg', 'utf8'));

            Optimize(svg).then(() => {
                return GetPalette(svg);
            }).then(results => {
                expect(results.colors).to.be.eql([
                    '#bfbcaf',
                    '#006652',
                    '#ffd3b6',
                    '#68442a',
                    '#c49270',
                    '#00b89c',
                    '#008e76',
                    '#2b3b47',
                    '#fff',
                    '#e5ab83',
                    '#edc0a2'
                ]);
                expect(results.notices).to.be.eql([]);
                done();
            }).catch(err => {
                done(err);
            });
        });

        it('extracting colors from fci-biomass.svg', done => {
            let svg = new SVG(fs.readFileSync('tests/files/fci-biomass.svg', 'utf8'));

            Optimize(svg).then(() => {
                return GetPalette(svg);
            }).then(results => {
                expect(results.colors).to.be.eql([
                    '#9ccc65',
                    '#8bc34a',
                    '#2e7d32',
                    '#388e3c',
                    '#43a047'
                ]);
                expect(results.notices).to.be.eql([]);
                done();
            }).catch(err => {
                done(err);
            });
        });

        it('testing keywords', done => {
            let svg = new SVG(`<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10">
                <g stroke="black">
                    <path d="" stroke="inherit" fill="none" />
                    <path d="" stroke="transparent" fill="red" />
                    <path d="" stroke="hsla(120, 50%, 50%, .5)" fill="currentColor" />
                </g>
            </svg>`);

            GetPalette(svg).then(results => {
                expect(results.colors).to.be.eql([
                    '#000',
                    'rgba(0,0,0,0)',
                    '#f00',
                    'hsla(120,50%,50%,.5)',
                    'currentColor'
                ]);
                expect(results.notices).to.be.eql([]);
                done();
            }).catch(err => {
                done(err);
            });
        });
    });
})();
