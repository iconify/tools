'use strict';

(() => {
	const SVG = require('../../src/svg'),
		Optimize = require('../../src/optimize/svgo'),
		Tags = require('../../src/optimize/tags');

	const fs = require('fs'),
		chai = require('chai'),
		expect = chai.expect,
		should = chai.should();

	describe('Testing tags optimization', () => {
		it('missing dimensions, empty group', (done) => {
			let content =
					'<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 100 200"><g fill="none"></g><g fill="black"><g stroke="none" /></g><path d="M6 64l34-36v22s24-1" /></svg>',
				svg = new SVG(content);

			Tags(svg)
				.then(() => {
					expect(svg.toMinifiedString()).to.be.equal(
						'<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 100 200" width="100" height="200"><path d="M6 64l34-36v22s24-1"/></svg>'
					);
					done();
				})
				.catch((err) => {
					done(err ? err : 'exception');
				});
		});

		it('missing viewbox, empty style', (done) => {
			let content =
					'<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100" height="200"><style></style><path d="M6 64l34-36v22s24-1" /></svg>',
				svg = new SVG(content);

			Tags(svg)
				.then(() => {
					expect(svg.toMinifiedString()).to.be.equal(
						'<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100" height="200" viewBox="0 0 100 200"><path d="M6 64l34-36v22s24-1"/></svg>'
					);
					done();
				})
				.catch((err) => {
					done(err ? err : 'exception');
				});
		});

		it('expanding inline style', (done) => {
			let content =
					'<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100" height="200" viewBox="0 0 100 200"><path d="M6 64l34-36v22s24-1" style="fill: #f00;" /></svg>',
				svg = new SVG(content);

			Tags(svg)
				.then(() => {
					expect(svg.toMinifiedString()).to.be.equal(
						'<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100" height="200" viewBox="0 0 100 200"><path d="M6 64l34-36v22s24-1" fill="#f00"/></svg>'
					);
					done();
				})
				.catch((err) => {
					done(err ? err : 'exception');
				});
		});

		it('expanding global style', (done) => {
			let content =
					'<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100" height="200" viewBox="0 0 100 200"><style>.test { fill: #0f0; }</style><path d="M6 64l34-36v22s24-1" class="test" /></svg>',
				svg = new SVG(content);

			Tags(svg)
				.then(() => {
					expect(svg.toMinifiedString()).to.be.equal(
						'<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100" height="200" viewBox="0 0 100 200"><path d="M6 64l34-36v22s24-1" fill="#0f0"/></svg>'
					);
					done();
				})
				.catch((err) => {
					done(err ? err : 'exception');
				});
		});

		it('multiple global styles and unused selectors', (done) => {
			let content =
					'<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100" height="200" viewBox="0 0 100 200"><style>.test { fill: red; } .test2 { stroke: red; }</style><style>.test { stroke: purple !important; }</style><path d="M6 64l34-36v22s24-1" class="test" stroke="white" /></svg>',
				svg = new SVG(content);

			Tags(svg)
				.then(() => {
					expect(svg.toMinifiedString()).to.be.equal(
						'<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100" height="200" viewBox="0 0 100 200"><style>.test2{stroke: red;}</style><path d="M6 64l34-36v22s24-1" stroke="purple" fill="red"/></svg>'
					);
					done();
				})
				.catch((err) => {
					done(err ? err : 'exception');
				});
		});

		it('multiple selectors', (done) => {
			let content =
					'<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100" height="200" viewBox="0 0 100 200"><style>.test, .test2 { fill: red; }</style><path d="M6 64l34-36v22s24-1" class="test" stroke="white" /></svg>',
				svg = new SVG(content);

			Tags(svg)
				.then(() => {
					expect(svg.toMinifiedString()).to.be.equal(
						'<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100" height="200" viewBox="0 0 100 200"><style>.test,.test2{fill:red;}</style><path d="M6 64l34-36v22s24-1" stroke="white" fill="red"/></svg>'
					);
					done();
				})
				.catch((err) => {
					done(err ? err : 'exception');
				});
		});

		it('complex selector', (done) => {
			let content =
					'<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100" height="200" viewBox="0 0 100 200"><style>.test { fill: red; } path.test { fill: black; }</style><path d="M6 64l34-36v22s24-1" class="test" stroke="white" /></svg>',
				svg = new SVG(content);

			Tags(svg)
				.then(() => {
					expect(svg.toMinifiedString()).to.be.equal(
						'<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="100" height="200" viewBox="0 0 100 200"><style>.test{fill:red;}path.test{fill:black;}</style><path d="M6 64l34-36v22s24-1" class="test" stroke="white"/></svg>'
					);
					done();
				})
				.catch((err) => {
					done(err ? err : 'exception');
				});
		});

		it('optimizing bpmn-trash.svg', (done) => {
			let svg = new SVG(fs.readFileSync('tests/files/bpmn-trash.svg', 'utf8'));

			Optimize(svg)
				.then(() => {
					return Tags(svg);
				})
				.then(() => {
					expect(svg.toMinifiedString()).to.be.equal(
						'<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048" viewBox="0 0 2048 2048" preserveAspectRatio="xMidYMid meet"><path d="M387.16 644.33l128.932 1231.742h1024.733l118.83-1231.51h-1272.5zm144.374 130.007h985.481l-94.107 971.506h-789.33z"/><g fill="none" stroke="#000" stroke-width="1.344" stroke-linecap="round"><path d="M7.033 1040.98l.944 7.503" transform="matrix(96.7529 0 0 87.18526 55.328 -89814.987)"/><path d="M12.99 1040.98l-.943 7.503" transform="matrix(96.7529 0 0 87.18526 55.328 -89814.987)"/></g><path d="M758.125 337.314L343.5 458.662v60.722h1361v-60.722l-419.687-121.348z"/><path d="M793.259 211.429h461.482v168.06H793.26z" stroke="#000" stroke-width="69.95233947" stroke-linecap="round" stroke-linejoin="round"/></svg>'
					);
					done();
				})
				.catch((err) => {
					done(err ? err : 'exception');
				});
		});

		it('optimizing bpmn-default-flow.svg', (done) => {
			let svg = new SVG(
				fs.readFileSync('tests/files/bpmn-default-flow.svg', 'utf8')
			);

			Optimize(svg)
				.then(() => {
					return Tags(svg);
				})
				.then(() => {
					expect(svg.toMinifiedString()).to.be.equal(
						'<svg xmlns="http://www.w3.org/2000/svg" height="2048" width="2048" viewBox="0 0 2048 2048" preserveAspectRatio="xMidYMid meet"><path d="M1866.407 206.692s-585.454 298.724-882.844 438.406c63.707 58.178 122.963 120.927 184.437 181.407c-302.353 306.387-604.71 612.769-907.062 919.156c22.172 21.16 44.327 42.309 66.5 63.469c302.352-306.388 604.71-612.738 907.062-919.125c61.588 61.37 122.828 123.086 184.438 184.437c158.845-312.83 447.469-867.75 447.469-867.75z"/><path d="M-18.2 1050.713h5.931" fill="none" stroke-width=".909" transform="matrix(125.07186 0 0 96.75291 2539.419 -100217.58)" stroke="#000"/></svg>'
					);
					done();
				})
				.catch((err) => {
					done(err ? err : 'exception');
				});
		});

		it('optimizing openmoji-whale.svg', (done) => {
			let svg = new SVG(
				fs.readFileSync('tests/files/openmoji-whale.svg', 'utf8')
			);

			Optimize(svg)
				.then(() => {
					return Tags(svg);
				})
				.then(() => {
					expect(svg.toMinifiedString()).to.be.equal(
						'<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72" preserveAspectRatio="xMidYMid meet"><g><path fill="none" d="M36.07 49.73a6.625 6.625 0 0 1-.103-1.167a6.625 6.625 0 0 1 6.625-6.625a6.625 6.625 0 0 1 5.417 2.812"/><path fill="none" d="M35.671 49.716a6.718 6.718 0 0 1-.404-2.296a6.718 6.718 0 0 1 6.717-6.717a6.718 6.718 0 0 1 6.056 3.81"/><path fill-rule="evenodd" d="M19.455 13.84a3.966 3.966 0 0 0-1.81.252c-1.172.452-2.235 1.38-3.23 2.69a1 1 0 1 0 1.59 1.208c.85-1.116 1.688-1.773 2.36-2.033c.673-.26 1.147-.212 1.705.158c1.117.74 2.432 3.328 2.852 8a1 1 0 1 0 1.992-.177c-.444-4.945-1.64-8.101-3.738-9.49a3.767 3.767 0 0 0-1.72-.608z"/><path fill-rule="evenodd" d="M31.482 12.607a4.3 4.3 0 0 0-1.738.229c-2.288.799-3.91 3.46-4.098 7.807a1 1 0 1 0 1.999.086c.168-3.897 1.52-5.572 2.76-6.004c1.238-.433 2.798.19 3.904 1.986a1 1 0 1 0 1.703-1.049c-1.096-1.78-2.788-2.929-4.53-3.055z"/><path fill-rule="evenodd" d="M23.621 9.898a1 1 0 0 0-.937 1.309c.234.76.478 1.328.523 2.291a1 1 0 1 0 1.998-.092c-.06-1.28-.417-2.158-.611-2.789a1 1 0 0 0-.973-.719z"/><path fill-rule="evenodd" d="M47.197 39.408a1 1 0 0 0-.453.102c-1.868.878-3.897 1.232-5.96 1.166a1 1 0 1 0-.063 2c2.335.074 4.688-.33 6.875-1.358a1 1 0 0 0-.399-1.91z"/><path fill-rule="evenodd" d="M35.88 39.813a1 1 0 0 0-.985 1.107c.55 5.925 3.774 10.35 8.386 13.94c.924.718 2.182.746 3.012.158c.82-.582 1.232-1.608 1.152-2.711c.085-2.4-.605-5.13-1.738-7.38c-.573-1.137-1.258-2.148-2.066-2.92c-.809-.77-1.785-1.331-2.891-1.333a1 1 0 1 0-.004 2c.415 0 .938.23 1.514.78c.576.549 1.163 1.388 1.66 2.374c.993 1.972 1.621 4.536 1.537 6.479a1 1 0 0 0 .002.127c.043.518-.164.839-.324.953c-.16.113-.252.185-.625-.106c-4.349-3.383-7.13-7.235-7.623-12.547a1 1 0 0 0-1.006-.922z"/><path fill-rule="evenodd" d="M18.742 29.598c-1.31-.162-2.647.13-3.693.857c-1.046.728-1.775 2.066-1.465 3.525a1 1 0 1 0 1.957-.416c-.146-.689.085-1.075.648-1.466c.564-.392 1.484-.618 2.309-.516c1.191.147 3.21 1.326 5.28 2.854c2.068 1.527 4.24 3.35 6.202 4.656a22.218 22.218 0 0 0 5.56 2.672a1 1 0 1 0 .605-1.907a20.253 20.253 0 0 1-5.055-2.43c-1.811-1.204-3.986-3.019-6.125-4.599c-2.14-1.58-4.191-2.98-6.223-3.23z"/><path d="M47.088 13.537a1.3 1.3 0 0 0-.71.002a1 1 0 0 0-.565.436c-.056.063-.178.107-.22.168c-.147.216-.239.428-.32.652c-.161.447-.267.947-.351 1.467c-.169 1.04-.237 2.116-.207 2.802c.045 1.042.554 1.876 1.117 2.465c.564.59 1.183 1.003 1.637 1.37c.454.366.681.656.726.82c.044.158.033.433-.424 1.072c-2.457 2.752-5.113 3.86-7.992 4.154c-2.894.296-6.015-.279-9.136-1.02c-3.122-.74-6.23-1.643-9.176-1.888c-2.947-.245-5.828.218-8.11 2.307a1 1 0 0 0-.318.629c-.533 4.895 2.093 10.254 6.252 14.472s9.927 7.332 16.002 7.453a1 1 0 1 0 .039-2c-5.41-.108-10.765-2.95-14.617-6.857c-3.716-3.769-5.902-8.477-5.664-12.406c1.723-1.406 3.752-1.814 6.25-1.606c2.65.22 5.697 1.09 8.879 1.844c3.181.755 6.511 1.4 9.804 1.063c3.293-.337 6.545-1.716 9.325-4.852a1 1 0 0 0 .058-.07c.708-.964.996-1.956.756-2.826c-.24-.871-.853-1.406-1.398-1.846c-.546-.44-1.085-.815-1.448-1.194c-.362-.379-.543-.692-.564-1.171c-.018-.421.039-1.504.183-2.397c.025-.15.06-.234.088-.371c.98 1.078 2.315 1.477 3.438 1.693c1.255.242 2.207.455 2.652.971c.395.458.51 1.051.598 1.666a1 1 0 0 0 1.623.633c.423-.345.829-.767 1.246-1.09c.415-.321.794-.478.97-.478c.792.034 1.961.328 3.325.23c.782-.056 1.619-.354 2.447-.832c-.046.948-.137 1.795-.408 2.432c-.46 1.079-1.326 1.922-3.756 2.605c-.901.246-1.651.431-2.336.773c-.687.344-1.307.937-1.611 1.729a1 1 0 0 0-.059.242c-.504 4.29-2.122 11.218-7.154 16.446a1 1 0 1 0 1.441 1.386c5.414-5.624 7.106-12.838 7.663-17.38c.13-.325.239-.445.615-.633c.39-.196 1.062-.388 1.974-.637a1 1 0 0 0 .008-.002c2.764-.777 4.348-2.084 5.055-3.746c.707-1.662.603-3.445.627-5.33a1 1 0 0 0-1.772-.649c-1.028 1.246-1.91 1.532-2.877 1.602c-.966.07-2.012-.194-3.136-.237a1 1 0 0 0-.034-.002c-.93-.003-1.639.463-2.205.9c-.063.05-.083.078-.144.128c-.151-.356-.288-.718-.586-1.063c-1.06-1.228-2.583-1.395-3.79-1.627c-1.195-.23-2.049-.467-2.528-1.15c-.237-.554-.443-1.036-1.182-1.252z"/><path fill-rule="evenodd" d="M22.281 43.816a1 1 0 0 0-.927 1.239c.656 2.825 1.962 5.498 3.666 8.076c.645.977 1.828 1.407 2.802 1.115c.96-.287 1.68-1.124 1.96-2.191c.368-.98.584-2.053.679-3.157a1 1 0 1 0-1.994-.171c-.085.989-.274 1.92-.569 2.683a1 1 0 0 0-.039.121c-.124.505-.422.743-.611.8c-.189.056-.298.093-.559-.302c-1.612-2.44-2.802-4.903-3.388-7.427a1 1 0 0 0-1.02-.786z"/></g></svg>'
					);
					done();
				})
				.catch((err) => {
					done(err ? err : 'exception');
				});
		});

		it('already optimized', (done) => {
			const code = `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="128" height="128" viewBox="0 0 128 128"><g fill="none" fill-rule="evenodd"><path d="M6 64l34-36v22s24-1 49 13 33 37 33 37-21-11-42-17-40-5-40-5v22L6 64z" stroke-width="12" class="stroke cap-round join-round"/></g></svg>`;
			let svg = new SVG(code);

			Tags(svg)
				.then(() => {
					let content = svg.toMinifiedString();
					expect(content).to.be.equal(code);
					done();
				})
				.catch((err) => {
					done(err ? err : 'exception');
				});
		});

		it('animations', (done) => {
			const code = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" xml:space="preserve">
<g>
<path d="M7 3H17V7.2L12 12L7 7.2V3Z">
<animate id="first" attributeName="opacity" from="1" to="0" dur="2s" begin="0;second.end" fill="freeze"/>
</path>
<path d="M17 21H7V16.8L12 12L17 16.8V21Z">
<animate attributeName="opacity" from="0" to="1" dur="2s" begin="0;second.end" fill="freeze"/>
</path>
<path d="M6 2V8H6.01L6 8.01L10 12L6 16L6.01 16.01H6V22H18V16.01H17.99L18 16L14 12L18 8.01L17.99 8H18V2H6ZM16 16.5V20H8V16.5L12 12.5L16 16.5ZM12 11.5L8 7.5V4H16V7.5L12 11.5Z">
</path>
<animateTransform id="second" attributeName="transform" attributeType="XML" type="rotate" from="0 12 12" to="180 12 12" dur="0.5s" begin="first.end"/>
</g>
</svg>`;
			let svg = new SVG(code);

			Tags(svg)
				.then(() => {
					let content = svg.toMinifiedString();
					expect(content).to.be.equal(
						'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" width="24" height="24"><g><path d="M7 3H17V7.2L12 12L7 7.2V3Z"><animate id="first" attributeName="opacity" from="1" to="0" dur="2s" begin="0;second.end" fill="freeze"/></path><path d="M17 21H7V16.8L12 12L17 16.8V21Z"><animate attributeName="opacity" from="0" to="1" dur="2s" begin="0;second.end" fill="freeze"/></path><path d="M6 2V8H6.01L6 8.01L10 12L6 16L6.01 16.01H6V22H18V16.01H17.99L18 16L14 12L18 8.01L17.99 8H18V2H6ZM16 16.5V20H8V16.5L12 12.5L16 16.5ZM12 11.5L8 7.5V4H16V7.5L12 11.5Z"></path><animateTransform id="second" attributeName="transform" attributeType="XML" type="rotate" from="0 12 12" to="180 12 12" dur="0.5s" begin="first.end"/></g></svg>'
					);
					done();
				})
				.catch((err) => {
					done(err ? err : 'exception');
				});
		});

		it('color animations', (done) => {
			const code = `<svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
			<circle cx="60" cy="60" r="50">
			  <animateColor attributeName="fill" attributeType="XML"
				  from="black" to="red" dur="6s" repeatCount="indefinite"/>
			</circle>
		  </svg>
		  `;

			let svg = new SVG(code);

			Tags(svg)
				.then(() => {
					let content = svg.toMinifiedString();
					expect(content).to.be.equal(
						'<svg width="120" height="120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50"><animateColor attributeName="fill" attributeType="XML" from="black" to="red" dur="6s" repeatCount="indefinite"/></circle></svg>'
					);
					done();
				})
				.catch((err) => {
					done(err ? err : 'exception');
				});
		});

		it('set animations with style', (done) => {
			const code = `<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
			<style>
			  .round { rx: 5px; fill: green; }
			</style>
		  
			<rect id="me" width="10" height="10">
			  <set attributeName="class" to="round" begin="me.click" dur="2s" />
			</rect>
		  </svg>`;

			let svg = new SVG(code);

			// This test fails with strict tags validation because 'rx' is not valid style
			Tags(svg, { 'strict-tags-validation': false })
				.then(() => {
					let content = svg.toMinifiedString();
					expect(content).to.be.equal(
						'<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="10" height="10"><style>.round{rx:5px;fill:green;}</style><rect id="me" width="10" height="10"><set attributeName="class" to="round" begin="me.click" dur="2s"/></rect></svg>'
					);
					done();
				})
				.catch((err) => {
					done(err ? err : 'exception');
				});
		});

		it('root attributes', (done) => {
			const code =
				'<svg id="i-search" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="14" cy="14" r="12" /><path d="M23 23 L30 30"  /></svg>';
			let svg = new SVG(code);

			Tags(svg)
				.then(() => {
					let content = svg.toMinifiedString();
					expect(content).to.be.equal(
						'<svg viewBox="0 0 32 32" width="32" height="32" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"><g fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="14" cy="14" r="12"/><path d="M23 23 L30 30"/></g></svg>'
					);
					done();
				})
				.catch((err) => {
					done(err ? err : 'exception');
				});
		});

		it('bad svg', (done) => {
			let content =
					'<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 2048 2048"><foo bar="baz" /></svg>',
				svg = new SVG(content);

			Tags(svg)
				.then(() => {
					done('Expected exception');
				})
				.catch((err) => {
					done();
				});
		});

		it('svg with script', (done) => {
			let content =
					'<svg viewBox="0 0 32 32" width="32" height="32"><script>foo();</script><circle cx="14" cy="14" r="12" /><path d="M23 23 L30 30" /></svg>',
				svg = new SVG(content);

			Tags(svg)
				.then(() => {
					done('Expected exception');
				})
				.catch((err) => {
					done();
				});
		});

		it('svg with event', (done) => {
			let content =
					'<svg viewBox="0 0 32 32" width="32" height="32"><circle cx="14" cy="14" r="12" onclick="foo()" /><path d="M23 23 L30 30" /></svg>',
				svg = new SVG(content);

			Tags(svg)
				.then(() => {
					done('Expected exception');
				})
				.catch((err) => {
					done();
				});
		});
	});
})();
