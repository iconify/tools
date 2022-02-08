import { stringToColor } from '@iconify/utils/lib/colors';
import { SVG } from '../../lib/svg';
import { parseColors, isEmptyColor } from '../../lib/colors/parse';
import { loadFixture } from '../load';

describe('Finding colors', () => {
	test('Icon without colors', async () => {
		const svgCode =
			'<svg viewBox="0 0 24 24" width="24" height="24"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></svg>';
		const svg = new SVG(svgCode);

		// Find colors
		const searchResult = await parseColors(svg);
		expect(searchResult).toEqual({
			colors: [],
			hasUnsetColor: true,
			hasGlobalStyle: false,
		});

		// SVG should not have changed
		expect(svg.toString()).toBe(svgCode);

		// Add color
		const replaceResult = await parseColors(svg, {
			defaultColor: 'currentColor',
		});
		expect(replaceResult).toEqual({
			colors: [
				{
					type: 'current',
				},
			],
			// Cannot have unset color after it was set
			hasUnsetColor: false,
			hasGlobalStyle: false,
		});

		// SVG should have changed
		expect(svg.toString()).toBe(
			'<svg viewBox="0 0 24 24" width="24" height="24"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z" fill="currentColor"/></svg>'
		);
	});

	test('Colors on svg element', async () => {
		const svgCode =
			'<svg viewBox="0 0 24 24" width="24" height="24" fill="black"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></svg>';
		const svg = new SVG(svgCode);

		// Find colors
		const searchResult = await parseColors(svg);
		expect(searchResult).toEqual({
			colors: [
				{
					type: 'rgb',
					r: 0,
					g: 0,
					b: 0,
					alpha: 1,
				},
			],
			hasUnsetColor: false,
			hasGlobalStyle: false,
		});

		// SVG should not have changed
		expect(svg.toString()).toBe(svgCode);

		// Add color
		const replaceResult = await parseColors(svg, {
			// Replace all colors with 'white'
			callback: (_attr, _colorStr, color) => {
				expect(color).toEqual({
					type: 'rgb',
					r: 0,
					g: 0,
					b: 0,
					alpha: 1,
				});
				return 'white';
			},
		});
		expect(replaceResult).toEqual({
			colors: [
				{
					type: 'rgb',
					r: 255,
					g: 255,
					b: 255,
					alpha: 1,
				},
			],
			hasUnsetColor: false,
			hasGlobalStyle: false,
		});

		// SVG should have changed
		expect(svg.toString()).not.toBe(svgCode);
	});

	test('u1F3CC-golfer.svg', async () => {
		const svgCode = await loadFixture('u1F3CC-golfer.svg');
		const svg = new SVG(svgCode);

		// Find colors
		const searchResult = await parseColors(svg);
		expect(searchResult).toEqual({
			colors: [
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
				'#edc0a2',
			].map(stringToColor),
			hasUnsetColor: false,
			hasGlobalStyle: false,
		});
	});

	test('fci-biomass.svg', async () => {
		const svgCode = await loadFixture('fci-biomass.svg');
		const svg = new SVG(svgCode);

		// Find colors
		const searchResult = await parseColors(svg);
		expect(searchResult).toEqual({
			colors: ['#9ccc65', '#8bc34a', '#2e7d32', '#388e3c', '#43a047'].map(
				stringToColor
			),
			hasUnsetColor: false,
			hasGlobalStyle: false,
		});

		expect(svg.toMinifiedString()).toBe(
			'<svg version="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" enable-background="new 0 0 48 48" width="48" height="48"><path fill="#9CCC65" d="M32,15V7H16v8L6.2,40c-0.6,1.5,0.5,3,2.1,3h31.5c1.6,0,2.6-1.6,2.1-3L32,15z"/><path fill="#8BC34A" d="M32,9H16c-1.1,0-2-0.9-2-2v0c0-1.1,0.9-2,2-2h16c1.1,0,2,0.9,2,2v0C34,8.1,33.1,9,32,9z"/><path fill="#2E7D32" d="M28,30c0,4.4-4,8-4,8s-4-3.6-4-8s4-8,4-8S28,25.6,28,30z"/><path fill="#388E3C" d="M31.1,32.6c-2,4-7.1,5.4-7.1,5.4s-2-5,0-8.9s7.1-5.4,7.1-5.4S33.1,28.6,31.1,32.6z"/><path fill="#43A047" d="M16.9,32.6c2,4,7.1,5.4,7.1,5.4s2-5,0-8.9s-7.1-5.4-7.1-5.4S14.9,28.6,16.9,32.6z"/></svg>'
		);

		// Change everything to currentColor... because why not
		const replaceResult = await parseColors(svg, {
			defaultColor: 'currentColor',
			callback: (_attr, colorStr, color) => {
				return !color
					? colorStr
					: isEmptyColor(color)
					? color
					: 'currentColor';
			},
		});
		expect(replaceResult).toEqual({
			colors: [
				{
					type: 'current',
				},
			],
			hasUnsetColor: false,
			hasGlobalStyle: false,
		});

		expect(svg.toMinifiedString()).toBe(
			'<svg version="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" enable-background="new 0 0 48 48" width="48" height="48"><path fill="currentColor" d="M32,15V7H16v8L6.2,40c-0.6,1.5,0.5,3,2.1,3h31.5c1.6,0,2.6-1.6,2.1-3L32,15z"/><path fill="currentColor" d="M32,9H16c-1.1,0-2-0.9-2-2v0c0-1.1,0.9-2,2-2h16c1.1,0,2,0.9,2,2v0C34,8.1,33.1,9,32,9z"/><path fill="currentColor" d="M28,30c0,4.4-4,8-4,8s-4-3.6-4-8s4-8,4-8S28,25.6,28,30z"/><path fill="currentColor" d="M31.1,32.6c-2,4-7.1,5.4-7.1,5.4s-2-5,0-8.9s7.1-5.4,7.1-5.4S33.1,28.6,31.1,32.6z"/><path fill="currentColor" d="M16.9,32.6c2,4,7.1,5.4,7.1,5.4s2-5,0-8.9s-7.1-5.4-7.1-5.4S14.9,28.6,16.9,32.6z"/></svg>'
		);
	});

	test('global style', async () => {
		const svgCode = await loadFixture('elements/style/style.svg');
		const svg = new SVG(svgCode);

		// Gloabl style in SVG should not have changed
		expect(svg.toMinifiedString()).toBe(
			'<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" width="10" height="10"><style>circle {fill: gold;stroke: maroon;stroke-width: 2px;}</style><circle cx="5" cy="5" r="4"/></svg>'
		);

		// Find colors
		const searchResult = await parseColors(svg);
		expect(searchResult).toEqual({
			colors: ['gold', 'maroon'].map(stringToColor),
			hasUnsetColor: false,
			hasGlobalStyle: true,
		});

		// SVG should not have changed
		expect(svg.toMinifiedString()).toBe(
			'<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" width="10" height="10"><style>circle {fill: gold;stroke: maroon;stroke-width: 2px;}</style><circle cx="5" cy="5" r="4"/></svg>'
		);

		// Replace colors
		const replaceResult = await parseColors(svg, {
			defaultColor: 'red',
			callback: (attr, _colorStr, color) => {
				switch (attr) {
					case 'fill':
						expect(color).toEqual({
							type: 'rgb',
							r: 255,
							g: 215,
							b: 0,
							alpha: 1,
						});
						return 'purple';

					case 'stroke':
						expect(color).toEqual({
							type: 'rgb',
							r: 128,
							g: 0,
							b: 0,
							alpha: 1,
						});

						return 'green';

					default:
						return 'blue';
				}
			},
		});
		expect(replaceResult).toEqual({
			colors: ['purple', 'green'].map(stringToColor),
			hasUnsetColor: false,
			hasGlobalStyle: true,
		});

		// Default color should not have been added because of global style
		expect(svg.toMinifiedString()).toBe(
			'<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" width="10" height="10"><style>circle {fill: purple;stroke: green;stroke-width: 2px;}</style><circle cx="5" cy="5" r="4"/></svg>'
		);
	});

	test('keywords', async () => {
		const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10">
	<g stroke="black">
		<path d="" stroke="inherit" fill="none" />
		<path d="" stroke="transparent" fill="red" />
		<path d="" stroke="hsla(120, 50%, 50%, .5)" fill="currentColor" />
	</g>
</svg>`;
		const svg = new SVG(svgCode);

		// Find colors
		const searchResult = await parseColors(svg);
		expect(searchResult).toEqual({
			colors: [
				'#000',
				'none',
				'#f00',
				'transparent',
				'currentColor',
				'hsla(120,50%,50%,.5)',
			].map((color) => stringToColor(color) || color),
			hasUnsetColor: false,
			hasGlobalStyle: false,
		});
	});

	test('Animations', async () => {
		const svgCode = `<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" width="10" height="10">
		<rect width="10" height="10">
		  <animate attributeName="fill" values="red;blue;green;red" dur="3s" repeatCount="indefinite"/>
		</rect>
		</svg>`;
		const svg = new SVG(svgCode);

		// Find colors
		const searchResult = await parseColors(svg);
		expect(searchResult).toEqual({
			colors: ['red', 'blue', 'green'].map(stringToColor),
			// Rectangle doesn't actually have color, even though animation sets it
			hasUnsetColor: true,
			hasGlobalStyle: false,
		});

		// SVG should not have changed
		expect(svg.toString()).toBe(svgCode);
	});

	test('None', async () => {
		const svgCode =
			'<svg viewBox="0 0 24 24" width="24" height="24"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z" fill="none"/></svg>';
		const svg = new SVG(svgCode);

		// Find colors
		const searchResult = await parseColors(svg);
		expect(searchResult).toEqual({
			colors: [
				{
					type: 'none',
				},
			],
			hasUnsetColor: false,
			hasGlobalStyle: false,
		});
	});

	test('Function color', async () => {
		const svgCode =
			'<svg viewBox="0 0 24 24" width="24" height="24"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z" fill="var(--foo)"/></svg>';
		const svg = new SVG(svgCode);

		// Find colors
		const searchResult = await parseColors(svg, {
			callback: (attr, colorStr, color) => {
				expect(attr).toBe('fill');
				expect(colorStr).toBe('var(--foo)');
				expect(color).toEqual({
					type: 'function',
					func: 'var',
					value: '--foo',
				});
				return 'var(--bar)';
			},
		});
		expect(searchResult).toEqual({
			colors: [
				{
					type: 'function',
					func: 'var',
					value: '--bar',
				},
			],
			hasUnsetColor: false,
			hasGlobalStyle: false,
		});
	});

	test('Empty color', async () => {
		const svgCode =
			'<svg viewBox="0 0 24 24" width="24" height="24"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z" fill="" stroke="inherit"/></svg>';
		const svg = new SVG(svgCode);

		// Find colors
		const searchResult = await parseColors(svg, {
			callback: (attr) => {
				throw new Error(`Unexpected callback call for "${attr}"`);
			},
		});
		expect(searchResult).toEqual({
			colors: [],
			hasUnsetColor: true,
			hasGlobalStyle: false,
		});

		// Empty colors should have been removed
		expect(svg.toString()).toBe(
			'<svg viewBox="0 0 24 24" width="24" height="24"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></svg>'
		);
	});

	test('Gradient', async () => {
		const svgCode = `<svg width="256px" height="256px" viewBox="0 0 256 256" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid">
			<defs>
				<radialGradient cx="1.55750275e-05%" cy="99.999994%" fx="1.55750275e-05%" fy="99.999994%" r="120.115697%" gradientTransform="translate(0.000000,1.000000),scale(0.832531,1.000000),scale(1.000000,0.832531),translate(-0.000000,-1.000000)" id="radialGradient-1">
					<stop stop-color="#00C812" offset="0%"></stop>
					<stop stop-color="#006E00" offset="100%"></stop>
				</radialGradient>
			</defs>
			<path d="M179.2,230.4 L256,230.4 L133.12,128 C131.433,165.193 147.807,201.58 179.2,230.4" fill="url(#radialGradient-1)"></path>
		</svg>`;
		const svg = new SVG(svgCode);

		// Find colors
		const searchResult = await parseColors(svg, {
			defaultColor: () => {
				throw new Error(`Unexpected callback call for defaultColor`);
			},
		});
		expect(searchResult).toEqual({
			colors: [stringToColor('#00C812'), stringToColor('#006E00')],
			hasUnsetColor: false,
			hasGlobalStyle: false,
		});
	});

	/*
	test('Mask that uses path', async () => {
		const svgCode = `<svg width="256px" height="256px" viewBox="0 0 256 256" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid">
			<defs>
				<path d="M2.27464661e-14,0 L254.693878,3.04336596e-14 L254.693878,160.344259 C255.3267,161.198982 255.762422,162.157626 256,163.39634 L256,168.36419 C255.762422,169.608049 255.3267,170.691008 254.693878,171.604678 L254.693878,256 L0,256 L0,192 L0,64 L2.27464661e-14,0 Z" id="path-1"></path>
				<radialGradient cx="16.6089694%" cy="17.3718345%" fx="16.6089694%" fy="17.3718345%" r="118.520308%" id="radialGradient-3">
					<stop stop-color="#88CDE7" offset="0%"></stop>
					<stop stop-color="#2274AD" offset="100%"></stop>
				</radialGradient>
			</defs>
			<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
				<mask id="mask-2" fill="white">
					<use xlink:href="#path-1"></use>
				</mask>
				<polygon fill="url(#radialGradient-3)" mask="url(#mask-2)" points="0 256 256 256 256 0 0 0"></polygon>
			</g>
		</svg>`;
		const svg = new SVG(svgCode);

		// Find colors
		const searchResult = await parseColors(svg, {
			defaultColor: () => {
				throw new Error(`Unexpected callback call for defaultColor`);
			},
		});
		expect(searchResult).toEqual({
			colors: [stringToColor('#88CDE7'), stringToColor('#2274AD')],
			hasUnsetColor: false,
			hasGlobalStyle: false,
		});
	});
	*/
});
