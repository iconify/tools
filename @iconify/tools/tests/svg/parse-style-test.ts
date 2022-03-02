import { SVG } from '../../lib/svg';
import { parseSVGStyle } from '../../lib/svg/parse-style';

describe('Parsing style', () => {
	test('Global style', async () => {
		const svg = new SVG(
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><style>.cls-1{fill:#fff;opacity:0;}.cls-2{fill:#231f20;}</style></defs><title>arrow-circle-right</title><g id="Layer_2" data-name="Layer 2"><g id="arrow-circle-right"><g id="arrow-circle-right-2" data-name="arrow-circle-right"><rect class="cls-1" width="24" height="24" transform="translate(0 24) rotate(-90)"/><path class="cls-2" d="M2,12A10,10,0,1,0,12,2,10,10,0,0,0,2,12ZM13.86,8.31l2.86,3a.49.49,0,0,1,.1.15.54.54,0,0,1,.1.16.94.94,0,0,1,0,.76,1,1,0,0,1-.21.33l-3,3a1,1,0,0,1-1.42-1.42L13.59,13H8a1,1,0,0,1,0-2h5.66L12.41,9.69a1,1,0,0,1,1.45-1.38Z"/></g></g></g></svg>`
		);
		await parseSVGStyle(svg, (item) => {
			expect(item.type).toBe('global');
			if (item.type !== 'global') {
				return;
			}

			switch (item.prop) {
				case 'fill': {
					const selectors = item.selectors.join(' ');
					switch (selectors) {
						case '.cls-1':
							expect(item.value).toBe('#fff');
							// Change color
							return 'black';

						case '.cls-2':
							expect(item.value).toBe('#231f20');
							// Remove token
							return;

						default:
							throw new Error(
								`Unexpected selectors: "${selectors}"`
							);
					}
					break;
				}

				case 'opacity': {
					expect(item.value).toBe('0');
					expect(item.selectors).toEqual(['.cls-1']);

					// Change selector token
					const selectorToken = item.selectorTokens[0];
					if (!selectorToken || selectorToken.type !== 'selector') {
						throw new Error(`Bad selector token`);
					}
					selectorToken.selectors = ['.whatever'];

					// Change token
					item.token.prop = 'fill-opacity';
					break;
				}

				default:
					throw new Error(`Unexpected property: "${item.prop}"`);
			}
			return item.value;
		});

		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><defs><style>.whatever {fill: black;fill-opacity: 0;}</style></defs><title>arrow-circle-right</title><g id="Layer_2" data-name="Layer 2"><g id="arrow-circle-right"><g id="arrow-circle-right-2" data-name="arrow-circle-right"><rect class="cls-1" width="24" height="24" transform="translate(0 24) rotate(-90)"/><path class="cls-2" d="M2,12A10,10,0,1,0,12,2,10,10,0,0,0,2,12ZM13.86,8.31l2.86,3a.49.49,0,0,1,.1.15.54.54,0,0,1,.1.16.94.94,0,0,1,0,.76,1,1,0,0,1-.21.33l-3,3a1,1,0,0,1-1.42-1.42L13.59,13H8a1,1,0,0,1,0-2h5.66L12.41,9.69a1,1,0,0,1,1.45-1.38Z"/></g></g></g></svg>'
		);
	});
});
