"use strict";

(() => {
    const SVG = require('../../src/svg'),
        Optimize = require('../../src/optimize/svgo'),
        Tags = require('../../src/optimize/tags');

    const fs = require('fs'),
        chai = require('chai'),
        expect = chai.expect,
        should = chai.should();

    describe('Testing tags optimization', () => {
        it('missing dimensions, empty group', done => {
            let content = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 100 200"><g fill="none"></g><g fill="black"><g stroke="none" /></g><path d="M6 64l34-36v22s24-1" /></svg>',
                svg = new SVG(content);

            Tags(svg).then(() => {
                expect(svg.toMinifiedString()).to.be.equal('<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 100 200" width="100" height="200"><path d="M6 64l34-36v22s24-1"/></svg>');
                done();
            }).catch(err => {
                done(err ? err : 'exception');
            });
        });

        it('missing viewbox, empty style', done => {
            let content = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100" height="200"><style></style><path d="M6 64l34-36v22s24-1" /></svg>',
                svg = new SVG(content);

            Tags(svg).then(() => {
                expect(svg.toMinifiedString()).to.be.equal('<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100" height="200" viewBox="0 0 100 200"><path d="M6 64l34-36v22s24-1"/></svg>');
                done();
            }).catch(err => {
                done(err ? err : 'exception');
            });
        });

        it('expanding inline style', done => {
            let content = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100" height="200" viewBox="0 0 100 200"><path d="M6 64l34-36v22s24-1" style="fill: #f00;" /></svg>',
                svg = new SVG(content);

            Tags(svg).then(() => {
                expect(svg.toMinifiedString()).to.be.equal('<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100" height="200" viewBox="0 0 100 200"><path d="M6 64l34-36v22s24-1" fill="#f00"/></svg>');
                done();
            }).catch(err => {
                done(err ? err : 'exception');
            });
        });

        it('expanding global style', done => {
            let content = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100" height="200" viewBox="0 0 100 200"><style>.test { fill: #0f0; }</style><path d="M6 64l34-36v22s24-1" class="test" /></svg>',
                svg = new SVG(content);

            Tags(svg).then(() => {
                expect(svg.toMinifiedString()).to.be.equal('<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100" height="200" viewBox="0 0 100 200"><path d="M6 64l34-36v22s24-1" fill="#0f0"/></svg>');
                done();
            }).catch(err => {
                done(err ? err : 'exception');
            });
        });

        it('multiple global styles and unused selectors', done => {
            let content = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100" height="200" viewBox="0 0 100 200"><style>.test { fill: red; } .test2 { stroke: red; }</style><style>.test { stroke: purple !important; }</style><path d="M6 64l34-36v22s24-1" class="test" stroke="white" /></svg>',
                svg = new SVG(content);

            Tags(svg).then(() => {
                expect(svg.toMinifiedString()).to.be.equal('<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100" height="200" viewBox="0 0 100 200"><style>.test2{stroke: red;}</style><path d="M6 64l34-36v22s24-1" stroke="purple" fill="red"/></svg>');
                done();
            }).catch(err => {
                done(err ? err : 'exception');
            });
        });

        it('multiple selectors', done => {
            let content = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100" height="200" viewBox="0 0 100 200"><style>.test, .test2 { fill: red; }</style><path d="M6 64l34-36v22s24-1" class="test" stroke="white" /></svg>',
                svg = new SVG(content);

            Tags(svg).then(() => {
                expect(svg.toMinifiedString()).to.be.equal('<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100" height="200" viewBox="0 0 100 200"><style>.test,.test2{fill:red;}</style><path d="M6 64l34-36v22s24-1" stroke="white" fill="red"/></svg>');
                done();
            }).catch(err => {
                done(err ? err : 'exception');
            });
        });

        it('complex selector', done => {
            let content = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100" height="200" viewBox="0 0 100 200"><style>.test { fill: red; } path.test { fill: black; }</style><path d="M6 64l34-36v22s24-1" class="test" stroke="white" /></svg>',
                svg = new SVG(content);

            Tags(svg).then(() => {
                expect(svg.toMinifiedString()).to.be.equal('<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100" height="200" viewBox="0 0 100 200"><style>.test{fill:red;}path.test{fill:black;}</style><path d="M6 64l34-36v22s24-1" class="test" stroke="white"/></svg>');
                done();
            }).catch(err => {
                done(err ? err : 'exception');
            });
        });

        it('optimizing bpmn-trash.svg', done => {
            let svg = new SVG(fs.readFileSync('tests/files/bpmn-trash.svg', 'utf8'));

            Optimize(svg).then(() => {
                return Tags(svg);
            }).then(() => {
                expect(svg.toMinifiedString()).to.be.equal('<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048" viewBox="0 0 2048 2048" preserveAspectRatio="xMidYMid meet"><path d="M387.16 644.33l128.932 1231.742h1024.733l118.83-1231.51h-1272.5zm144.374 130.007h985.481l-94.107 971.506h-789.33z"/><g fill="none" stroke="#000" stroke-width="1.344" stroke-linecap="round"><path d="M7.033 1040.98l.944 7.503" transform="matrix(96.7529 0 0 87.18526 55.328 -89814.987)"/><path d="M12.99 1040.98l-.943 7.503" transform="matrix(96.7529 0 0 87.18526 55.328 -89814.987)"/></g><path d="M758.125 337.314L343.5 458.662v60.722h1361v-60.722l-419.687-121.348z"/><path d="M793.259 211.429h461.482v168.06H793.26z" stroke="#000" stroke-width="69.95233947" stroke-linecap="round" stroke-linejoin="round"/></svg>');
                done();
            }).catch(err => {
                done(err ? err : 'exception');
            });
        });

        it('optimizing bpmn-default-flow.svg', done => {
            let svg = new SVG(fs.readFileSync('tests/files/bpmn-default-flow.svg', 'utf8'));

            Optimize(svg).then(() => {
                return Tags(svg);
            }).then(() => {
                expect(svg.toMinifiedString()).to.be.equal('<svg xmlns="http://www.w3.org/2000/svg" height="2048" width="2048" viewBox="0 0 2048 2048" preserveAspectRatio="xMidYMid meet"><path d="M1866.407 206.692s-585.454 298.724-882.844 438.406c63.707 58.178 122.963 120.927 184.437 181.407c-302.353 306.387-604.71 612.769-907.062 919.156c22.172 21.16 44.327 42.309 66.5 63.469c302.352-306.388 604.71-612.738 907.062-919.125c61.588 61.37 122.828 123.086 184.438 184.437c158.845-312.83 447.469-867.75 447.469-867.75z"/><path d="M-18.2 1050.713h5.931" fill="none" stroke-width=".909" transform="matrix(125.07186 0 0 96.75291 2539.419 -100217.58)" stroke="#000"/></svg>');
                done();
            }).catch(err => {
                done(err ? err : 'exception');
            });
        });

        it('already optimized', done => {
            const code = `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="128" height="128" viewBox="0 0 128 128"><g fill="none" fill-rule="evenodd"><path d="M6 64l34-36v22s24-1 49 13 33 37 33 37-21-11-42-17-40-5-40-5v22L6 64z" stroke-width="12" class="stroke cap-round join-round"/></g></svg>`;
            let svg = new SVG(code);

            Tags(svg).then(() => {
                let content = svg.toMinifiedString();
                expect(content).to.be.equal(code);
                done();
            }).catch(err => {
                done(err ? err : 'exception');
            });
        });

        it('root attributes', done => {
            const code = '<svg id="i-search" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="14" cy="14" r="12" /><path d="M23 23 L30 30"  /></svg>';
            let svg = new SVG(code);

            Tags(svg).then(() => {
                let content = svg.toMinifiedString();
                expect(content).to.be.equal('<svg viewBox="0 0 32 32" width="32" height="32" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"><g fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="14" cy="14" r="12"/><path d="M23 23 L30 30"/></g></svg>');
                done();
            }).catch(err => {
                done(err ? err : 'exception');
            });
        });

        it('bad svg', done => {
            let content = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 2048 2048"><foo bar="baz" /></svg>',
                svg = new SVG(content);

            Tags(svg).then(() => {
                done('Expected exception');
            }).catch(err => {
                done();
            });
        });

        it('svg with script', done => {
            let content = '<svg viewBox="0 0 32 32" width="32" height="32"><script>foo();</script><circle cx="14" cy="14" r="12" /><path d="M23 23 L30 30" /></svg>',
                svg = new SVG(content);

            Tags(svg).then(() => {
                done('Expected exception');
            }).catch(err => {
                done();
            });
        });

        it('svg with event', done => {
            let content = '<svg viewBox="0 0 32 32" width="32" height="32"><circle cx="14" cy="14" r="12" onclick="foo()" /><path d="M23 23 L30 30" /></svg>',
                svg = new SVG(content);

            Tags(svg).then(() => {
                done('Expected exception');
            }).catch(err => {
                done();
            });
        });

    });
})();
