import { SVG } from '@iconify/tools/lib/svg';

describe('Loading SVG', () => {
	it('Simple SVG', () => {
		const svg = new SVG(
			'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="20" viewBox="-8 -16 24 40"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></svg>'
		);
		const expected = {
			left: -8,
			top: -16,
			width: 24,
			height: 40,
		};
		expect(svg.viewBox).toEqual(expected);
		expect(svg.toString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="20" viewBox="-8 -16 24 40"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></svg>'
		);
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="20" viewBox="-8 -16 24 40"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></svg>'
		);
		expect(svg.getBody()).toBe(
			'<path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/>'
		);
	});

	it('Missing dimensions', () => {
		expect(() => {
			new SVG(
				'<svg xmlns="http://www.w3.org/2000/svg"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></svg>'
			);
		}).toThrowError();
	});

	it('Empty document', () => {
		expect(() => {
			new SVG('');
		}).toThrowError();
	});
});
