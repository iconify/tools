import { SVG } from '../../lib/svg';
import { convertStyleToAttrs } from '../../lib/svg/cleanup/svgo-style';
import { loadFixture } from '../../lib/tests/load';

describe('Converting style to attributes', () => {
	test('Simple style', () => {
		const svg = new SVG(
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><style>.cls-1{fill:#fff;opacity:0;}.cls-2{fill:#231f20;}</style></defs><title>arrow-circle-right</title><g id="Layer_2" data-name="Layer 2"><g id="arrow-circle-right"><g id="arrow-circle-right-2" data-name="arrow-circle-right"><rect class="cls-1" width="24" height="24" transform="translate(0 24) rotate(-90)"/><path class="cls-2" d="M2,12A10,10,0,1,0,12,2,10,10,0,0,0,2,12ZM13.86,8.31l2.86,3a.49.49,0,0,1,.1.15.54.54,0,0,1,.1.16.94.94,0,0,1,0,.76,1,1,0,0,1-.21.33l-3,3a1,1,0,0,1-1.42-1.42L13.59,13H8a1,1,0,0,1,0-2h5.66L12.41,9.69a1,1,0,0,1,1.45-1.38Z"/></g></g></g></svg>`
		);
		convertStyleToAttrs(svg);
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><title>arrow-circle-right</title><g id="Layer_2" data-name="Layer 2"><g id="arrow-circle-right"><g id="arrow-circle-right-2" data-name="arrow-circle-right"><rect width="24" height="24" transform="translate(0 24) rotate(-90)" fill="#fff" opacity="0"/><path d="M2,12A10,10,0,1,0,12,2,10,10,0,0,0,2,12ZM13.86,8.31l2.86,3a.49.49,0,0,1,.1.15.54.54,0,0,1,.1.16.94.94,0,0,1,0,.76,1,1,0,0,1-.21.33l-3,3a1,1,0,0,1-1.42-1.42L13.59,13H8a1,1,0,0,1,0-2h5.66L12.41,9.69a1,1,0,0,1,1.45-1.38Z" fill="#231f20"/></g></g></g></svg>'
		);
	});

	test('Animated style', () => {
		const svg =
			new SVG(`<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" fill-opacity="0.5">
			<style>
			rect { cursor: pointer }
			.round { rx: 5px; fill: green; }
			</style>
		
			<rect id="me" width="10" height="10">
			<set attributeName="class" to="round" begin="me.click" dur="2s" />
			</rect>
			<rect width="5" height="5" />
		</svg>`);
		convertStyleToAttrs(svg);
		expect(svg.toMinifiedString()).toBe(
			'<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" fill-opacity="0.5" width="10" height="10"><style>.round{rx:5px;fill:green}</style><rect id="me" width="10" height="10"><set attributeName="class" to="round" begin="me.click" dur="2s"/></rect><rect width="5" height="5"/></svg>'
		);
	});

	test('CSS animation', async () => {
		const svg = new SVG(await loadFixture('spin.svg'));
		convertStyleToAttrs(svg);
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><style>@keyframes rotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}</style><path fill="#000" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/><path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z" style="animation:0.75s linear infinite rotate" fill="red" transform-origin="center"/></svg>'
		);
	});
});
