import { SVG } from '../../src/svg/index.js';
import { blankIconSet } from '../../src/icon-set/index.js';
import { checkBadTags } from '../../src/svg/cleanup/bad-tags.js';
import { loadFixture } from '../../src/tests/helpers.js';

const goodExamples: string[] = [
	'animate.svg',
	'animateMotion.svg',
	'animateTransform.svg',
	'clipPath.svg',
	'clipPath2.svg',
	'defs.svg',
	'desc.svg',
	'feColorMatrix.svg',
	'inline-style/feComponentTransfer.svg',
	'feDiffuseLighting.svg',
	'inline-style/feDisplacementMap.svg',
	'inline-style/feFlood.svg',
	'feGaussianBlur.svg',
	'inline-style/feMerge.svg',
	'feOffset.svg',
	'inline-style/feSpecularLighting.svg',
	'inline-style/feTurbulence.svg',
	'linearGradient.svg',
	'marker.svg',
	'mask.svg',
	'mpath.svg',
	'pattern.svg',
	'style/set.svg',
	'stop.svg',
	'style/style.svg',
	'symbol.svg',
	'use.svg',
];

const badExamples: Record<string, string> = {
	'bad/feBlend.svg': 'image',
	'bad/feConvolveMatrix.svg': 'image',
	'bad/fePointLight.svg': 'image',
	'bad/feSpotLight.svg': 'image',
	'bad/feTile.svg': 'image',
	'bad/a.svg': 'a',
	'bad/foreignObject.svg': 'foreignObject',
	'bad/script.svg': 'script',
	'bad/svg.svg': 'svg',
};

// Icons that contain attributes on <svg> element and should throw exception when attempting to add to icon set
const throwToSVG: Set<string> = new Set(['bad/svg.svg']);

describe('Checking tags tree', () => {
	goodExamples.forEach((name) => {
		test(name, async () => {
			const content = await loadFixture(`elements/${name}`);
			const svg = new SVG(content);
			checkBadTags(svg);
		});
	});

	// Bad elements
	Object.keys(badExamples).forEach((name) => {
		test(name, async () => {
			const content = await loadFixture(`elements/${name}`);
			const svg = new SVG(content);
			try {
				checkBadTags(svg);
			} catch (err) {
				const error = err as Error;
				expect(error.message).toBe(
					`Unexpected element: <${badExamples[name]}>`
				);
				return;
			}
			throw new Error(`Expected exception in ${name}`);
		});
	});

	// Run same test using icon set's forEach function
	test('forEach', async () => {
		// Load all icons
		const iconSet = blankIconSet('');
		const toTest: Set<string> = new Set();
		const names = Object.keys(badExamples);
		for (let i = 0; i < names.length; i++) {
			const name = names[i];
			const content = await loadFixture(`elements/${name}`);
			const svg = new SVG(content);

			try {
				iconSet.fromSVG(name, svg);
				toTest.add(name);

				if (throwToSVG.has(name)) {
					throw new Error(`Expected exception when loading ${name}`);
				}
			} catch (err) {
				if (!throwToSVG.has(name)) {
					console.error(err);
					throw new Error(`Unexpected exception in ${name}`);
				}
			}
		}

		// Run test
		iconSet.forEachSync((name, type) => {
			expect(type).toBe('icon');
			toTest.delete(name);

			const svg = iconSet.toSVG(name) as SVG;
			expect(svg).not.toBeNull();

			try {
				checkBadTags(svg);
			} catch (err) {
				const error = err as Error;
				expect(error.message).toBe(
					`Unexpected element: <${badExamples[name]}>`
				);
				return;
			}
			throw new Error(`Expected exception in ${name}`);
		});

		expect(toTest.size).toBe(0);
	});
});
