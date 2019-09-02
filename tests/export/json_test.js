"use strict";

(() => {
    const SVG = require('../../src/svg'),
        Collection = require('../../src/collection'),
        Exporter = require('../../src/export/json');

    const fs = require('fs'),
        chai = require('chai'),
        expect = chai.expect,
        should = chai.should();

    describe('Testing exporting to JSON file', () => {
        const icon1Body = '<circle cx="32" cy="32" r="30" fill="#4fd1d9"/><path d="m28.6 17.5h6.9l10.3 29h-6.6l-1.9-6h-10.7l-2 6h-6.3l10.3-29m-.4 18h7.4l-3.6-11.4-3.8 11.4" fill="#fff"/>,',
            icon2Body = '<path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/>',
            content1 = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" enable-background="new 0 0 64 64">' + icon1Body + '</svg>',
            content2 = '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8">' + icon2Body + '</svg>';

        const dir = 'tests/temp';

        try {
            fs.mkdirSync(dir, 0o775);
        } catch (err) {
        }

        /**
         * Delete temporary files
         */
        function cleanup(file) {
            try {
                fs.unlinkSync(dir + '/' + file);
            } catch(err) {
            }
        }

        /**
         * Check if file or directory exists
         *
         * @param file
         * @returns {boolean}
         */
        function exists(file) {
            try {
                fs.statSync(file);
                return true;
            } catch (e) {
                return false;
            }
        }

        it('exporting simple json file', done => {
            let file = 'test-simple.json',
                items = new Collection();

            items.add('icon1', new SVG(content1));
            items.add('second-icon', new SVG(content2));

            Exporter(items, dir + '/' + file).then(json => {
                expect(json).to.be.eql({
                    icons: {
                        icon1: {
                            body: icon1Body,
                            width: 64,
                            height: 64
                        },
                        'second-icon': {
                            body: icon2Body,
                            width: 8,
                            height: 8
                        }
                    }
                });

                cleanup(file);
                done();
            }).catch(err => {
                cleanup(file);
                done(err ? err : 'exception');
            });
        });

        it('exporting optimized json file that cannot be optimized', done => {
            let file = 'test-noop.json',
                items = new Collection();

            items.add('icon1', new SVG(content1));
            items.add('icon2', new SVG(content2.replace('0 0 8 8', '0 0 24 12')));
            items.add('second-icon', new SVG(content2));

            Exporter(items, dir + '/' + file, {
                optimize: true
            }).then(json => {
                expect(json).to.be.eql({
                    icons: {
                        icon1: {
                            body: icon1Body,
                            width: 64,
                            height: 64
                        },
                        icon2: {
                            body: icon2Body,
                            width: 24,
                            height: 12
                        },
                        'second-icon': {
                            body: icon2Body,
                            width: 8,
                            height: 8
                        }
                    }
                });

                cleanup(file);
                done();
            }).catch(err => {
                cleanup(file);
                done(err ? err : 'exception');
            });
        });

        it('exporting json file with optimized width', done => {
            let file = 'test-width.json',
                items = new Collection();

            items.add('icon1', new SVG(content1));
            items.add('icon2', new SVG(content2.replace('0 0 8 8', '0 0 64 12')));
            items.add('second-icon', new SVG(content2));

            Exporter(items, dir + '/' + file, {
                optimize: true
            }).then(json => {
                expect(json).to.be.eql({
                    icons: {
                        icon1: {
                            body: icon1Body,
                            height: 64
                        },
                        icon2: {
                            body: icon2Body,
                            height: 12
                        },
                        'second-icon': {
                            body: icon2Body,
                            width: 8,
                            height: 8
                        }
                    },
                    width: 64
                });

                cleanup(file);
                done();
            }).catch(err => {
                cleanup(file);
                done(err ? err : 'exception');
            });
        });

        it('exporting json file with optimized width and height', done => {
            let file = 'test-optimized.json',
                items = new Collection();

            items.add('icon1', new SVG(content1));
            items.add('icon2', new SVG(content2.replace('0 0 8 8', '0 0 64 64')));
            items.add('second-icon', new SVG(content2));

            Exporter(items, dir + '/' + file, {
                optimize: true
            }).then(json => {
                expect(json).to.be.eql({
                    icons: {
                        icon1: {
                            body: icon1Body
                        },
                        icon2: {
                            body: icon2Body
                        },
                        'second-icon': {
                            body: icon2Body,
                            width: 8,
                            height: 8
                        }
                    },
                    width: 64,
                    height: 64
                });

                cleanup(file);
                done();
            }).catch(err => {
                cleanup(file);
                done(err ? err : 'exception');
            });
        });

        it('exporting prefixed collection', done => {
            let file = 'test-prefixed.json',
                items = new Collection('foo-bar');

            items.add('icon1', new SVG(content1));
            items.add('second-icon', new SVG(content2));

            Exporter(items, dir + '/' + file).then(json => {
                expect(json).to.be.eql({
                    prefix: 'foo-bar',
                    icons: {
                        icon1: {
                            body: icon1Body,
                            width: 64,
                            height: 64
                        },
                        'second-icon': {
                            body: icon2Body,
                            width: 8,
                            height: 8
                        }
                    }
                });

                expect(items.prefix).to.be.equal('foo-bar');

                cleanup(file);
                done();
            }).catch(err => {
                cleanup(file);
                done(err ? err : 'exception');
            });
        });

        it('exporting prefixed collection with prefix detection', done => {
            let file = 'test-auto-prefix.json',
                items = new Collection();

            items.add('foo-icon1', new SVG(content1));
            items.add('foo:second-icon', new SVG(content2));

            Exporter(items, dir + '/' + file).then(json => {
                expect(json).to.be.eql({
                    prefix: 'foo',
                    icons: {
                        icon1: {
                            body: icon1Body,
                            width: 64,
                            height: 64
                        },
                        'second-icon': {
                            body: icon2Body,
                            width: 8,
                            height: 8
                        }
                    }
                });

                expect(items.prefix).to.be.equal('foo');

                cleanup(file);
                done();
            }).catch(err => {
                cleanup(file);
                done(err ? err : 'exception');
            });
        });

        it('exporting with custom properties', done => {
            let file = 'test-props.json',
                items = new Collection();

            let svg1 = new SVG(content1);
            svg1.aliases = ['icon1-alias', {
                name: 'icon1-rtl',
                hFlip: true
            }];
            items.add('icon1', svg1);

            let svg2 = new SVG(content2);
            svg2.rotate = 2;
            svg2.vFlip = true;
            items.add('second-icon', svg2);

            Exporter(items, dir + '/' + file).then(json => {
                expect(json).to.be.eql({
                    icons: {
                        icon1: {
                            body: icon1Body,
                            width: 64,
                            height: 64
                        },
                        'second-icon': {
                            body: icon2Body,
                            width: 8,
                            height: 8,
                            rotate: 2,
                            vFlip: true
                        }
                    },
                    aliases: {
                        'icon1-alias': {
                            parent: 'icon1'
                        },
                        'icon1-rtl': {
                            parent: 'icon1',
                            hFlip: true
                        }
                    }
                });

                cleanup(file);
                done();
            }).catch(err => {
                cleanup(file);
                done(err ? err : 'exception');
            });
        });

        it('exporting with categories', done => {
            let file = 'test-categories.json',
                items = new Collection(),
                expectedIcon1 = {
                    body: icon1Body,
                    width: 64,
                    height: 64
                },
                expected = {
                    icons: {
                        icon1: expectedIcon1,
                        'second-icon': {
                            body: icon2Body,
                            width: 8,
                            height: 8
                        },
                        'third-icon': expectedIcon1,
                        empty: expectedIcon1,
                        'fifth-icon': expectedIcon1,
                    },
                    categories: {
                        'First Category': [
                            'fifth-icon',
                            'icon1'
                        ],
                        'Second Category': [
                            'second-icon',
                            'third-icon'
                        ],
                        'Third Category': [
                            'fifth-icon'
                        ]
                    }
                };

            let svg1 = new SVG(content1);
            svg1.category = 'First Category';
            items.add('icon1', svg1);

            let svg2 = new SVG(content2);
            svg2.category = 'Second Category';
            items.add('second-icon', svg2);

            let svg3 = new SVG(content1);
            svg3.category = 'Second Category';
            items.add('third-icon', svg3);

            let svg4 = new SVG(content1);
            items.add('empty', svg4);

            let svg5 = new SVG(content1);
            svg5.category = ['First Category', 'Third Category'];
            items.add('fifth-icon', svg5);

            // First export should include categories
            Exporter(items, dir + '/' + file, {
                includeCategories: true
            }).then(json => {
                expect(json).to.be.eql(expected);

                // Second export should not include categories
                Exporter(items, dir + '/' + file).then(json => {
                    delete expected.categories;
                    expect(json).to.be.eql(expected);

                    cleanup(file);
                    done();
                }).catch(err => {
                    cleanup(file);
                    done(err ? err : 'exception');
                });
            }).catch(err => {
                cleanup(file);
                done(err ? err : 'exception');
            });
        });

        it('exporting with theme', done => {
            let file = 'test-theme.json',
                items = new Collection(),
                expectedIcon1 = {
                    body: icon1Body,
                    width: 64,
                    height: 64
                },
                expected = {
                    icons: {
                        'icon-fill': expectedIcon1,
                        'icon-outline': {
                            body: icon2Body,
                            width: 8,
                            height: 8
                        },
                        empty: expectedIcon1,
                    },
                    themes: {
                        fill: {
                            title: 'Fill',
                            suffix: '-fill'
                        },
                        outline: {
                            title: 'Outline',
                            suffix: '-outline'
                        }
                    }
                };

            let svg1 = new SVG(content1);
            items.add('icon-fill', svg1);

            let svg2 = new SVG(content2);
            items.add('icon-outline', svg2);

            let svg3 = new SVG(content1);
            items.add('empty', svg3);

            // Export should include themes
            Exporter(items, dir + '/' + file, {
                themes: {
                    fill: {
                        title: 'Fill',
                        suffix: '-fill'
                    },
                    outline: {
                        title: 'Outline',
                        suffix: '-outline'
                    }
                }
            }).then(json => {
                expect(json).to.be.eql(expected);

                // Export again, use collection for themes
                items.themes = {
                    fill: {
                        title: 'Fill',
                        suffix: '-fill'
                    },
                    outline: {
                        title: 'Outline',
                        suffix: '-outline'
                    }
                };

                Exporter(items, dir + '/' + file, {}).then(json => {

                    expect(json).to.be.eql(expected);
                    cleanup(file);
                    done();

                }).catch(err => {
                    cleanup(file);
                    done(err ? err : 'exception');
                });

            }).catch(err => {
                cleanup(file);
                done(err ? err : 'exception');
            });
        });

        it('exporting with info block', done => {
            let file = 'test-info.json',
                items = new Collection(),
                expectedIcon1 = {
                    body: icon1Body,
                    width: 64,
                    height: 64
                },
                expected = {
                    icons: {
                        'icon-fill': expectedIcon1,
                        'icon-outline': {
                            body: icon2Body,
                            width: 8,
                            height: 8
                        }
                    },
                    aliases: {
                        'icon2-fill': {
                            parent: 'icon-fill'
                        },
                        'icon2-rotated-outline': {
                            parent: 'icon-outline',
                            rotate: 1
                        },
                        'hidden-alias': {
                            parent: 'icon-fill',
                            hFlip: true,
                            hidden: true
                        }
                    },
                    info: {
                        title: 'Test',
                        total: 3,
                        author: {
                            name: 'Foo'
                        },
                        license: {
                            title: 'GPL'
                        }
                    }
                };

            let svg1 = new SVG(content1);
            svg1.aliases = ['icon2-fill', {
                name: 'hidden-alias',
                hFlip: true,
                hidden: true
            }];
            items.add('icon-fill', svg1);

            let svg2 = new SVG(content2);
            svg2.aliases = [{
                name: 'icon2-rotated-outline',
                rotate: 1
            }];
            items.add('icon-outline', svg2);

            // Export should include info
            Exporter(items, dir + '/' + file, {
                info: {
                    title: 'Test',
                    total: 3,
                    author: {
                        name: 'Foo'
                    },
                    license: {
                        title: 'GPL'
                    }
                }
            }).then(json => {
                expect(json).to.be.eql(expected);

                // Export again, use collection for info
                items.info = {
                    title: 'Test',
                    total: 10, // Wrong number!
                    author: {
                        name: 'Foo'
                    },
                    license: {
                        title: 'GPL'
                    }
                };

                Exporter(items, dir + '/' + file, {}).then(json => {
                    expect(json).to.be.eql(expected);

                    // Invalid tests, result should not include info
                    delete expected.info;

                    // Set author name to string (testing legacy code)
                    items.info.author = 'Foo';

                    Exporter(items, dir + '/' + file, {}).then(json => {
                        expect(json).to.be.eql(expected);
                        cleanup(file);
                        done();
                    }).catch(err => {
                        cleanup(file);
                        done(err ? err : 'exception');
                    });

                }).catch(err => {
                    cleanup(file);
                    done(err ? err : 'exception');
                });

            }).catch(err => {
                cleanup(file);
                done(err ? err : 'exception');
            });
        });

    });
})();
