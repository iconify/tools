import { SVG } from '../../lib/svg';
import { cleanupSVG } from '../../lib/svg/cleanup';
import { loadFixture } from '../load';

describe('Cleaning up SVG', () => {
	test('Moving fill to content', async () => {
		const svg = new SVG(
			'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="20" viewBox="-8 -16 24 40" fill="red"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></svg>'
		);
		await cleanupSVG(svg);
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="20" viewBox="-8 -16 24 40"><g fill="red"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></g></svg>'
		);
	});

	test('entypo-hair-cross.svg', async () => {
		const svg = new SVG(await loadFixture('entypo-hair-cross.svg'));
		await cleanupSVG(svg);
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20"><path d="M10,0.4c-5.303,0-9.601,4.298-9.601,9.6c0,5.303,4.298,9.601,9.601,9.601c5.301,0,9.6-4.298,9.6-9.601C19.6,4.698,15.301,0.4,10,0.4z M11,17.525V13H9v4.525C5.604,17.079,2.92,14.396,2.473,11H7V9H2.473C2.92,5.604,5.604,2.921,9,2.475V7h2V2.475c3.394,0.447,6.078,3.13,6.525,6.525H13v2h4.525C17.078,14.394,14.394,17.078,11,17.525z"/></svg>'
		);
	});

	test('1f3eb.svg', async () => {
		const svg = new SVG(await loadFixture('1f3eb.svg'));
		await cleanupSVG(svg);
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 47.5 47.5" width="47.5" height="47.5"><defs><clipPath id="clipPath16" clipPathUnits="userSpaceOnUse"><path id="path18" d="M 0,38 38,38 38,0 0,0 0,38 Z"/></clipPath></defs><g transform="matrix(1.25,0,0,-1.25,0,47.5)" id="g10"><g id="g12"><g clip-path="url(#clipPath16)" id="g14"><g transform="translate(37,3)" id="g20"><path id="path22" d="m 0,0 c 0,-1.104 -0.896,-2 -2,-2 l -32,0 c -1.104,0 -2,0.896 -2,2 l 0,19 c 0,1.104 0.896,2 2,2 l 32,0 c 1.104,0 2,-0.896 2,-2 L 0,0 Z" fill="#ffcc4d" fill-opacity="1" fill-rule="nonzero" stroke="none"/></g><g transform="translate(35,24)" id="g24"><path id="path26" d="m 0,0 -32,0 c -1.104,0 -2,-0.896 -2,-2 L 2,-2 C 2,-0.896 1.104,0 0,0" fill="#6d6e71" fill-opacity="1" fill-rule="nonzero" stroke="none"/></g><path id="path28" d="M 35,9 3,9 3,13 35,13 35,9 Z" fill="#3b88c3" fill-opacity="1" fill-rule="nonzero" stroke="none"/><path id="path30" d="m 35,15 -32,0 0,4 32,0 0,-4 z" fill="#3b88c3" fill-opacity="1" fill-rule="nonzero" stroke="none"/><path id="path32" d="M 35,3 3,3 3,7 35,7 35,3 Z" fill="#3b88c3" fill-opacity="1" fill-rule="nonzero" stroke="none"/><path id="path34" d="m 31,2 -2,0 0,18 2,0 0,-18 z" fill="#ffcc4d" fill-opacity="1" fill-rule="nonzero" stroke="none"/><g transform="translate(23,37)" id="g36"><path id="path38" d="m 0,0 -16,0 c -1.104,0 -2,-0.896 -2,-2 l 0,-34 20,0 0,34 C 2,-0.896 1.104,0 0,0" fill="#ffe8b6" fill-opacity="1" fill-rule="nonzero" stroke="none"/></g><g transform="translate(23,37)" id="g40"><path id="path42" d="m 0,0 -16,0 c -1.104,0 -2,-0.896 -2,-2 L 2,-2 C 2,-0.896 1.104,0 0,0" fill="#808285" fill-opacity="1" fill-rule="nonzero" stroke="none"/></g><path id="path44" d="m 23,15 -16,0 0,4 16,0 0,-4 z" fill="#55acee" fill-opacity="1" fill-rule="nonzero" stroke="none"/><path id="path46" d="M 23,9 7,9 7,13 23,13 23,9 Z" fill="#55acee" fill-opacity="1" fill-rule="nonzero" stroke="none"/><path id="path48" d="M 23,3 7,3 7,7 23,7 23,3 Z" fill="#55acee" fill-opacity="1" fill-rule="nonzero" stroke="none"/><path id="path50" d="m 13,1 -2,0 0,29 2,0 0,-29 z" fill="#ffe8b6" fill-opacity="1" fill-rule="nonzero" stroke="none"/><path id="path52" d="m 19,1 -2,0 0,29 2,0 0,-29 z" fill="#ffe8b6" fill-opacity="1" fill-rule="nonzero" stroke="none"/><path id="path54" d="m 17,1 -4,0 0,6 4,0 0,-6 z" fill="#226699" fill-opacity="1" fill-rule="nonzero" stroke="none"/><g transform="translate(21,28)" id="g56"><path id="path58" d="m 0,0 c 0,-3.313 -2.687,-6 -6,-6 -3.313,0 -6,2.687 -6,6 0,3.313 2.687,6 6,6 3.313,0 6,-2.687 6,-6" fill="#a7a9ac" fill-opacity="1" fill-rule="nonzero" stroke="none"/></g><g transform="translate(19,28)" id="g60"><path id="path62" d="m 0,0 c 0,-2.209 -1.791,-4 -4,-4 -2.209,0 -4,1.791 -4,4 0,2.209 1.791,4 4,4 2.209,0 4,-1.791 4,-4" fill="#e6e7e8" fill-opacity="1" fill-rule="nonzero" stroke="none"/></g><g transform="translate(18,27)" id="g64"><path id="path66" d="m 0,0 -3,0 c -0.552,0 -1,0.448 -1,1 l 0,5 c 0,0.552 0.448,1 1,1 0.552,0 1,-0.448 1,-1 L -2,2 0,2 C 0.552,2 1,1.552 1,1 1,0.448 0.552,0 0,0" fill="#a0041e" fill-opacity="1" fill-rule="nonzero" stroke="none"/></g></g></g></g></svg>'
		);
	});

	test('batch-asterisk.svg', async () => {
		const svg = new SVG(await loadFixture('batch-asterisk.svg'));
		await cleanupSVG(svg);
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"> <g fill="#000000"><path d="M 42.588,20.196C 41.058,21.078, 36.348,22.911, 32.034,24.00 c 4.314,1.089, 9.024,2.922, 10.557,3.804C 45.456,29.46, 46.44,33.129, 44.784,36.00c-1.656,2.871-5.325,3.852-8.193,2.196 c-1.533-0.885-5.475-4.053-8.574-7.245C 29.232,35.235, 30.00,40.233, 30.00,42.00c0.00,3.312-2.688,6.00-6.00,6.00s-6.00-2.688-6.00-6.00 c0.00-1.767, 0.768-6.765, 1.986-11.049c-3.099,3.192-7.041,6.36-8.574,7.245C 8.541,39.852, 4.872,38.871, 3.216,36.00S 2.541,29.46, 5.412,27.804 C 6.942,26.922, 11.652,25.089, 15.969,24.00C 11.652,22.911, 6.942,21.078, 5.412,20.196C 2.541,18.54, 1.56,14.871, 3.216,12.00s 5.325-3.852, 8.196-2.196 c 1.533,0.885, 5.475,4.053, 8.574,7.245C 18.768,12.765, 18.00,7.767, 18.00,6.00c0.00-3.312, 2.688-6.00, 6.00-6.00s 6.00,2.688, 6.00,6.00c0.00,1.767-0.768,6.765-1.986,11.049 c 3.099-3.192, 7.044-6.36, 8.574-7.245c 2.868-1.656, 6.54-0.675, 8.193,2.196C 46.44,14.871, 45.456,18.54, 42.588,20.196z"/></g></svg>'
		);
	});

	test('bpmn-default-flow.svg', async () => {
		const svg = new SVG(await loadFixture('bpmn-default-flow.svg'));
		await cleanupSVG(svg);
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" height="2048" width="2048" viewBox="0 0 2048 2048"><defs/><g transform="translate(0,995.63783)" id="layer1"><g id="layer1-6" transform="matrix(96.752895,0,0,96.752895,55.328158,-100816.34)"><path d="m 1866.4062,206.6875 c 0,0 -585.4533,298.7241 -882.8437,438.40625 63.7073,58.17752 122.9637,120.92602 184.4375,181.40625 -302.3528,306.3874 -604.7097,612.7689 -907.0625,919.1562 22.17254,21.1599 44.32746,42.3089 66.5,63.4688 C 629.7903,1502.7376 932.1472,1196.3874 1234.5,890 c 61.5877,61.37036 122.8273,123.0865 184.4375,184.4375 158.8449,-312.83114 447.4687,-867.75 447.4687,-867.75 z" transform="matrix(0.01033561,0,0,0.01033561,-0.57185015,1031.7077)" id="path7791" color="#000000" fill="#000000" fill-opacity="1" fill-rule="nonzero" stroke="none" stroke-width="0.95637447" visibility="visible" display="inline"/><g transform="matrix(0.01033561,0,0,0.01033561,19.338451,1039.3007)" id="layer1-9"><g transform="matrix(125.07184,0,0,96.752895,613.03918,-100952.21)" id="layer1-6-1" stroke="#000000" stroke-width="0.93020457" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"><path id="path4203" d="m -18.199126,1050.7133 5.930228,0" color="#000000" display="inline" visibility="visible" opacity="1" color-interpolation="sRGB" fill="none" fill-opacity="1" fill-rule="evenodd" stroke="#000000" stroke-width="0.90905082" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-dashoffset="0" stroke-opacity="1" color-rendering="auto"/></g></g></g></g></svg>'
		);
	});

	test('Get rid of style, data- attribute, title, enable-background', async () => {
		const svg = new SVG(
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" enable-background="new 0 0 24 24" id="irrelevant"><defs><style>.cls-1{fill:#fff;opacity:0;cursor:pointer;}.cls-2{fill:#231f20;}</style></defs><title>arrow-circle-right</title><g id="Layer_2" data-name="Layer 2"><g id="arrow-circle-right"><g id="arrow-circle-right-2" data-name="arrow-circle-right"><rect class="cls-1" width="24" height="24" transform="translate(0 24) rotate(-90)"/><path class="cls-2" d="M2,12A10,10,0,1,0,12,2,10,10,0,0,0,2,12ZM13.86,8.31l2.86,3a.49.49,0,0,1,.1.15.54.54,0,0,1,.1.16.94.94,0,0,1,0,.76,1,1,0,0,1-.21.33l-3,3a1,1,0,0,1-1.42-1.42L13.59,13H8a1,1,0,0,1,0-2h5.66L12.41,9.69a1,1,0,0,1,1.45-1.38Z"/></g></g></g></svg>`
		);
		await cleanupSVG(svg);
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><g id="Layer_2"><g id="arrow-circle-right"><g id="arrow-circle-right-2"><rect width="24" height="24" transform="translate(0 24) rotate(-90)" fill="#fff" opacity="0"/><path d="M2,12A10,10,0,1,0,12,2,10,10,0,0,0,2,12ZM13.86,8.31l2.86,3a.49.49,0,0,1,.1.15.54.54,0,0,1,.1.16.94.94,0,0,1,0,.76,1,1,0,0,1-.21.33l-3,3a1,1,0,0,1-1.42-1.42L13.59,13H8a1,1,0,0,1,0-2h5.66L12.41,9.69a1,1,0,0,1,1.45-1.38Z" fill="#231f20"/></g></g></g></svg>'
		);
	});

	test('Animation, nothing to clean up', async () => {
		const svg = new SVG(await loadFixture('animation.svg'));
		const expectedSVG = svg.toMinifiedString();
		await cleanupSVG(svg);
		expect(svg.toMinifiedString()).toBe(expectedSVG);
	});

	test('Namespaces', async () => {
		const svg = new SVG(await loadFixture('bpmn-trash.svg'));
		await cleanupSVG(svg);
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048" viewBox="0 0 2048 2048"><defs></defs><g id="layer1" transform="translate(0,995.63783)"><g transform="matrix(96.752895,0,0,96.752895,55.328158,-100816.34)" id="layer1-6" display="inline"><path d="m 3.4296875,1038.3672 1.3325877,12.7308 10.5912408,0 1.228186,-12.7284 -13.1520736,0 z m 1.4921875,1.3437 10.185547,0 -0.972656,10.0411 -8.1582035,0 z" id="rect4089" color="#000000" display="inline" visibility="visible" opacity="1" color-interpolation="sRGB" fill="#000000" fill-opacity="1" fill-rule="nonzero" stroke="none" stroke-width="1.343629" stroke-linecap="round" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-dashoffset="0" stroke-opacity="1" color-rendering="auto"/><g id="g4275" transform="matrix(1,0,0,0.90111263,0,103.41515)"><path id="path4092" d="m 7.0333918,1040.9794 0.9432241,7.504" fill="none" stroke="#000000" stroke-width="1.343629" stroke-linecap="round" stroke-linejoin="miter" stroke-miterlimit="4" stroke-opacity="1" stroke-dasharray="none"/><path id="path4092-2" d="m 12.990235,1040.9794 -0.943224,7.504" fill="none" stroke="#000000" stroke-width="1.343629" stroke-linecap="round" stroke-linejoin="miter" stroke-miterlimit="4" stroke-opacity="1" stroke-dasharray="none"/></g><path d="m 7.2638322,1035.194 -4.2854023,1.2542 0,0.6276 14.0667651,0 0,-0.6276 -4.337726,-1.2542 z" id="rect4121" fill="#000000" fill-opacity="1" stroke="none"/><path d="m 7.6269598,1033.8929 4.7697062,0 0,1.737 -4.7697062,0 z" id="rect4121-6" display="inline" fill="#000000" fill-opacity="1" stroke="#000000" stroke-width="0.72291225" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-dashoffset="0" stroke-opacity="1"/></g></g></svg>'
		);
	});

	test('Attributes from defs', async () => {
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
		const svg = new SVG(svgCode);
		await cleanupSVG(svg);
		expect(svg.toMinifiedString()).toBe(
			'<svg width="256" height="256" viewBox="0 0 256 256"><defs><symbol id="def1" fill="purple"><rect x="0" y="0" width="64" height="64" id="def2"/></symbol></defs><use href="#def1" fill="red"/><use href="#def2" transform="translate(32 32)"/><use href="#def2" fill="teal" transform="translate(64 64)"/></svg>'
		);
	});
});
