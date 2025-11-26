import { SVG } from '../../src/svg/index.js';
import { cleanupSVG } from '../../src/svg/cleanup.js';
import { parseSVG } from '../../src/svg/parse.js';
import { loadFixture } from '../../src/tests/helpers.js';

describe('Parsing SVG', () => {
	test('Removing grid', async () => {
		const svg = new SVG(await loadFixture('openmoji-2117.svg'));

		// Clean up
		cleanupSVG(svg);

		// Parse
		parseSVG(svg, (item) => {
			if (item.node.tag === 'g') {
				// Check for grid
				const attribs = item.node.attribs;
				if (attribs.id === 'grid') {
					// Remove element, do not parse child elements
					item.removeNode = true;
					item.testChildren = false;
				}
			}
		});

		expect(svg.toMinifiedString()).toBe(
			'<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" width="72" height="72"><g id="color"><circle cx="36" cy="36" r="26.68" fill="#fff" fill-rule="evenodd" paint-order="normal"/></g><g id="line"><circle cx="36" cy="36" r="26.68" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="4.74" paint-order="normal"/><path transform="translate(29.2 21.73) scale(4.079)" fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" d="m0 7v-7h2.669c0.963 0 1.744 0.781 1.744 1.744s-0.781 1.743-1.744 1.743h-2.669" clip-rule="evenodd"/></g></svg>'
		);
	});

	test('Async callback', async () => {
		const source = await loadFixture('refresh.svg');
		const svg = new SVG(source);

		let threw = false;
		try {
			parseSVG(svg, () => {
				return new Promise((resolve) => {
					setTimeout(() => {
						resolve(undefined);
					}, 0);
				}) as unknown as void;
			});
		} catch {
			threw = true;
		}
		expect(threw).toBeTruthy();
	});
});
