import { SVG } from '../../lib/svg';
import { parseSVGStyle } from '../../lib/svg/parse-style';

describe('Parsing style', () => {
	test('Global style', () => {
		const svg = new SVG(
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><style>.cls-1{fill:#fff;opacity:0;}.cls-2{fill:#231f20;}</style></defs><title>arrow-circle-right</title><g id="Layer_2" data-name="Layer 2"><g id="arrow-circle-right"><g id="arrow-circle-right-2" data-name="arrow-circle-right"><rect class="cls-1" width="24" height="24" transform="translate(0 24) rotate(-90)"/><path class="cls-2" d="M2,12A10,10,0,1,0,12,2,10,10,0,0,0,2,12ZM13.86,8.31l2.86,3a.49.49,0,0,1,.1.15.54.54,0,0,1,.1.16.94.94,0,0,1,0,.76,1,1,0,0,1-.21.33l-3,3a1,1,0,0,1-1.42-1.42L13.59,13H8a1,1,0,0,1,0-2h5.66L12.41,9.69a1,1,0,0,1,1.45-1.38Z"/></g></g></g></svg>`
		);
		parseSVGStyle(svg, (item) => {
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
				}

				case 'opacity': {
					expect(item.value).toBe('0');
					expect(item.selectors).toEqual(['.cls-1']);

					// Change selector token
					const selectorToken = item.selectorTokens[0];
					if (!selectorToken || selectorToken.type !== 'selector') {
						throw new Error('Bad selector token');
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

	test('Animation in global style', () => {
		const source = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
<style>
	.spin-path {
		animation: 0.75s linear infinite rotate;
		transform-origin: center;
	}
	@keyframes rotate {
		from {
			transform: rotate(0deg)
		}
		to {
			transform: rotate(360deg)
		}
	}
</style>
<path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>
<path class="spin-path" d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z" />
</svg>`;
		const svg = new SVG(source);
		parseSVGStyle(svg, (item) => {
			expect(item.type).not.toBe('inline');
			switch (item.type) {
				case 'global': {
					if (
						item.prop === 'animation' &&
						item.value === '0.75s linear infinite rotate'
					) {
						// Change animation duration and name
						return '2s linear infinite spin';
					}

					// Return as is
					return item.value;
				}

				case 'keyframes': {
					expect(item.from).toEqual({
						transform: 'rotate(0deg)',
					});
					expect(item.value).toEqual('rotate');
					return 'spin';
				}

				default:
					throw new Error(`Unexpected type: ${item.type}`);
			}
		});

		expect(svg.toString())
			.toBe(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
<style>
.spin-path {
	animation: 2s linear infinite spin;
	transform-origin: center;
}
@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}
</style>
<path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>
<path class="spin-path" d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"/>
</svg>`);
	});
});
