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
});
