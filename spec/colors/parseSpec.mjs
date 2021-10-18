import { stringToColor } from '@iconify/utils/lib/colors';
import { SVG } from '@iconify/tools/lib/svg';
import { parseColors } from '@iconify/tools/lib/colors/parse';

describe('Finding colors', () => {
	it('Icon without colors', async () => {
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
			hasUnsetColor: true,
			hasGlobalStyle: false,
		});

		// SVG should have changed
		expect(svg.toString()).toBe(
			'<svg viewBox="0 0 24 24" width="24" height="24"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z" fill="currentColor"/></svg>'
		);
	});

	it('Colors on svg element', async () => {
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
			hasUnsetColor: false,
			hasGlobalStyle: false,
		});

		// SVG should have changed
		expect(svg.toString()).not.toBe(svgCode);
	});

	it('Animations', async () => {
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
			hasUnsetColor: true,
			hasGlobalStyle: false,
		});

		// SVG should not have changed
		expect(svg.toString()).toBe(svgCode);
	});
});
