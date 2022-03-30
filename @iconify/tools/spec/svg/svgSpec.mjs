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

		// Customise before exporting

		// Default customisations: changes height to '1em'
		expect(svg.toMinifiedString({})).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="0.6em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="-8 -16 24 40"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></svg>'
		);

		// Keep original height
		expect(
			svg.toMinifiedString({
				height: 'auto',
			})
		).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="40" preserveAspectRatio="xMidYMid meet" viewBox="-8 -16 24 40"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></svg>'
		);

		// Transform, align, custom size. Transform also changes left/top coordinates to 0
		expect(
			svg.toMinifiedString({
				width: '1em',
				height: '1em',
				hFlip: true,
				vAlign: 'top',
			})
		).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" preserveAspectRatio="xMidYMin meet" viewBox="0 0 24 40"><g transform="translate(16 16) scale(-1 1)"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></g></svg>'
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
