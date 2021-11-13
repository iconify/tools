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

	test('Unsupported color', async () => {
		const svgCode =
			'<svg viewBox="0 0 24 24" width="24" height="24"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z" fill="--var(foo)"/></svg>';
		const svg = new SVG(svgCode);

		// Find colors
		const searchResult = await parseColors(svg, {
			callback: (attr, colorStr, color) => {
				expect(attr).toBe('fill');
				expect(colorStr).toBe('--var(foo)');
				expect(color).toBeNull();
				return '--bar(bar)';
			},
		});
		expect(searchResult).toEqual({
			colors: ['--bar(bar)'],
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
});
