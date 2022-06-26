import { SVG } from '../../lib/svg';
import { scaleSVG } from '../../lib/optimise/scale';

describe('Scaling icon', () => {
	test('Scale by 20', () => {
		const svg = new SVG(
			'<svg viewBox="0 0 1200 400" xmlns="http://www.w3.org/2000/svg" width="1200" height="400"><path d="M300 200H150A150 150 0 10300 50z"/></svg>'
		);
		scaleSVG(svg, 1 / 20);
		expect(svg.toMinifiedString()).toBe(
			'<svg width="60" height="20" viewBox="0 0 60 20"><path d="M15 10H7.5A7.5 7.5 0 1 0 15 2.5z"/></svg>'
		);
	});
});
