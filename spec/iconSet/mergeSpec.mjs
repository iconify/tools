import { IconSet } from '@iconify/tools/lib/icon-set';
import { mergeIconSets } from '@iconify/tools/lib/icon-set/merge';

describe('Merging icon sets', () => {
	it('Simple merge', () => {
		const merged = mergeIconSets(
			new IconSet({
				prefix: 'foo',
				icons: {
					bar: {
						body: '<g id="bar" />',
					},
				},
			}),
			new IconSet({
				prefix: 'bar',
				icons: {
					foo: {
						body: '<g id="foo" />',
					},
				},
			})
		);

		const expected = {
			prefix: 'bar',
			icons: {
				foo: {
					body: '<g id="foo" />',
				},
				bar: {
					body: '<g id="bar" />',
					hidden: true,
				},
			},
		};
		expect(merged.export()).toEqual(expected);
	});
});
