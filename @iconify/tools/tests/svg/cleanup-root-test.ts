import { SVG } from '../../lib/svg';
import { cleanupSVGRoot } from '../../lib/svg/cleanup/root-svg';

describe('Cleaning up SVG root element', () => {
	test('Moving fill to content', () => {
		const svg = new SVG(
			'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="20" viewBox="-8 -16 24 40" fill="red"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></svg>'
		);
		cleanupSVGRoot(svg);
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="20" viewBox="-8 -16 24 40"><g fill="red"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></g></svg>'
		);
	});

	test('With style', () => {
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
		cleanupSVGRoot(svg);
		expect(svg.toMinifiedString()).toBe(
			'<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" width="10" height="10"><style>rect { cursor: pointer }.round { rx: 5px; fill: green; }</style><g fill-opacity="0.5"><rect id="me" width="10" height="10"><set attributeName="class" to="round" begin="me.click" dur="2s"/></rect><rect width="5" height="5"/></g></svg>'
		);
	});

	test('Style with keyframes', () => {
		const svg =
			new SVG(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
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
		</svg>`);
		cleanupSVGRoot(svg);
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><style>.spin-path {animation: 0.75s linear infinite rotate;transform-origin: center;}@keyframes rotate {from {transform: rotate(0deg) }to {transform: rotate(360deg) }}</style><path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/><path class="spin-path" d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"/></svg>'
		);
	});
});
