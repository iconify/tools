import { SVG } from '../../lib/svg';
import { cleanupGlobalStyle } from '../../lib/optimise/global-style';

describe('Removing global style', () => {
	test('Simple icon', async () => {
		const svg = new SVG(
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><style>.cls-1{fill:#fff;opacity:0;}.cls-2{fill:#231f20;}</style></defs><title>arrow-circle-right</title><g id="Layer_2" data-name="Layer 2"><g id="arrow-circle-right"><g id="arrow-circle-right-2" data-name="arrow-circle-right"><rect class="cls-1" width="24" height="24" transform="translate(0 24) rotate(-90)"/><path class="cls-2" d="M2,12A10,10,0,1,0,12,2,10,10,0,0,0,2,12ZM13.86,8.31l2.86,3a.49.49,0,0,1,.1.15.54.54,0,0,1,.1.16.94.94,0,0,1,0,.76,1,1,0,0,1-.21.33l-3,3a1,1,0,0,1-1.42-1.42L13.59,13H8a1,1,0,0,1,0-2h5.66L12.41,9.69a1,1,0,0,1,1.45-1.38Z"/></g></g></g></svg>`
		);
		await cleanupGlobalStyle(svg);

		expect(svg.toMinifiedString()).toBe(
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><defs/><title>arrow-circle-right</title><g id="Layer_2" data-name="Layer 2"><g id="arrow-circle-right"><g id="arrow-circle-right-2" data-name="arrow-circle-right"><rect width="24" height="24" transform="translate(0 24) rotate(-90)" fill="#fff" opacity="0"/><path d="M2,12A10,10,0,1,0,12,2,10,10,0,0,0,2,12ZM13.86,8.31l2.86,3a.49.49,0,0,1,.1.15.54.54,0,0,1,.1.16.94.94,0,0,1,0,.76,1,1,0,0,1-.21.33l-3,3a1,1,0,0,1-1.42-1.42L13.59,13H8a1,1,0,0,1,0-2h5.66L12.41,9.69a1,1,0,0,1,1.45-1.38Z" fill="#231f20"/></g></g></g></svg>`
		);
	});

	test('Animated icon, tag and id matches', async () => {
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
		await cleanupGlobalStyle(svg);

		expect(svg.toMinifiedString()).toBe(
			'<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" fill-opacity="0.5" width="10" height="10"><style>.round {rx: 5px;fill: green;}</style><rect id="me" width="10" height="10" cursor="pointer" fill-opacity=".2"><set attributeName="class" to="round" begin="me.click" dur="2s"/></rect><rect width="5" height="5" cursor="pointer"/></svg>'
		);
	});

	test('Multiple rules, combining', async () => {
		const content = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><style>.cls-1{opacity:0;}.cls-2{fill:#231f20;}</style></defs><rect class="cls-1 cls-2" width="24" height="24"/></svg>`;
		const svg = new SVG(content);
		await cleanupGlobalStyle(svg);

		expect(svg.toMinifiedString()).toBe(
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><defs/><rect width="24" height="24" opacity="0" fill="#231f20"/></svg>`
		);
	});

	test('Multiple rules, failing', async () => {
		const content = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><defs><style>.cls-1{fill:#fff;opacity:0;}.cls-2{fill:#231f20;}</style></defs><rect class="cls-1 cls-2" width="24" height="24"/></svg>`;
		const svg = new SVG(content);
		await cleanupGlobalStyle(svg);

		// Should fail: applying multiple identical rules to same element
		expect(svg.toMinifiedString()).toBe(content);
	});
});
