import { stringToColor } from '@iconify/utils/lib/colors';
import { SVG } from '../../lib/svg';
import { parseColors } from '../../lib/colors/parse';
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
			hasDefaultFill: true,
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
			hasDefaultFill: true,
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
			hasDefaultFill: false,
			hasGlobalStyle: false,
		});

		// SVG should not have changed
		expect(svg.toString()).toBe(svgCode);

		// Add color
		const replaceResult = await parseColors(svg, {
			// Replace all colors with 'white'
			// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
			callback: (attr, color) => {
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
			hasDefaultFill: false,
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
			hasDefaultFill: false,
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
			hasDefaultFill: false,
			hasGlobalStyle: false,
		});
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
			].map(stringToColor),
			hasDefaultFill: false,
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
			hasDefaultFill: true,
			hasGlobalStyle: false,
		});

		// SVG should not have changed
		expect(svg.toString()).toBe(svgCode);
	});
});
