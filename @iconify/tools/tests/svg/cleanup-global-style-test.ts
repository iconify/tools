import { SVG } from '../../src/svg/index.js';
import { cleanupGlobalStyle } from '../../src/optimise/global-style.js';
import { loadFixture } from '../../src/tests/helpers.js';

describe('Removing global style', () => {
	test.only('Simple icon', () => {
		const svg = new SVG(
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><style>.cls-1{fill:#fff;opacity:0;}.cls-2{fill:#231f20;}</style></defs><title>arrow-circle-right</title><g id="Layer_2" data-name="Layer 2"><g id="arrow-circle-right"><g id="arrow-circle-right-2" data-name="arrow-circle-right"><rect class="cls-1" width="24" height="24" transform="translate(0 24) rotate(-90)"/><path class="cls-2" d="M2,12A10,10,0,1,0,12,2,10,10,0,0,0,2,12ZM13.86,8.31l2.86,3a.49.49,0,0,1,.1.15.54.54,0,0,1,.1.16.94.94,0,0,1,0,.76,1,1,0,0,1-.21.33l-3,3a1,1,0,0,1-1.42-1.42L13.59,13H8a1,1,0,0,1,0-2h5.66L12.41,9.69a1,1,0,0,1,1.45-1.38Z"/></g></g></g></svg>`
		);
		cleanupGlobalStyle(svg);

		expect(svg.toMinifiedString()).toBe(
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><defs/><title>arrow-circle-right</title><g id="Layer_2" data-name="Layer 2"><g id="arrow-circle-right"><g id="arrow-circle-right-2" data-name="arrow-circle-right"><rect width="24" height="24" transform="translate(0 24) rotate(-90)" fill="#fff" opacity="0"/><path d="M2,12A10,10,0,1,0,12,2,10,10,0,0,0,2,12ZM13.86,8.31l2.86,3a.49.49,0,0,1,.1.15.54.54,0,0,1,.1.16.94.94,0,0,1,0,.76,1,1,0,0,1-.21.33l-3,3a1,1,0,0,1-1.42-1.42L13.59,13H8a1,1,0,0,1,0-2h5.66L12.41,9.69a1,1,0,0,1,1.45-1.38Z" fill="#231f20"/></g></g></g></svg>`
		);
	});

	test('Animated icon, tag and id matches', () => {
		const svg =
			new SVG(`<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" fill-opacity="0.5">
		<style>
		rect { cursor: pointer }
		#me { fill-opacity: .2 }
		.round { rx: 5px; fill: green; }
		</style>
	
		<rect id="me" width="10" height="10">
		<set attributeName="class" to="round" begin="me.click" dur="2s" />
		</rect>
		<rect width="5" height="5" />
	</svg>`);
		cleanupGlobalStyle(svg);

		expect(svg.toMinifiedString()).toBe(
			'<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" fill-opacity="0.5" width="10" height="10"><style>.round {rx: 5px;fill: green;}</style><rect id="me" width="10" height="10" cursor="pointer" fill-opacity=".2"><set attributeName="class" to="round" begin="me.click" dur="2s"/></rect><rect width="5" height="5" cursor="pointer"/></svg>'
		);
	});

	test('Multiple rules, combining', () => {
		const content = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><style>.cls-1{opacity:0;}.cls-2{fill:#231f20;}</style></defs><rect class="cls-1 cls-2" width="24" height="24"/></svg>`;
		const svg = new SVG(content);
		cleanupGlobalStyle(svg);

		expect(svg.toMinifiedString()).toBe(
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><defs/><rect width="24" height="24" opacity="0" fill="#231f20"/></svg>`
		);
	});

	test('Multiple rules, failing', () => {
		const content = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><defs><style>.cls-1{fill:#fff;opacity:0;}.cls-2{fill:#231f20;}</style></defs><rect class="cls-1 cls-2" width="24" height="24"/></svg>`;
		const svg = new SVG(content);
		cleanupGlobalStyle(svg);

		// Should fail: applying multiple identical rules to same element
		expect(svg.toMinifiedString()).toBe(content);
	});

	test('Multiple selectors', () => {
		const content = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48"><defs><style>.a,.b{fill:none;stroke:#000;stroke-linecap:round}.a{stroke-linejoin:round}.b{stroke-miterlimit:7.4667}</style></defs><path class="a" d="M11.412,27.729v5.8645a1.17,1.17,0,0,0,1.2364,1.2408h.3709"/><line class="a" x1="10.175" y1="29.133" x2="12.772" y2="29.133"/><path class="a" d="M20.648,32.352a2.4728,2.4728,0,1,1-4.9456,0V30.739a2.4728,2.4728,0,1,1,4.9456,0"/><line class="a" x1="20.648" y1="34.834" x2="20.648" y2="28.258"/><path class="a" d="M29.236,34.834V30.7394a2.4728,2.4728,0,1,0-4.9456,0V34.834"/><line class="a" x1="24.29" y1="30.739" x2="24.29" y2="28.258"/><line class="a" x1="7.7734" y1="23.216" x2="12.719" y2="23.216"/><line class="a" x1="7.7734" y1="14.655" x2="10.246" y2="13.29"/><line class="a" x1="10.246" y1="13.29" x2="10.246" y2="23.216"/><path class="a" d="M19.951,18.253a2.4816,2.4816,0,0,0,0-4.9632H18.3437a2.4816,2.4816,0,0,0,0,4.9632h0a2.4816,2.4816,0,0,0,0,4.9632H19.951a2.4816,2.4816,0,0,0,0-4.9632"/><path class="a" d="M24.772,16.516a3.3064,3.3064,0,0,1,3.2147-3.35,3.3365,3.3365,0,0,1,2.3492,5.7076c-1.36,1.1167-5.5639,4.3427-5.5639,4.3427h6.553"/><path class="a" d="M33.674,16.516a3.3064,3.3064,0,0,1,3.2147-3.35,3.3365,3.3365,0,0,1,2.3492,5.7076c-1.36,1.1167-5.5639,4.3427-5.5639,4.3427h6.553"/><circle class="a" cx="24" cy="24" r="21.5"/><path class="b" d="M35.352,29.243v4.9457"/><path class="b" d="M37.825,31.715H32.8793"/></svg>`;
		const svg = new SVG(content);
		cleanupGlobalStyle(svg);

		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48"><defs/><path d="M11.412,27.729v5.8645a1.17,1.17,0,0,0,1.2364,1.2408h.3709" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"/><line x1="10.175" y1="29.133" x2="12.772" y2="29.133" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.648,32.352a2.4728,2.4728,0,1,1-4.9456,0V30.739a2.4728,2.4728,0,1,1,4.9456,0" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"/><line x1="20.648" y1="34.834" x2="20.648" y2="28.258" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"/><path d="M29.236,34.834V30.7394a2.4728,2.4728,0,1,0-4.9456,0V34.834" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"/><line x1="24.29" y1="30.739" x2="24.29" y2="28.258" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"/><line x1="7.7734" y1="23.216" x2="12.719" y2="23.216" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"/><line x1="7.7734" y1="14.655" x2="10.246" y2="13.29" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"/><line x1="10.246" y1="13.29" x2="10.246" y2="23.216" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"/><path d="M19.951,18.253a2.4816,2.4816,0,0,0,0-4.9632H18.3437a2.4816,2.4816,0,0,0,0,4.9632h0a2.4816,2.4816,0,0,0,0,4.9632H19.951a2.4816,2.4816,0,0,0,0-4.9632" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"/><path d="M24.772,16.516a3.3064,3.3064,0,0,1,3.2147-3.35,3.3365,3.3365,0,0,1,2.3492,5.7076c-1.36,1.1167-5.5639,4.3427-5.5639,4.3427h6.553" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"/><path d="M33.674,16.516a3.3064,3.3064,0,0,1,3.2147-3.35,3.3365,3.3365,0,0,1,2.3492,5.7076c-1.36,1.1167-5.5639,4.3427-5.5639,4.3427h6.553" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"/><circle cx="24" cy="24" r="21.5" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"/><path d="M35.352,29.243v4.9457" fill="none" stroke="#000" stroke-linecap="round" stroke-miterlimit="7.4667"/><path d="M37.825,31.715H32.8793" fill="none" stroke="#000" stroke-linecap="round" stroke-miterlimit="7.4667"/></svg>'
		);
	});

	test('Duplicate selectors, different rules', async () => {
		const content = await loadFixture('refresh.svg');
		const svg = new SVG(content);
		cleanupGlobalStyle(svg);

		expect(svg.toMinifiedString()).toBe(
			'<svg id="refresh" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><defs/><path d="M15.518,23.936A8.576,8.576,0,0,0,24,32.606V34.94l-0.944,4.286A15.186,15.186,0,0,1,9,23.936,14.953,14.953,0,0,1,21,9h2l0.048,6.323A8.6,8.6,0,0,0,15.518,23.936Z" fill-rule="evenodd" fill="#0C0058"/><path d="M24,39.275c-0.319,0-.63-0.029-0.944-0.049L24,34.94V32.606a8.672,8.672,0,0,0,0-17.34,8.346,8.346,0,0,0-.949.058L23,13s-0.658-4.4,1-4.4A15.172,15.172,0,0,1,39,23.936,15.172,15.172,0,0,1,24,39.275Z" fill="#FF6E6E" fill-rule="evenodd"/><path d="M26.005,42V28L19,35Z" fill="#FF6E6E" fill-rule="evenodd"/><path d="M21.989,6V19l6.024-6.494Z" fill-rule="evenodd" fill="#0C0058"/></svg>'
		);
	});
});
