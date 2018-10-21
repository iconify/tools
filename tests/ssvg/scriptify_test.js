"use strict";

(() => {
    const Scriptify = require('../../src/json/scriptify');

    const fs = require('fs'),
        chai = require('chai'),
        expect = chai.expect,
        should = chai.should();

    const callback = 'SimpleSVG.addCollection';

    describe('Testing converting icons to SSVG JSONP', () => {
        const icon1Content = '<circle cx="32" cy="32" r="30" fill="#4fd1d9"/><path d="m28.6 17.5h6.9l10.3 29h-6.6l-1.9-6h-10.7l-2 6h-6.3l10.3-29m-.4 18h7.4l-3.6-11.4-3.8 11.4" fill="#fff"/>',
            icon1 = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" enable-background="new 0 0 64 64">' + icon1Content + '</svg>';

        const icon2Content = '<path d="M1408 992v480q0 26-19 45t-45 19H960v-384H704v384H320q-26 0-45-19t-19-45V992q0-1 .5-3t.5-3l575-474 575 474q1 2 1 6zm223-69l-62 74q-8 9-21 11h-3q-13 0-21-7L832 424l-692 577q-12 8-24 7-13-2-21-11l-62-74q-8-10-7-23.5T37 878l719-599q32-26 76-26t76 26l244 204V288q0-14 9-23t23-9h192q14 0 23 9t9 23v408l219 182q10 8 11 21.5t-7 23.5z" fill="currentColor"/>',
            icon2 = '<svg width="1664" height="1792" viewBox="0 0 1664 1792" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' + icon2Content + '</svg>';

        it('one icon without prefix', done => {
            Scriptify({
                'test': icon1
            }).then(result => {
                expect(result).to.be.equal(callback + '({"prefix":"","icons":{"test":{"body":"<circle cx=\\"32\\" cy=\\"32\\" r=\\"30\\" fill=\\"#4fd1d9\\"/><path d=\\"m28.6 17.5h6.9l10.3 29h-6.6l-1.9-6h-10.7l-2 6h-6.3l10.3-29m-.4 18h7.4l-3.6-11.4-3.8 11.4\\" fill=\\"#fff\\"/>","width":64,"height":64}}});');
                done();
            }).catch(err => {
                done(err ? err : 'Error');
            });
        });

        it('2 icons with same prefix', done => {
            Scriptify({
                'test-icon1': icon1,
                'test-another-icon': icon2
            }).then(result => {
                expect(result).to.be.equal(callback + '({"prefix":"test","icons":{"icon1":{"body":"<circle cx=\\"32\\" cy=\\"32\\" r=\\"30\\" fill=\\"#4fd1d9\\"/><path d=\\"m28.6 17.5h6.9l10.3 29h-6.6l-1.9-6h-10.7l-2 6h-6.3l10.3-29m-.4 18h7.4l-3.6-11.4-3.8 11.4\\" fill=\\"#fff\\"/>","width":64,"height":64},"another-icon":{"body":"<path d=\\"M1408 992v480q0 26-19 45t-45 19H960v-384H704v384H320q-26 0-45-19t-19-45V992q0-1 .5-3t.5-3l575-474 575 474q1 2 1 6zm223-69l-62 74q-8 9-21 11h-3q-13 0-21-7L832 424l-692 577q-12 8-24 7-13-2-21-11l-62-74q-8-10-7-23.5T37 878l719-599q32-26 76-26t76 26l244 204V288q0-14 9-23t23-9h192q14 0 23 9t9 23v408l219 182q10 8 11 21.5t-7 23.5z\\" fill=\\"currentColor\\"/>","width":1664,"height":1792}}});');
                done();
            }).catch(err => {
                done(err ? err : 'Error');
            });
        });

        it('2 icons with different prefixes', done => {
            Scriptify({
                'test-icon1': icon1,
                'test2-prefix:another-icon': icon2
            }).then(result => {
                expect(result).to.be.equal(callback + '({"prefix":"test","icons":{"icon1":{"body":"<circle cx=\\"32\\" cy=\\"32\\" r=\\"30\\" fill=\\"#4fd1d9\\"/><path d=\\"m28.6 17.5h6.9l10.3 29h-6.6l-1.9-6h-10.7l-2 6h-6.3l10.3-29m-.4 18h7.4l-3.6-11.4-3.8 11.4\\" fill=\\"#fff\\"/>","width":64,"height":64}}});' + '\n' + callback + '({"prefix":"test2-prefix","icons":{"another-icon":{"body":"<path d=\\"M1408 992v480q0 26-19 45t-45 19H960v-384H704v384H320q-26 0-45-19t-19-45V992q0-1 .5-3t.5-3l575-474 575 474q1 2 1 6zm223-69l-62 74q-8 9-21 11h-3q-13 0-21-7L832 424l-692 577q-12 8-24 7-13-2-21-11l-62-74q-8-10-7-23.5T37 878l719-599q32-26 76-26t76 26l244 204V288q0-14 9-23t23-9h192q14 0 23 9t9 23v408l219 182q10 8 11 21.5t-7 23.5z\\" fill=\\"currentColor\\"/>","width":1664,"height":1792}}});');
                done();
            }).catch(err => {
                done(err ? err : 'Error');
            });
        });
    });
})();
