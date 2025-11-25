import { stringToColor } from '@iconify/utils/lib/colors/index.js';
import { SVG } from '../../src/svg/index.js';
import { validateColors } from '../../src/colors/validate.js';
import { loadFixture } from '../../src/tests/helpers.js';

describe('Validating colors', () => {
	test('Icon without colors', () => {
		const svgCode =
			'<svg viewBox="0 0 24 24" width="24" height="24"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></svg>';
		const svg = new SVG(svgCode);

		// No palette found, but hasUnsetColor is set
		let result = validateColors(svg, true);
		expect(result).toEqual({
			colors: [],
			hasUnsetColor: true,
			hasGlobalStyle: false,
		});

		// currentColor should not have been found either, but hasUnsetColor is set
		result = validateColors(svg, false);
		expect(result).toEqual({
			colors: [],
			hasUnsetColor: true,
			hasGlobalStyle: false,
		});
	});

	test('Monotone icon', () => {
		const svgCode =
			'<svg viewBox="0 0 24 24" width="24" height="24"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z" /></svg>';
		const svg = new SVG(svgCode);

		// No palette found, but hasUnsetColor is set
		const result = validateColors(svg, true, {
			defaultColor: 'currentColor',
		});
		expect(result).toEqual({
			colors: [
				{
					type: 'current',
				},
			],
			hasUnsetColor: false,
			hasGlobalStyle: false,
		});
	});

	test('Icon with palette', () => {
		const svgCode =
			'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 128 128"><path fill="#fff" d="M4 4h120v120H4z"/><g fill="none" stroke="#b0bec5" stroke-width="1.993" stroke-miterlimit="10"><path d="M24.7 4.2v119.6"/><path d="M44.35 4.2v119.6"/><path d="M64 4.2v119.6"/><path d="M83.65 4.2v119.6"/><path d="M103.3 4.2v119.6"/></g><g fill="none" stroke="#b0bec5" stroke-width="2" stroke-miterlimit="10"><path d="M123.8 24.66H4.15"/><path d="M123.81 44.33H4.16"/><path d="M123.83 64H4.17"/><path d="M123.84 83.67H4.19"/><path d="M123.85 103.34H4.2"/></g><path fill="#0b88cf" d="M5.1 5.14l-.08 6.17l26.92 48.51l23.7-21.91l63.78 85.1h3.49l.14-5.16l-66.6-88.86l-23.02 21.28L8.45 5.11z"/><path d="M122.01 5.99V122H5.99V5.99h116.02M124 4H4v120h120V4z" fill="#b0bec5"/></svg>';
		const svg = new SVG(svgCode);

		// Palette
		const result = validateColors(svg, false);
		expect(result).toEqual({
			colors: ['#fff', 'none', '#b0bec5', '#0b88cf'].map(stringToColor),
			hasUnsetColor: false,
			hasGlobalStyle: false,
		});

		// currentColor should not be there
		expect(() => {
			validateColors(svg, true);
		}).toThrow();
	});

	test('Mixed icon', () => {
		const svgCode =
			'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><g fill="none"><path d="M15.052 14.32h.813L21 19.468L19.467 21l-5.146-5.136v-.813l-.278-.288A6.66 6.66 0 0 1 9.69 16.38a6.69 6.69 0 1 1 6.69-6.69a6.66 6.66 0 0 1-1.617 4.354l.289.278z" fill="currentColor"/><path d="M10.204 7.117H9.175v2.058H7.117v1.03h2.058v2.057h1.03v-2.058h2.057V9.175h-2.058V7.117z" fill="#fff"/></g></svg>';
		const svg = new SVG(svgCode);

		// Should throw because of white color
		expect(() => {
			validateColors(svg, true);
		}).toThrow();

		// Should throw because of currentColor
		expect(() => {
			validateColors(svg, false);
		}).toThrow();
	});

	test('URI', async () => {
		const svgCode = await loadFixture('bz.svg');
		const svg = new SVG(svgCode);

		const result = validateColors(svg, false);
		expect(result).toEqual({
			colors: [
				'#ce1126',
				'#003f87',
				'#fff',
				'none',
				'#552300',
				'#007f00',
				'#005800',
				'#730000',
				'#000',
				'#289400',
				'#030',
				'#004b00',
				'#9dd7ff',
				'#ffd83c',
				'#ff0018',
				'#006ac8',
				'#5ac800',
				'#ffd800',
				'#b34b00',
				'#ccb8c8',
				'#782121',
				'#7e4b7e',
				'#060',
				'#ffa54b',
				'#ffef5d',
				'#ea5700',
				'#9b5f00',
				'#ffb366',
				'#952d1a',
				'#570a00',
				'#69f',
			].map(stringToColor),
			hasUnsetColor: true,
			hasGlobalStyle: false,
		});
	});

	test('Icon with palette in filter', async () => {
		const svgCode = await loadFixture('elements/feFlood.svg');
		const svg = new SVG(svgCode);

		// Palette
		const result = validateColors(svg, false);
		expect(result).toEqual({
			colors: ['green'].map(stringToColor),
			hasUnsetColor: false,
			hasGlobalStyle: false,
		});
	});

	test('Icon with palette with filter without color', async () => {
		const svgCode = await loadFixture('1st_place_medal_color.svg');
		const svg = new SVG(svgCode);

		// Palette
		const result = validateColors(svg, false);
		expect(result.hasGlobalStyle).toBe(false);
		expect(result.hasUnsetColor).toBe(false);

		// currentColor should not be there
		expect(() => {
			validateColors(svg, true);
		}).toThrow();
	});

	test('Missing stop-color with stop-opacity', async () => {
		const svgCode = await loadFixture('amphora_color.svg');
		const svg = new SVG(svgCode);

		// Palette
		const result = validateColors(svg, false);
		expect(result.hasGlobalStyle).toBe(false);
		expect(result.hasUnsetColor).toBe(false);

		// currentColor should not be there
		expect(() => {
			validateColors(svg, true);
		}).toThrow();
	});
});
