"use strict";

(() => {
    const Collection = require('../../src/collection'),
        Importer = require('../../src/import/json');

    const fs = require('fs'),
        chai = require('chai'),
        expect = chai.expect,
        should = chai.should();

    describe('Testing importing json file', () => {
        it('importing simple json data', done => {
            Importer(__dirname + '/../files/websymbol.json').then(collection => {
                expect(collection.keys().indexOf('websymbol-user') === -1).to.be.equal(false);
                done();
            }).catch(err => {
                done(err ? err : 'exception');
            });
        });
    });
})();
