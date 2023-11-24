import { SVG } from '../../lib/svg';
import { cleanupSVG } from '../../lib/svg/cleanup';
import { loadFixture } from '../../lib/tests/helpers';

describe('Cleaning up SVG', () => {
	test('Moving fill to content', () => {
		const svg = new SVG(
			'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="20" viewBox="-8 -16 24 40" fill="red"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></svg>'
		);
		cleanupSVG(svg);
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="20" viewBox="-8 -16 24 40"><g fill="red"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></g></svg>'
		);
	});

	test('entypo-hair-cross.svg', async () => {
		const svg = new SVG(await loadFixture('entypo-hair-cross.svg'));
		cleanupSVG(svg);
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20"><path d="M10,0.4c-5.303,0-9.601,4.298-9.601,9.6c0,5.303,4.298,9.601,9.601,9.601c5.301,0,9.6-4.298,9.6-9.601 C19.6,4.698,15.301,0.4,10,0.4z M11,17.525V13H9v4.525C5.604,17.079,2.92,14.396,2.473,11H7V9H2.473C2.92,5.604,5.604,2.921,9,2.475 V7h2V2.475c3.394,0.447,6.078,3.13,6.525,6.525H13v2h4.525C17.078,14.394,14.394,17.078,11,17.525z"/></svg>'
		);
	});

	test('1f3eb.svg', async () => {
		const svg = new SVG(await loadFixture('1f3eb.svg'));
		cleanupSVG(svg);
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 47.5 47.5" width="47.5" height="47.5"><defs><clipPath id="clipPath16" clipPathUnits="userSpaceOnUse"><path id="path18" d="M 0,38 38,38 38,0 0,0 0,38 Z"/></clipPath></defs><g transform="matrix(1.25,0,0,-1.25,0,47.5)" id="g10"><g id="g12"><g clip-path="url(#clipPath16)" id="g14"><g transform="translate(37,3)" id="g20"><path id="path22" d="m 0,0 c 0,-1.104 -0.896,-2 -2,-2 l -32,0 c -1.104,0 -2,0.896 -2,2 l 0,19 c 0,1.104 0.896,2 2,2 l 32,0 c 1.104,0 2,-0.896 2,-2 L 0,0 Z" fill="#ffcc4d" fill-opacity="1" fill-rule="nonzero" stroke="none"/></g><g transform="translate(35,24)" id="g24"><path id="path26" d="m 0,0 -32,0 c -1.104,0 -2,-0.896 -2,-2 L 2,-2 C 2,-0.896 1.104,0 0,0" fill="#6d6e71" fill-opacity="1" fill-rule="nonzero" stroke="none"/></g><path id="path28" d="M 35,9 3,9 3,13 35,13 35,9 Z" fill="#3b88c3" fill-opacity="1" fill-rule="nonzero" stroke="none"/><path id="path30" d="m 35,15 -32,0 0,4 32,0 0,-4 z" fill="#3b88c3" fill-opacity="1" fill-rule="nonzero" stroke="none"/><path id="path32" d="M 35,3 3,3 3,7 35,7 35,3 Z" fill="#3b88c3" fill-opacity="1" fill-rule="nonzero" stroke="none"/><path id="path34" d="m 31,2 -2,0 0,18 2,0 0,-18 z" fill="#ffcc4d" fill-opacity="1" fill-rule="nonzero" stroke="none"/><g transform="translate(23,37)" id="g36"><path id="path38" d="m 0,0 -16,0 c -1.104,0 -2,-0.896 -2,-2 l 0,-34 20,0 0,34 C 2,-0.896 1.104,0 0,0" fill="#ffe8b6" fill-opacity="1" fill-rule="nonzero" stroke="none"/></g><g transform="translate(23,37)" id="g40"><path id="path42" d="m 0,0 -16,0 c -1.104,0 -2,-0.896 -2,-2 L 2,-2 C 2,-0.896 1.104,0 0,0" fill="#808285" fill-opacity="1" fill-rule="nonzero" stroke="none"/></g><path id="path44" d="m 23,15 -16,0 0,4 16,0 0,-4 z" fill="#55acee" fill-opacity="1" fill-rule="nonzero" stroke="none"/><path id="path46" d="M 23,9 7,9 7,13 23,13 23,9 Z" fill="#55acee" fill-opacity="1" fill-rule="nonzero" stroke="none"/><path id="path48" d="M 23,3 7,3 7,7 23,7 23,3 Z" fill="#55acee" fill-opacity="1" fill-rule="nonzero" stroke="none"/><path id="path50" d="m 13,1 -2,0 0,29 2,0 0,-29 z" fill="#ffe8b6" fill-opacity="1" fill-rule="nonzero" stroke="none"/><path id="path52" d="m 19,1 -2,0 0,29 2,0 0,-29 z" fill="#ffe8b6" fill-opacity="1" fill-rule="nonzero" stroke="none"/><path id="path54" d="m 17,1 -4,0 0,6 4,0 0,-6 z" fill="#226699" fill-opacity="1" fill-rule="nonzero" stroke="none"/><g transform="translate(21,28)" id="g56"><path id="path58" d="m 0,0 c 0,-3.313 -2.687,-6 -6,-6 -3.313,0 -6,2.687 -6,6 0,3.313 2.687,6 6,6 3.313,0 6,-2.687 6,-6" fill="#a7a9ac" fill-opacity="1" fill-rule="nonzero" stroke="none"/></g><g transform="translate(19,28)" id="g60"><path id="path62" d="m 0,0 c 0,-2.209 -1.791,-4 -4,-4 -2.209,0 -4,1.791 -4,4 0,2.209 1.791,4 4,4 2.209,0 4,-1.791 4,-4" fill="#e6e7e8" fill-opacity="1" fill-rule="nonzero" stroke="none"/></g><g transform="translate(18,27)" id="g64"><path id="path66" d="m 0,0 -3,0 c -0.552,0 -1,0.448 -1,1 l 0,5 c 0,0.552 0.448,1 1,1 0.552,0 1,-0.448 1,-1 L -2,2 0,2 C 0.552,2 1,1.552 1,1 1,0.448 0.552,0 0,0" fill="#a0041e" fill-opacity="1" fill-rule="nonzero" stroke="none"/></g></g></g></g></svg>'
		);
	});

	test('batch-asterisk.svg', async () => {
		const svg = new SVG(await loadFixture('batch-asterisk.svg'));
		cleanupSVG(svg);
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"> <g fill="#000000"><path d="M 42.588,20.196C 41.058,21.078, 36.348,22.911, 32.034,24.00 c 4.314,1.089, 9.024,2.922, 10.557,3.804C 45.456,29.46, 46.44,33.129, 44.784,36.00c-1.656,2.871-5.325,3.852-8.193,2.196 c-1.533-0.885-5.475-4.053-8.574-7.245C 29.232,35.235, 30.00,40.233, 30.00,42.00c0.00,3.312-2.688,6.00-6.00,6.00s-6.00-2.688-6.00-6.00 c0.00-1.767, 0.768-6.765, 1.986-11.049c-3.099,3.192-7.041,6.36-8.574,7.245C 8.541,39.852, 4.872,38.871, 3.216,36.00S 2.541,29.46, 5.412,27.804 C 6.942,26.922, 11.652,25.089, 15.969,24.00C 11.652,22.911, 6.942,21.078, 5.412,20.196C 2.541,18.54, 1.56,14.871, 3.216,12.00s 5.325-3.852, 8.196-2.196 c 1.533,0.885, 5.475,4.053, 8.574,7.245C 18.768,12.765, 18.00,7.767, 18.00,6.00c0.00-3.312, 2.688-6.00, 6.00-6.00s 6.00,2.688, 6.00,6.00c0.00,1.767-0.768,6.765-1.986,11.049 c 3.099-3.192, 7.044-6.36, 8.574-7.245c 2.868-1.656, 6.54-0.675, 8.193,2.196C 46.44,14.871, 45.456,18.54, 42.588,20.196z"/></g></svg>'
		);
	});

	test('bpmn-default-flow.svg', async () => {
		const svg = new SVG(await loadFixture('bpmn-default-flow.svg'));
		cleanupSVG(svg);
		expect(svg.toMinifiedString().replace('<defs></defs>', '<defs/>')).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" height="2048" width="2048" viewBox="0 0 2048 2048"><defs/><g transform="translate(0,995.63783)" id="layer1"><g id="layer1-6" transform="matrix(96.752895,0,0,96.752895,55.328158,-100816.34)"><path d="m 1866.4062,206.6875 c 0,0 -585.4533,298.7241 -882.8437,438.40625 63.7073,58.17752 122.9637,120.92602 184.4375,181.40625 -302.3528,306.3874 -604.7097,612.7689 -907.0625,919.1562 22.17254,21.1599 44.32746,42.3089 66.5,63.4688 C 629.7903,1502.7376 932.1472,1196.3874 1234.5,890 c 61.5877,61.37036 122.8273,123.0865 184.4375,184.4375 158.8449,-312.83114 447.4687,-867.75 447.4687,-867.75 z" transform="matrix(0.01033561,0,0,0.01033561,-0.57185015,1031.7077)" id="path7791" color="#000000" fill="#000000" fill-opacity="1" fill-rule="nonzero" stroke="none" stroke-width="0.95637447" visibility="visible" display="inline"/><g transform="matrix(0.01033561,0,0,0.01033561,19.338451,1039.3007)" id="layer1-9"><g transform="matrix(125.07184,0,0,96.752895,613.03918,-100952.21)" id="layer1-6-1" stroke="#000000" stroke-width="0.93020457" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"><path id="path4203" d="m -18.199126,1050.7133 5.930228,0" color="#000000" display="inline" visibility="visible" opacity="1" color-interpolation="sRGB" fill="none" fill-opacity="1" fill-rule="evenodd" stroke="#000000" stroke-width="0.90905082" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-dashoffset="0" stroke-opacity="1" color-rendering="auto"/></g></g></g></g></svg>'
		);
	});

	test('Get rid of style, data- attribute, title, enable-background', () => {
		const svg = new SVG(
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" enable-background="new 0 0 24 24" id="irrelevant"><defs><style>.cls-1{fill:#fff;opacity:0;cursor:pointer;}.cls-2{fill:#231f20;}</style></defs><title>arrow-circle-right</title><g id="Layer_2" data-name="Layer 2"><g id="arrow-circle-right"><g id="arrow-circle-right-2" data-name="arrow-circle-right"><rect class="cls-1" width="24" height="24" transform="translate(0 24) rotate(-90)"/><path class="cls-2" d="M2,12A10,10,0,1,0,12,2,10,10,0,0,0,2,12ZM13.86,8.31l2.86,3a.49.49,0,0,1,.1.15.54.54,0,0,1,.1.16.94.94,0,0,1,0,.76,1,1,0,0,1-.21.33l-3,3a1,1,0,0,1-1.42-1.42L13.59,13H8a1,1,0,0,1,0-2h5.66L12.41,9.69a1,1,0,0,1,1.45-1.38Z"/></g></g></g></svg>`
		);
		cleanupSVG(svg);
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><g id="Layer_2"><g id="arrow-circle-right"><g id="arrow-circle-right-2"><rect width="24" height="24" transform="translate(0 24) rotate(-90)" fill="#fff" opacity="0"/><path d="M2,12A10,10,0,1,0,12,2,10,10,0,0,0,2,12ZM13.86,8.31l2.86,3a.49.49,0,0,1,.1.15.54.54,0,0,1,.1.16.94.94,0,0,1,0,.76,1,1,0,0,1-.21.33l-3,3a1,1,0,0,1-1.42-1.42L13.59,13H8a1,1,0,0,1,0-2h5.66L12.41,9.69a1,1,0,0,1,1.45-1.38Z" fill="#231f20"/></g></g></g></svg>'
		);
	});

	test('Keep title', () => {
		const svg = new SVG(
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" enable-background="new 0 0 24 24" id="irrelevant"><defs><style>.cls-1{fill:#fff;opacity:0;cursor:pointer;}.cls-2{fill:#231f20;}</style></defs><title>arrow-circle-right</title><g id="Layer_2" data-name="Layer 2"><g id="arrow-circle-right"><g id="arrow-circle-right-2" data-name="arrow-circle-right"><rect class="cls-1" width="24" height="24" transform="translate(0 24) rotate(-90)"/><path class="cls-2" d="M2,12A10,10,0,1,0,12,2,10,10,0,0,0,2,12ZM13.86,8.31l2.86,3a.49.49,0,0,1,.1.15.54.54,0,0,1,.1.16.94.94,0,0,1,0,.76,1,1,0,0,1-.21.33l-3,3a1,1,0,0,1-1.42-1.42L13.59,13H8a1,1,0,0,1,0-2h5.66L12.41,9.69a1,1,0,0,1,1.45-1.38Z"/></g></g></g></svg>`
		);
		cleanupSVG(svg, {
			keepTitles: true,
		});
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><title>arrow-circle-right</title><g id="Layer_2"><g id="arrow-circle-right"><g id="arrow-circle-right-2"><rect width="24" height="24" transform="translate(0 24) rotate(-90)" fill="#fff" opacity="0"/><path d="M2,12A10,10,0,1,0,12,2,10,10,0,0,0,2,12ZM13.86,8.31l2.86,3a.49.49,0,0,1,.1.15.54.54,0,0,1,.1.16.94.94,0,0,1,0,.76,1,1,0,0,1-.21.33l-3,3a1,1,0,0,1-1.42-1.42L13.59,13H8a1,1,0,0,1,0-2h5.66L12.41,9.69a1,1,0,0,1,1.45-1.38Z" fill="#231f20"/></g></g></g></svg>'
		);
	});

	test('Animation, nothing to clean up', async () => {
		const svg = new SVG(await loadFixture('animation.svg'));
		const expectedSVG = svg.toMinifiedString();
		cleanupSVG(svg);
		expect(svg.toMinifiedString()).toBe(expectedSVG);
	});

	test('Namespaces', async () => {
		const svg = new SVG(await loadFixture('bpmn-trash.svg'));
		cleanupSVG(svg);
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048" viewBox="0 0 2048 2048"><defs></defs><g id="layer1" transform="translate(0,995.63783)"><g transform="matrix(96.752895,0,0,96.752895,55.328158,-100816.34)" id="layer1-6" display="inline"><path d="m 3.4296875,1038.3672 1.3325877,12.7308 10.5912408,0 1.228186,-12.7284 -13.1520736,0 z m 1.4921875,1.3437 10.185547,0 -0.972656,10.0411 -8.1582035,0 z" id="rect4089" color="#000000" display="inline" visibility="visible" opacity="1" color-interpolation="sRGB" fill="#000000" fill-opacity="1" fill-rule="nonzero" stroke="none" stroke-width="1.343629" stroke-linecap="round" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-dashoffset="0" stroke-opacity="1" color-rendering="auto"/><g id="g4275" transform="matrix(1,0,0,0.90111263,0,103.41515)"><path id="path4092" d="m 7.0333918,1040.9794 0.9432241,7.504" fill="none" stroke="#000000" stroke-width="1.343629" stroke-linecap="round" stroke-linejoin="miter" stroke-miterlimit="4" stroke-opacity="1" stroke-dasharray="none"/><path id="path4092-2" d="m 12.990235,1040.9794 -0.943224,7.504" fill="none" stroke="#000000" stroke-width="1.343629" stroke-linecap="round" stroke-linejoin="miter" stroke-miterlimit="4" stroke-opacity="1" stroke-dasharray="none"/></g><path d="m 7.2638322,1035.194 -4.2854023,1.2542 0,0.6276 14.0667651,0 0,-0.6276 -4.337726,-1.2542 z" id="rect4121" fill="#000000" fill-opacity="1" stroke="none"/><path d="m 7.6269598,1033.8929 4.7697062,0 0,1.737 -4.7697062,0 z" id="rect4121-6" display="inline" fill="#000000" fill-opacity="1" stroke="#000000" stroke-width="0.72291225" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-dashoffset="0" stroke-opacity="1"/></g></g></svg>'
		);
	});

	test('Attributes from defs', () => {
		const svgCode = `<svg width="256" height="256" viewBox="0 0 256 256">
		<defs fill="green" opacity="0" style="display: none">
			<symbol id="def1" fill="purple">
				<rect x="0" y="0" width="64" height="64" id="def2" />
			</symbol>
		</defs>
		<use href="#def1" fill="red" />
		<use href="#def2" transform="translate(32 32)" />
		<use href="#def2" fill="teal" transform="translate(64 64)" />
	</svg>`;

		// Intercept console.warn
		const warn = console.warn;
		let warned = false;
		try {
			console.warn = () => {
				warned = true;
			};

			// Check icon
			const svg = new SVG(svgCode);
			cleanupSVG(svg);
			expect(svg.toMinifiedString()).toBe(
				'<svg width="256" height="256" viewBox="0 0 256 256"><defs><symbol id="def1" fill="purple"><rect x="0" y="0" width="64" height="64" id="def2"/></symbol></defs><use href="#def1" fill="red"/><use href="#def2" transform="translate(32 32)"/><use href="#def2" fill="teal" transform="translate(64 64)"/></svg>'
			);

			expect(warned).toBe(true);
		} finally {
			console.warn = warn;
		}
	});

	test('discord.svg', async () => {
		const content = await loadFixture('discord.svg');
		const svg = new SVG(content);
		cleanupSVG(svg);
		expect(svg.toMinifiedString()).toBe(
			content.replace(/\s*\n\s*/g, '').replace(/" \/>/g, '"/>')
		);
	});

	test('font-face.svg', async () => {
		// Intercept console.warn
		const warn = console.warn;
		try {
			let warned = false;
			console.warn = () => {
				warned = true;
			};

			const content = await loadFixture('font-face.svg');
			const svg = new SVG(content);
			cleanupSVG(svg);
			expect(
				svg.toMinifiedString().replace('<defs></defs>', '<defs/>')
			).toBe(
				'<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs/><path d="M393.142857 548.571429A82.285714 82.285714 0 0 1 475.428571 630.857143v201.142857A82.285714 82.285714 0 0 1 393.142857 914.285714h-201.142857A82.285714 82.285714 0 0 1 109.714286 832v-201.142857A82.285714 82.285714 0 0 1 192 548.571429h201.142857z m438.857143 0A82.285714 82.285714 0 0 1 914.285714 630.857143v201.142857A82.285714 82.285714 0 0 1 832 914.285714h-201.142857A82.285714 82.285714 0 0 1 548.571429 832v-201.142857A82.285714 82.285714 0 0 1 630.857143 548.571429h201.142857z m-438.857143 54.857142h-201.142857a27.428571 27.428571 0 0 0-27.428571 27.428572v201.142857c0 15.140571 12.288 27.428571 27.428571 27.428571h201.142857a27.428571 27.428571 0 0 0 27.428572-27.428571v-201.142857a27.428571 27.428571 0 0 0-27.428572-27.428572z m438.857143 0h-201.142857a27.428571 27.428571 0 0 0-27.428572 27.428572v201.142857c0 15.140571 12.288 27.428571 27.428572 27.428571h201.142857a27.428571 27.428571 0 0 0 27.428571-27.428571v-201.142857a27.428571 27.428571 0 0 0-27.428571-27.428572zM393.142857 109.714286A82.285714 82.285714 0 0 1 475.428571 192v201.142857A82.285714 82.285714 0 0 1 393.142857 475.428571h-201.142857A82.285714 82.285714 0 0 1 109.714286 393.142857v-201.142857A82.285714 82.285714 0 0 1 192 109.714286h201.142857z m438.857143 0A82.285714 82.285714 0 0 1 914.285714 192v201.142857A82.285714 82.285714 0 0 1 832 475.428571h-201.142857A82.285714 82.285714 0 0 1 548.571429 393.142857v-201.142857A82.285714 82.285714 0 0 1 630.857143 109.714286h201.142857z m-438.857143 54.857143h-201.142857a27.428571 27.428571 0 0 0-27.428571 27.428571v201.142857c0 15.140571 12.288 27.428571 27.428571 27.428572h201.142857a27.428571 27.428571 0 0 0 27.428572-27.428572v-201.142857a27.428571 27.428571 0 0 0-27.428572-27.428571z m438.857143 0h-201.142857a27.428571 27.428571 0 0 0-27.428572 27.428571v201.142857c0 15.140571 12.288 27.428571 27.428572 27.428572h201.142857a27.428571 27.428571 0 0 0 27.428571-27.428572v-201.142857a27.428571 27.428571 0 0 0-27.428571-27.428571z"/></svg>'
			);

			expect(warned).toBe(true);
		} finally {
			console.warn = warn;
		}
	});

	test('Icon with mask-type', async () => {
		const content = await loadFixture('amphora_color.svg');

		// Intercept console.warn
		const warn = console.warn;
		let warned = false;
		try {
			console.warn = () => {
				warned = true;
			};

			// Check icon
			const svg = new SVG(content);
			cleanupSVG(svg);
			expect(svg.toMinifiedString()).toBe(
				'<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><mask id="mask0_18_33363" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="8" y="4" width="16" height="24"><path d="M13 4C13 4 13.1005 4.75475 13.4547 6.45557C13.809 8.15639 14.0121 9.16114 13 9.78517L12.8942 9.85028C11.4025 10.7675 8.49089 12.5579 8.50002 16.5831C8.50002 18.3838 8.81712 19.1596 10.5215 22.0333C12.226 24.9071 13.5 27.5 13.5 27.5H18.5C18.5 27.5 19.7741 24.9071 21.4785 22.0333C23.1829 19.1596 23.5 18.3838 23.5 16.5831C23.5091 12.5579 20.5975 10.7675 19.1058 9.85028L19 9.78517C17.9879 9.16114 18.191 8.15639 18.5453 6.45557C18.8995 4.75475 19 4 19 4H13Z" fill="#D3883E"/></mask><mask id="mask1_18_33363" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="8" y="4" width="16" height="24"><path d="M13 4C13 4 13.1005 4.75475 13.4547 6.45557C13.809 8.15639 14.0121 9.16114 13 9.78517L12.8942 9.85028C11.4025 10.7675 8.49089 12.5579 8.50002 16.5831C8.50002 18.3838 8.81712 19.1596 10.5215 22.0333C12.226 24.9071 13.5 27.5 13.5 27.5H18.5C18.5 27.5 19.7741 24.9071 21.4785 22.0333C23.1829 19.1596 23.5 18.3838 23.5 16.5831C23.5091 12.5579 20.5975 10.7675 19.1058 9.85028L19 9.78517C17.9879 9.16114 18.191 8.15639 18.5453 6.45557C18.8995 4.75475 19 4 19 4H13Z" fill="black"/></mask><g fill="none"><path d="M10.1808 12.6546L8.84537 11.3819C6.25811 8.8363 8.19857 7.12538 8.19857 7.12538C8.19857 7.12538 10.1808 4.7259 12.9349 7.54267L14.2077 8.8363" stroke="url(#paint0_linear_18_33363)" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/><g filter="url(#filter0_f_18_33363)"><path d="M10.1808 12.6546L8.84537 11.3819C6.25811 8.8363 8.19857 7.12538 8.19857 7.12538C8.19857 7.12538 10.1808 4.7259 12.9349 7.54267L14.2077 8.8363" stroke="url(#paint1_linear_18_33363)" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/></g><path d="M10.1808 12.6546L8.84537 11.3819C6.25811 8.8363 8.19857 7.12538 8.19857 7.12538C8.19857 7.12538 10.1808 4.7259 12.9349 7.54267L14.2077 8.8363" stroke="url(#paint2_linear_18_33363)" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/><path d="M21.8192 12.6546L23.1546 11.3819C25.7419 8.8363 23.8014 7.12538 23.8014 7.12538C23.8014 7.12538 21.8192 4.7259 19.0651 7.54267L17.7923 8.8363" stroke="url(#paint3_linear_18_33363)" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/><g filter="url(#filter1_f_18_33363)"><path d="M21.8192 12.6546L23.1546 11.3819C25.7419 8.8363 23.8014 7.12538 23.8014 7.12538C23.8014 7.12538 21.8192 4.7259 19.0651 7.54267L17.7923 8.8363" stroke="url(#paint4_linear_18_33363)" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/></g><path d="M21.8192 12.6546L23.1546 11.3819C25.7419 8.8363 23.8014 7.12538 23.8014 7.12538C23.8014 7.12538 21.8192 4.7259 19.0651 7.54267L17.7923 8.8363" stroke="url(#paint5_linear_18_33363)" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.4548 6.45549C13.1005 4.75467 13 3.99992 13 3.99992L13.0429 3.92505H18.9029L19 3.99992C19 3.99992 18.8995 4.75467 18.5453 6.45549C18.191 8.15631 17.9879 9.16106 19 9.78508L19.1058 9.8502C20.3299 10.6029 22.5103 11.9437 23.2481 14.6249L23.2265 14.6718L23.3672 15.3437L23.4093 15.3749C23.4472 15.6153 23.4739 15.8651 23.4881 16.1249L23.4531 16.164V16.828L23.4969 16.8749C23.4821 17.5246 23.412 18.0494 23.2265 18.6249L23.1758 18.6562L22.9062 19.3241L22.934 19.3749C22.6277 20.0563 22.1659 20.8741 21.4785 22.0332C19.7741 24.907 18.5 27.4999 18.5 27.4999L18.4271 27.5667H13.5601L13.5 27.4999C13.5 27.4999 12.226 24.907 10.5216 22.0332C9.83409 20.8741 9.37232 20.0563 9.06603 19.3749L9.08984 19.3241L8.81641 18.6601L8.77352 18.6249C8.58805 18.0494 8.51798 17.5246 8.50317 16.8749L8.54297 16.8398V16.1757L8.51189 16.1249C8.5261 15.8651 8.55281 15.6153 8.5907 15.3749L8.62891 15.3476L8.77352 14.6601L8.75197 14.6249C9.48972 11.9437 11.6701 10.6029 12.8942 9.8502L13 9.78508C14.0121 9.16106 13.809 8.15631 13.4548 6.45549Z" fill="url(#paint6_linear_18_33363)"/><path d="M13.4548 6.45549C13.1005 4.75467 13 3.99992 13 3.99992L13.0429 3.92505H18.9029L19 3.99992C19 3.99992 18.8995 4.75467 18.5453 6.45549C18.191 8.15631 17.9879 9.16106 19 9.78508L19.1058 9.8502C20.3299 10.6029 22.5103 11.9437 23.2481 14.6249L23.2265 14.6718L23.3672 15.3437L23.4093 15.3749C23.4472 15.6153 23.4739 15.8651 23.4881 16.1249L23.4531 16.164V16.828L23.4969 16.8749C23.4821 17.5246 23.412 18.0494 23.2265 18.6249L23.1758 18.6562L22.9062 19.3241L22.934 19.3749C22.6277 20.0563 22.1659 20.8741 21.4785 22.0332C19.7741 24.907 18.5 27.4999 18.5 27.4999L18.4271 27.5667H13.5601L13.5 27.4999C13.5 27.4999 12.226 24.907 10.5216 22.0332C9.83409 20.8741 9.37232 20.0563 9.06603 19.3749L9.08984 19.3241L8.81641 18.6601L8.77352 18.6249C8.58805 18.0494 8.51798 17.5246 8.50317 16.8749L8.54297 16.8398V16.1757L8.51189 16.1249C8.5261 15.8651 8.55281 15.6153 8.5907 15.3749L8.62891 15.3476L8.77352 14.6601L8.75197 14.6249C9.48972 11.9437 11.6701 10.6029 12.8942 9.8502L13 9.78508C14.0121 9.16106 13.809 8.15631 13.4548 6.45549Z" fill="url(#paint7_linear_18_33363)"/><path d="M13.4548 6.45549C13.1005 4.75467 13 3.99992 13 3.99992L13.0429 3.92505H18.9029L19 3.99992C19 3.99992 18.8995 4.75467 18.5453 6.45549C18.191 8.15631 17.9879 9.16106 19 9.78508L19.1058 9.8502C20.3299 10.6029 22.5103 11.9437 23.2481 14.6249L23.2265 14.6718L23.3672 15.3437L23.4093 15.3749C23.4472 15.6153 23.4739 15.8651 23.4881 16.1249L23.4531 16.164V16.828L23.4969 16.8749C23.4821 17.5246 23.412 18.0494 23.2265 18.6249L23.1758 18.6562L22.9062 19.3241L22.934 19.3749C22.6277 20.0563 22.1659 20.8741 21.4785 22.0332C19.7741 24.907 18.5 27.4999 18.5 27.4999L18.4271 27.5667H13.5601L13.5 27.4999C13.5 27.4999 12.226 24.907 10.5216 22.0332C9.83409 20.8741 9.37232 20.0563 9.06603 19.3749L9.08984 19.3241L8.81641 18.6601L8.77352 18.6249C8.58805 18.0494 8.51798 17.5246 8.50317 16.8749L8.54297 16.8398V16.1757L8.51189 16.1249C8.5261 15.8651 8.55281 15.6153 8.5907 15.3749L8.62891 15.3476L8.77352 14.6601L8.75197 14.6249C9.48972 11.9437 11.6701 10.6029 12.8942 9.8502L13 9.78508C14.0121 9.16106 13.809 8.15631 13.4548 6.45549Z" fill="url(#paint8_linear_18_33363)"/><g mask="url(#mask0_18_33363)"><g filter="url(#filter2_f_18_33363)"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.906 3.91765C12.9297 3.89054 12.964 3.875 13 3.875H19C19.036 3.875 19.0703 3.89054 19.094 3.91765C19.1178 3.94475 19.1286 3.98078 19.1239 4.01649L19.1235 4.01903L19.1226 4.02602L19.1187 4.05351C19.1152 4.07789 19.1098 4.11442 19.1023 4.16349C19.0872 4.26162 19.0635 4.40989 19.0286 4.61128C18.959 5.01406 18.845 5.62935 18.6676 6.48106C18.4892 7.33776 18.3548 7.99544 18.385 8.51692C18.4 8.7741 18.4549 8.99157 18.561 9.17937C18.6667 9.36665 18.8275 9.53199 19.0656 9.67876L19.1763 9.7469C20.6686 10.6645 23.6343 12.4881 23.625 16.5834V16.5834C23.625 17.4933 23.5446 18.1533 23.2454 18.9498C22.9486 19.74 22.4374 20.6615 21.586 22.0971C20.7351 23.5317 19.9916 24.8964 19.4606 25.9026C19.1952 26.4057 18.983 26.819 18.8372 27.1065C18.7643 27.2502 18.708 27.3625 18.6699 27.4388L18.6268 27.5256L18.6158 27.5478L18.6124 27.5547L18.5 27.5V27.375H18.4224L18.4462 27.3272C18.4845 27.2504 18.5411 27.1377 18.6142 26.9934C18.7606 26.7049 18.9734 26.2904 19.2395 25.786C19.7717 24.7773 20.5174 23.4087 21.371 21.9695C22.224 20.5313 22.7235 19.6282 23.0114 18.8618C23.2968 18.1019 23.375 17.4737 23.375 16.5831C23.384 12.6326 20.5331 10.8747 19.0403 9.95676L18.9344 9.89157C18.6664 9.72633 18.473 9.53206 18.3433 9.3023C18.2138 9.07305 18.152 8.81603 18.1355 8.53141C18.1028 7.96931 18.2471 7.2742 18.4229 6.43008C18.5997 5.58097 18.7132 4.96848 18.7823 4.56868C18.8169 4.36878 18.8404 4.22206 18.8552 4.12552V4.12552L13.1447 4.125V4.125C13.1596 4.22153 13.1831 4.36878 13.2177 4.56868C13.2868 4.96848 13.4003 5.58097 13.5771 6.43008C13.7529 7.2742 13.8972 7.96931 13.8646 8.53141C13.848 8.81603 13.7862 9.07305 13.6567 9.3023C13.527 9.53206 13.3336 9.72633 13.0656 9.89157L12.9597 9.95676C11.467 10.8747 8.61606 12.6323 8.62502 16.5828C8.62502 17.4734 8.70317 18.1019 8.98864 18.8618C9.27648 19.6282 9.77605 20.5313 10.6291 21.9695C11.4826 23.4087 12.2283 24.7773 12.7605 25.786C13.0266 26.2904 13.2394 26.7049 13.3858 26.9934C13.4589 27.1377 13.5155 27.2504 13.5538 27.3272L13.5776 27.375H18.4224L18.4027 27.4147L18.3916 27.4372L18.3881 27.4444L18.5 27.5L18.6124 27.5547C18.5914 27.5975 18.5477 27.625 18.5 27.625H13.5C13.4523 27.625 13.4088 27.5979 13.3878 27.5551L13.3842 27.5478L13.3732 27.5256L13.3301 27.4388C13.292 27.3625 13.2357 27.2502 13.1628 27.1065C13.017 26.819 12.8048 26.4057 12.5394 25.9026C12.0085 24.8964 11.2649 23.5317 10.414 22.0971C9.56261 20.6615 9.05142 19.74 8.75461 18.9498C8.45544 18.1533 8.37503 17.4932 8.37502 16.5832C8.3658 12.4881 11.3314 10.6645 12.8237 9.7469L12.9344 9.67876C13.1725 9.53199 13.3333 9.36665 13.439 9.17937C13.5451 8.99157 13.6 8.7741 13.615 8.51692C13.6453 7.99544 13.5108 7.33776 13.3324 6.48106C13.155 5.62935 13.041 5.01406 12.9714 4.61128C12.9365 4.40989 12.9128 4.26162 12.8977 4.16349C12.8902 4.11442 12.8848 4.07789 12.8813 4.05351L12.8774 4.02602L12.8765 4.01903L12.8762 4.01721C12.8715 3.98149 12.8822 3.94475 12.906 3.91765Z" fill="url(#paint9_linear_18_33363)"/></g></g><g mask="url(#mask1_18_33363)"><g filter="url(#filter3_f_18_33363)"><path d="M18.7383 9.67578C18.2695 9.35156 18.115 8.71942 18.2031 8.07812C18.2031 8.07812 15.5648 8.83241 14.5232 8.93243C14.5232 8.93243 17.9922 9.27344 18.7383 9.67578Z" fill="url(#paint10_linear_18_33363)"/></g></g><path d="M12.75 3H19.25" stroke="url(#paint11_linear_18_33363)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12.75 3H19.25" stroke="url(#paint12_linear_18_33363)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.5 27.5H13.5L12.5 29C12 29.75 12.5 30 13 30H19C19.5 30 20 29.75 19.5 29L18.5 27.5Z" fill="#8C5543"/><path fill-rule="evenodd" clip-rule="evenodd" d="M23.248 14.625H21C20.7929 14.625 20.625 14.7929 20.625 15V16.5C20.625 16.7071 20.7929 16.875 21 16.875H23.4968C23.499 16.7805 23.5 16.6834 23.5 16.5831C23.5003 16.4271 23.4963 16.2744 23.4881 16.125H21.375V15.375H23.4093C23.3682 15.114 23.3139 14.8642 23.248 14.625ZM23.2265 18.625H19.875V15C19.875 14.7929 19.7071 14.625 19.5 14.625H14C13.7929 14.625 13.625 14.7929 13.625 15V16.5C13.625 16.7071 13.7929 16.875 14 16.875H17.125V18.625H12.875V15C12.875 14.7929 12.7071 14.625 12.5 14.625H8.75196C8.68616 14.8642 8.63183 15.114 8.59068 15.375H12.125V19C12.125 19.2071 12.2929 19.375 12.5 19.375H17.5C17.7071 19.375 17.875 19.2071 17.875 19V16.5C17.875 16.2929 17.7071 16.125 17.5 16.125H14.375V15.375H19.125V19C19.125 19.2071 19.2929 19.375 19.5 19.375H22.934C23.0539 19.1082 23.15 18.8623 23.2265 18.625ZM9.06601 19.375H10.5C10.7071 19.375 10.875 19.2071 10.875 19V16.5C10.875 16.2929 10.7071 16.125 10.5 16.125H8.51187C8.5037 16.2744 8.49967 16.4271 8.50002 16.5831C8.50002 16.6834 8.50101 16.7805 8.50316 16.875H10.125V18.625H8.7735C8.84998 18.8623 8.94608 19.1082 9.06601 19.375Z" fill="#6D3437" fill-opacity="0.6"/><g filter="url(#filter4_f_18_33363)"><path d="M19.5846 2.50447L19.3054 2.37427L13.4232 2.75571L18.9428 3.05734L19.5846 3.13274L19.7071 3.00348V2.75571L19.5846 2.50447Z" fill="url(#paint13_linear_18_33363)"/></g><g filter="url(#filter5_f_18_33363)"><path d="M12.3812 3.10742L12.5825 3L16.8233 3.3147L12.8439 3.56355L12.3812 3.62576L12.2929 3.51911V3.3147L12.3812 3.10742Z" fill="url(#paint14_linear_18_33363)"/></g><defs><filter id="filter0_f_18_33363" x="6.99989" y="5.67261" width="7.70778" height="7.48206" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="0.125" result="effect1_foregroundBlur_18_33363"/></filter><filter id="filter1_f_18_33363" x="17.2923" y="5.67261" width="7.70778" height="7.48206" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="0.125" result="effect1_foregroundBlur_18_33363"/></filter><filter id="filter2_f_18_33363" x="7.375" y="2.875" width="17.25" height="25.75" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="0.5" result="effect1_foregroundBlur_18_33363"/></filter><filter id="filter3_f_18_33363" x="13.2732" y="6.82812" width="6.7151" height="4.09766" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="0.625" result="effect1_foregroundBlur_18_33363"/></filter><filter id="filter4_f_18_33363" x="12.7232" y="1.67427" width="7.68391" height="2.15842" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="0.35" result="effect1_foregroundBlur_18_33363"/></filter><filter id="filter5_f_18_33363" x="11.7929" y="2.5" width="5.53043" height="1.62573" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="0.25" result="effect1_foregroundBlur_18_33363"/></filter><linearGradient id="paint0_linear_18_33363" x1="10.8538" y1="6.17261" x2="10.8538" y2="12.6546" gradientUnits="userSpaceOnUse"><stop stop-color="#79493A"/><stop offset="1" stop-color="#744B3A"/></linearGradient><linearGradient id="paint1_linear_18_33363" x1="10.8538" y1="6.17261" x2="10.8538" y2="12.6546" gradientUnits="userSpaceOnUse"><stop stop-color="#8E5C52"/><stop offset="1" stop-color="#915B45"/></linearGradient><linearGradient id="paint2_linear_18_33363" x1="8.19064" y1="10.0124" x2="10.8538" y2="12.6546" gradientUnits="userSpaceOnUse"><stop stop-opacity="0"/><stop offset="1" stop-opacity="0.3"/></linearGradient><linearGradient id="paint3_linear_18_33363" x1="21.1462" y1="6.17261" x2="21.1462" y2="12.6546" gradientUnits="userSpaceOnUse"><stop stop-color="#7D4F3B"/><stop offset="1" stop-color="#835047"/></linearGradient><linearGradient id="paint4_linear_18_33363" x1="21.1462" y1="6.17261" x2="21.1462" y2="12.6546" gradientUnits="userSpaceOnUse"><stop stop-color="#8D5C41"/><stop offset="1" stop-color="#965E54"/></linearGradient><linearGradient id="paint5_linear_18_33363" x1="25.7869" y1="8.40546" x2="21.1462" y2="12.6546" gradientUnits="userSpaceOnUse"><stop stop-opacity="0"/><stop offset="1" stop-opacity="0.2"/></linearGradient><linearGradient id="paint6_linear_18_33363" x1="8.5" y1="16.9999" x2="23.5" y2="16.9999" gradientUnits="userSpaceOnUse"><stop stop-color="#8E643E"/><stop offset="0.28125" stop-color="#AC723C"/><stop offset="0.536458" stop-color="#C8874C"/><stop offset="0.765625" stop-color="#E4A669"/><stop offset="1" stop-color="#D7A36A"/></linearGradient><linearGradient id="paint7_linear_18_33363" x1="16" y1="3.92505" x2="16" y2="27.5667" gradientUnits="userSpaceOnUse"><stop offset="0.463542" stop-color="#C946A4" stop-opacity="0"/><stop offset="1" stop-color="#C946A4" stop-opacity="0.4"/></linearGradient><linearGradient id="paint8_linear_18_33363" x1="16" y1="3.92505" x2="16" y2="5.99994" gradientUnits="userSpaceOnUse"><stop stop-opacity="0.2"/><stop offset="1" stop-opacity="0"/></linearGradient><linearGradient id="paint9_linear_18_33363" x1="16" y1="3.875" x2="16" y2="27.625" gradientUnits="userSpaceOnUse"><stop stop-opacity="0.4"/><stop offset="1" stop-opacity="0.2"/></linearGradient><linearGradient id="paint10_linear_18_33363" x1="18.2103" y1="8.87695" x2="14.5232" y2="8.87695" gradientUnits="userSpaceOnUse"><stop stop-color="#EFC28D"/><stop offset="1" stop-color="#CDA16D" stop-opacity="0.2"/></linearGradient><linearGradient id="paint11_linear_18_33363" x1="16" y1="2" x2="16" y2="4" gradientUnits="userSpaceOnUse"><stop stop-color="#795D4E"/><stop offset="0.375" stop-color="#81533C"/><stop offset="0.65625" stop-color="#774A3C"/><stop offset="1" stop-color="#7D4030"/></linearGradient><linearGradient id="paint12_linear_18_33363" x1="15.5" y1="3" x2="15.5" y2="4" gradientUnits="userSpaceOnUse"><stop stop-color="#7B4545" stop-opacity="0"/><stop offset="1" stop-color="#8D2D61" stop-opacity="0.2"/></linearGradient><linearGradient id="paint13_linear_18_33363" x1="19.7564" y1="2.95097" x2="13.7737" y2="2.94829" gradientUnits="userSpaceOnUse"><stop stop-color="white" stop-opacity="0.35"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient><linearGradient id="paint14_linear_18_33363" x1="12.2574" y1="3.47579" x2="16.5706" y2="3.4741" gradientUnits="userSpaceOnUse"><stop stop-color="white" stop-opacity="0.08"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient></defs></g></svg>'
			);

			// Should not warn about inline style
			expect(warned).toBe(false);
		} finally {
			console.warn = warn;
		}
	});

	test('Filter', () => {
		const content = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 32 32">
		<g fill="none" filter="url(#filter0_iii_18_1526)">
			<path fill="#4686EC" d="m14.035 3.552l4.264 7.284l-6.016 1.71C8.128 11.173 5.681 8.53 4.205 5.814c-.622-1.146-.617-3.25 1.856-3.25h6.248a2 2 0 0 1 1.726.989Z" />
		</g>
		<defs>
			<filter id="filter0_iii_18_1526" width="14.889" height="10.434" x="3.61" y="2.362" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
				<feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
				<feOffset dx="-.25" dy=".25" />
				<feGaussianBlur stdDeviation=".25" />
				<feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
				<feColorMatrix values="0 0 0 0 0.372549 0 0 0 0 0.607843 0 0 0 0 0.960784 0 0 0 1 0" />
			</filter>
		</defs>
	</svg>
	`;

		const svg = new SVG(content);
		cleanupSVG(svg);
		expect(svg.toMinifiedString()).toBe(
			content.replace(/\s*\n\s*/g, '').replace(/" \/>/g, '"/>')
		);
	});

	test('Icon with xlink', async () => {
		const svg = new SVG(await loadFixture('elements/mpath.svg'));
		cleanupSVG(svg);
		expect(svg.toMinifiedString()).toBe(
			'<svg width="100%" height="100%" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="498" height="298" fill="none" stroke="blue" stroke-width="2"/><path id="path1" d="M100,250 C 100,50 400,50 400,250" fill="none" stroke="blue" stroke-width="7.06"/><circle cx="100" cy="250" r="17.64" fill="blue"/><circle cx="250" cy="100" r="17.64" fill="blue"/><circle cx="400" cy="250" r="17.64" fill="blue"/><path d="M-25,-12.5 L25,-12.5 L 0,-87.5 z" fill="yellow" stroke="red" stroke-width="7.06"><animateMotion dur="6s" repeatCount="indefinite" rotate="auto"><mpath href="#path1"/></animateMotion></path></svg>'
		);
	});

	test('CSS animation', async () => {
		const svg = new SVG(await loadFixture('spin.svg'));
		cleanupSVG(svg);
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><style>@keyframes rotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}</style><path fill="#000" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/><path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z" style="animation:0.75s linear infinite rotate" fill="red" transform-origin="center"/></svg>'
		);
	});

	test('Nothing to clean up, with global and inline style', () => {
		const code =
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><style>@keyframes rotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}</style><path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/><path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z" style="animation:0.75s linear infinite rotate" transform-origin="center"/></svg>';
		const svg = new SVG(code);
		cleanupSVG(svg);
		expect(svg.toMinifiedString()).toBe(code);
	});

	test('Title and attributes on svg', () => {
		const code = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<title>TEST</title>
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
		</svg>`;
		const svg = new SVG(code);
		cleanupSVG(svg, {
			keepTitles: true,
		});

		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><title>TEST</title><g fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></g></svg>'
		);
	});
});
