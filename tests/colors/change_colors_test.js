'use strict';

(() => {
	const SVG = require('../../src/svg'),
		Optimize = require('../../src/optimize/svgo'),
		ChangePalette = require('../../src/colors/change_palette');

	const fs = require('fs'),
		chai = require('chai'),
		expect = chai.expect,
		should = chai.should();

	describe('Testing changing colors', () => {
		it('changing colors for fci-biomass.svg', done => {
			let svg = new SVG(fs.readFileSync('tests/files/fci-biomass.svg', 'utf8')),
				changes = {
					'#9ccc65': '#123',
					'#8bc34a': '#234',
					'#388e3c': '#963',
					'#43a047': '#0f0',
					// Use callback
					'#2e7d32': (type, color) => {
						let expected = '#2e7d32';
						switch (type) {
							case 'node':
								if (color !== expected) {
									throw new Error(
										'Invalid color in callback. Expected: ' +
											expected +
											', got: ' +
											color
									);
								}
								return '#aabbcc';

							default:
								throw new Error(
									'Invalid type in callback. Expected: node, got: ' + type
								);
						}
					},
				},
				oldContent,
				newContent;

			Optimize(svg)
				.then(() => {
					oldContent = svg.toMinifiedString();
					return ChangePalette(svg, changes);
				})
				.then(() => {
					newContent = svg.toMinifiedString();
					expect(newContent).to.not.be.equal(oldContent);

					for (let key in changes) {
						if (typeof changes[key] === 'string') {
							oldContent = oldContent.replace(
								new RegExp(key, 'ig'),
								changes[key]
							);
						}
					}
					oldContent = oldContent.replace(
						new RegExp('#2e7d32', 'ig'),
						'#aabbcc'
					);

					expect(newContent).to.be.equal(oldContent);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('changing all colors for fci-biomass.svg', done => {
			let svg = new SVG(fs.readFileSync('tests/files/fci-biomass.svg', 'utf8')),
				changes = {
					'#9ccc65': '#000',
					'#8bc34a': '#000',
					'#2e7d32': '#000',
					'#388e3c': '#000',
					'#43a047': '#000',
				},
				keys = Object.keys(changes),
				oldContent,
				newContent;

			Optimize(svg)
				.then(() => {
					oldContent = svg.toMinifiedString();
					return ChangePalette(svg, {
						default: (type, color, node, attr) => {
							if (type !== 'node') {
								throw new Error(
									'Invalid type in callback. Expected: node, got: ' + type
								);
							}

							let index = keys.indexOf(color);
							if (index !== -1) {
								keys = keys.splice(index, 0);
								return '#000';
							}
							if (changes[color] === void 0) {
								throw new Error('Unexpected color: ' + color);
							}

							return '#000';
						},
					});
				})
				.then(() => {
					// Make sure all colors were used in callback
					expect(keys).to.be.eql([]);

					// Compare content
					newContent = svg.toMinifiedString();
					expect(newContent).to.not.be.equal(oldContent);
					for (let key in changes) {
						oldContent = oldContent.replace(
							new RegExp(key, 'ig'),
							changes[key]
						);
					}
					expect(newContent).to.be.equal(oldContent);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('adding colors to maki-bus-15.svg', done => {
			let svg = new SVG(fs.readFileSync('tests/files/maki-bus-15.svg', 'utf8')),
				oldContent,
				newContent;

			Optimize(svg)
				.then(() => {
					oldContent = svg.toMinifiedString();
					return ChangePalette(svg, '#123');
				})
				.then(() => {
					newContent = svg.toMinifiedString();
					expect(newContent).to.not.be.equal(oldContent);
					oldContent = oldContent.replace(
						new RegExp('/>', 'ig'),
						' fill="#123"/>'
					);
					expect(newContent).to.be.equal(oldContent);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('adding colors to ion-fork-repo.svg without optimization', done => {
			let svg = new SVG(
				'<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" width="512" height="512" preserveAspectRatio="xMidYMid meet" viewBox="0 0 512 512"><style>.st0{fill:#010101;}</style><path d="M416 80h-48V32h-64v48h-48v64h48v48h64v-48h48z"/><path d="M304 240c0 38.6-4.5 42.3-14.4 50.3-7.4 6-22.2 7.1-39.4 8.3-9.5.7-20.4 1.5-31.4 3.3-9.4 1.5-18.4 4.7-26.8 8.8V151.4c19.1-11.1 32-31.7 32-55.4 0-35.3-28.7-64-64-64S96 60.7 96 96c0 23.7 12.9 44.3 32 55.4v209.2c-19.1 11.1-32 31.7-32 55.4 0 35.3 28.7 64 64 64s64-28.7 64-64c0-15.7-5.7-30.1-15-41.2 6.7-4.8 13.9-8.7 20.2-9.7 8.1-1.3 16.6-1.9 25.6-2.6 24.4-1.7 52.1-3.7 75.2-22.5 30.9-25.1 37.5-52.1 38-94.9V240h-64zM160 64c17.6 0 32 14.4 32 32s-14.4 32-32 32-32-14.4-32-32 14.4-32 32-32zm0 384c-17.6 0-32-14.4-32-32s14.4-32 32-32 32 14.4 32 32-14.4 32-32 32z"/></svg>'
			);

			ChangePalette(svg, {
				default: 'currentColor',
				add: 'currentColor',
			})
				.then(() => {
					let newContent = svg.toMinifiedString();
					expect(newContent).to.equal(
						'<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" width="512" height="512" preserveAspectRatio="xMidYMid meet" viewBox="0 0 512 512"><style>.st0{fill:currentColor;}</style><path d="M416 80h-48V32h-64v48h-48v64h48v48h64v-48h48z" fill="currentColor"/><path d="M304 240c0 38.6-4.5 42.3-14.4 50.3-7.4 6-22.2 7.1-39.4 8.3-9.5.7-20.4 1.5-31.4 3.3-9.4 1.5-18.4 4.7-26.8 8.8V151.4c19.1-11.1 32-31.7 32-55.4 0-35.3-28.7-64-64-64S96 60.7 96 96c0 23.7 12.9 44.3 32 55.4v209.2c-19.1 11.1-32 31.7-32 55.4 0 35.3 28.7 64 64 64s64-28.7 64-64c0-15.7-5.7-30.1-15-41.2 6.7-4.8 13.9-8.7 20.2-9.7 8.1-1.3 16.6-1.9 25.6-2.6 24.4-1.7 52.1-3.7 75.2-22.5 30.9-25.1 37.5-52.1 38-94.9V240h-64zM160 64c17.6 0 32 14.4 32 32s-14.4 32-32 32-32-14.4-32-32 14.4-32 32-32zm0 384c-17.6 0-32-14.4-32-32s14.4-32 32-32 32 14.4 32 32-14.4 32-32 32z" fill="currentColor"/></svg>'
					);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('testing mask', done => {
			let svg = new SVG(
					'<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="47.5" height="47.5" viewBox="0 0 47.5 47.5"><defs><clipPath id="SVGVa"><path d="M0 38h38V0H0v38z"/></clipPath></defs><g clip-path="url(#SVGVa)" transform="matrix(1.25 0 0 -1.25 0 47.5)"><path d="M12 1.5c-.194 0-.639.037-.825.114C10.615 1.847 10 2.394 10 3v7H3c-.607 0-1.154.615-1.386 1.176-.233.56-.104 1.331.325 1.76L25 36c1 1 3 1 4 0l7-7c1-1 1-3 0-4L13.145 2.146C12.774 1.65 12.39 1.5 12 1.5"/></g></svg>'
				),
				oldContent,
				newContent;

			ChangePalette(svg, '#123')
				.then(() => {
					newContent = svg.toMinifiedString();
					expect(newContent).to.not.be.equal(svg);
					expect(newContent).to.be.equal(
						'<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="47.5" height="47.5" viewBox="0 0 47.5 47.5"><defs><clipPath id="SVGVa"><path d="M0 38h38V0H0v38z"/></clipPath></defs><g clip-path="url(#SVGVa)" transform="matrix(1.25 0 0 -1.25 0 47.5)"><path d="M12 1.5c-.194 0-.639.037-.825.114C10.615 1.847 10 2.394 10 3v7H3c-.607 0-1.154.615-1.386 1.176-.233.56-.104 1.331.325 1.76L25 36c1 1 3 1 4 0l7-7c1-1 1-3 0-4L13.145 2.146C12.774 1.65 12.39 1.5 12 1.5" fill="#123"/></g></svg>'
					);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('testing nested fill', done => {
			let oldContent = `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="47.5" height="47.5" viewBox="0 0 47.5 47.5">
                    <g fill="#000">
                        <path d="M38.75 40h-5v5h5v-5z"/>
                        <path d="M8.75 45h5v-5h-5v5z"/>
                        <path d="M26.25 17.5h5v10h-5v-10zm-5 10h-5v-10h5v10zm17.5-13.75h-2.5v-2.5h-2.5v-2.5H30v-5h-2.5v5H20v-5h-2.5v5h-3.75v2.5h-2.5v2.5h-2.5v8.75h-5V25h5v8.75h5V40H20v-6.25h7.5V40h6.25v-6.25h5V25h5v-2.5h-5v-8.75z"/>
                        <path d="M43.75 22.5h2.5V8.75h-2.5V22.5z"/>
                        <path d="M1.25 22.5h2.5V8.75h-2.5V22.5z"/>
                    </g>
                </svg>`,
				svg = new SVG(oldContent),
				newContent;

			ChangePalette(svg, { default: '#123' })
				.then(() => {
					newContent = svg.toMinifiedString();
					expect(newContent).to.not.be.equal(svg);
					expect(newContent).to.be.equal(
						oldContent.replace('#000', '#123').replace(/\s*\n\s*/g, '')
					);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('testing nested fill', done => {
			let oldContent = `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100" height="100" viewBox="0 0 100 100">
                  <path fill="#231F20" d="M92.038 24.333l-8.62-8.622a1.615 1.615 0 0 0-2.282 0L49.987 46.86l-6.07-6.068a1.614 1.614 0 0 0-2.282 0l-8.622 8.622a1.611 1.611 0 0 0 0 2.282l15.782 15.778c.302.302.712.473 1.141.473.019 0 .037-.01.056-.01.016 0 .033.009.05.009a1.61 1.61 0 0 0 1.141-.473l40.855-40.857c.63-.632.63-1.653 0-2.283z"/>
                  <path d="M72.022 53.625v21.159H27.978V30.74h31.06l9.979-9.978H23.193v.007c-.023 0-.044-.007-.068-.007a5.118 5.118 0 0 0-5.113 5H18v54h.013A5.111 5.111 0 0 0 23 84.749v.013H77v-.013a5.11 5.11 0 0 0 4.987-4.987H82V43.647l-9.978 9.978z"/>
                </svg>`,
				svg = new SVG(oldContent),
				newContent;

			ChangePalette(svg, '#000')
				.then(() => {
					newContent = svg.toMinifiedString();
					expect(newContent).to.not.be.equal(svg);
					expect(newContent).to.be.equal(
						oldContent
							.replace('9.978z"/>', '9.978z" fill="#000"/>')
							.replace(/\s*\n\s*/g, '')
					);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('testing nested fill with object', done => {
			let oldContent = `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100" height="100" viewBox="0 0 100 100">
                  <path fill="#231F20" d="M92.038 24.333l-8.62-8.622a1.615 1.615 0 0 0-2.282 0L49.987 46.86l-6.07-6.068a1.614 1.614 0 0 0-2.282 0l-8.622 8.622a1.611 1.611 0 0 0 0 2.282l15.782 15.778c.302.302.712.473 1.141.473.019 0 .037-.01.056-.01.016 0 .033.009.05.009a1.61 1.61 0 0 0 1.141-.473l40.855-40.857c.63-.632.63-1.653 0-2.283z"/>
                  <path d="M72.022 53.625v21.159H27.978V30.74h31.06l9.979-9.978H23.193v.007c-.023 0-.044-.007-.068-.007a5.118 5.118 0 0 0-5.113 5H18v54h.013A5.111 5.111 0 0 0 23 84.749v.013H77v-.013a5.11 5.11 0 0 0 4.987-4.987H82V43.647l-9.978 9.978z"/>
                </svg>`,
				svg = new SVG(oldContent),
				newContent;

			ChangePalette(svg, {
				default: '#000',
				add: '#000',
			})
				.then(() => {
					newContent = svg.toMinifiedString();
					expect(newContent).to.not.be.equal(svg);
					expect(newContent).to.be.equal(
						oldContent
							.replace('9.978z"/>', '9.978z" fill="#000"/>')
							.replace('231F20', '000')
							.replace(/\s*\n\s*/g, '')
					);
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});

		it('testing nested fill with custom color', done => {
			let oldContent = `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="64" height="64" viewBox="0 0 64 64">
                  <g fill="#ff5a79">
                    <path d="M10.9 3.3S4.8 18.5 2 41.4c-.2 2 4.5.2 6.1-.4C11.8 18.5 17 3 17 3c-1.5-.2-6.1.3-6.1.3"/>
                    <path d="M37.3 4.9c2.2 3.5 1.2 9.1-.1 14.6-2.2 8.9-7.3 18.1-15.5 18.1-7.8 0-8.6-8.5-6.5-17.1 1.3-5.2 3.3-10.6 6.5-14.2 2.4-2.7 5.7-4.3 9-4.3s5.5.6 6.6 2.9M21.4 20.6c-1.8 7.3-.9 10.9 1.9 10.9 3 0 5.9-4.6 7.7-12.2 1.7-7.2.9-10.5-2-10.5-2.7 0-5.7 4-7.6 11.8"/>
                    <path d="M60.7 5c2.2 3.5 1.2 9.1-.1 14.6-2.2 8.9-7.2 18.1-15.5 18.1-7.8 0-8.6-8.5-6.5-17.1 1.3-5.2 3.3-10.6 6.5-14.2C47.5 3.7 50.9 2 54.2 2c3.2 0 5.4.6 6.5 3M44.9 20.6c-1.8 7.3-.9 10.9 1.9 10.9 3 0 5.9-4.6 7.7-12.2 1.7-7.2.9-10.5-2-10.5-2.7 0-5.7 4-7.6 11.8"/>
                    <path d="M47.6 48.6c-5.4 0-33.3 2.2-44.4 3.1-.8-2.9.2-5.4 1.5-6.6 5.5-1 42.3-3.9 45.1-2.3-.4 2-1.3 4.5-2.2 5.8"/>
                    <path d="M42.9 59.8C37.4 59.8 20 61 8.7 62c-.8-3.2.2-6 1.5-7.4 5.7-1.2 32.1-3.1 34.9-1.3-.4 2.3-1.2 5.1-2.2 6.5"/>
                  </g>
                </svg>`,
				svg = new SVG(oldContent),
				newContent;

			ChangePalette(svg, '#000')
				.then(() => {
					newContent = svg.toMinifiedString();
					expect(newContent).to.be.equal(oldContent.replace(/\s*\n\s*/g, ''));
					done();
				})
				.catch(err => {
					done(err ? err : 'exception');
				});
		});
	});
})();
