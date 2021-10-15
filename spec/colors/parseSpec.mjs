import { SVG } from '@iconify/tools/lib/svg';
import { parseColors } from '@iconify/tools/lib/colors/parse';

describe('Finding colors', () => {
	it('Icon without colors', () => {
		const svgCode =
			'<svg viewBox="0 0 24 24" width="24" height="24"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></svg>';
		const svg = new SVG(svgCode);

		// Find colors
		const searchResult = parseColors(svg);
		expect(searchResult.defaultFill).toBe(true);
		expect(searchResult.colors).toEqual([]);

		// SVG should not have changed
		expect(svg.toString()).toBe(svgCode);

		// Add color
		const replaceResult = parseColors(svg, {
			defaultFill: 'currentColor',
		});
		expect(replaceResult.defaultFill).toBe(false);
		expect(replaceResult.colors).toEqual([
			{
				type: 'current',
			},
		]);

		// SVG should have changed
		expect(svg.toString()).not.toBe(svgCode);
	});

	it('Colors on svg element', () => {
		const svgCode =
			'<svg viewBox="0 0 24 24" width="24" height="24" fill="black"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></svg>';
		const svg = new SVG(svgCode);

		// Find colors
		const searchResult = parseColors(svg);
		expect(searchResult.defaultFill).toBe(false);
		expect(searchResult.colors).toEqual([
			{
				type: 'rgb',
				r: 0,
				g: 0,
				b: 0,
				alpha: 1,
			},
		]);

		// SVG should not have changed
		expect(svg.toString()).toBe(svgCode);

		// Add color
		const replaceResult = parseColors(svg, {
			// Replace all colors with 'white'
			callback: (color) => {
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
		expect(replaceResult.defaultFill).toBe(false);
		expect(replaceResult.colors).toEqual([
			{
				type: 'rgb',
				r: 255,
				g: 255,
				b: 255,
				alpha: 1,
			},
		]);

		// SVG should have changed
		expect(svg.toString()).not.toBe(svgCode);
	});
});
