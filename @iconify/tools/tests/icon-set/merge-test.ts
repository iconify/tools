import type { IconifyJSON } from '@iconify/types';
import { IconSet } from '../../lib/icon-set';
import { mergeIconSets } from '../../lib/icon-set/merge';

describe('Merging icon sets', () => {
	test('Simple merge', () => {
		const merged = mergeIconSets(
			new IconSet({
				prefix: 'foo',
				icons: {
					'chrome-maximize': {
						body: '<g fill="currentColor"><path d="M3 3v10h10V3H3zm9 9H4V4h8v8z"/></g>',
					},
					'chrome-minimize': {
						body: '<g fill="currentColor"><path d="M14 8v1H3V8h11z"/></g>',
					},
				},
				width: 24,
				height: 24,
				// Info should not be copied from old set
				info: {
					name: 'Foo',
					author: {
						name: '',
					},
					license: {
						title: '',
					},
				},
			}),
			new IconSet({
				prefix: 'bar',
				icons: {
					remove: {
						body: '<g fill="currentColor"><path d="M15 8H1V7h14v1z"/></g>',
					},
				},
			})
		);

		const expected: IconifyJSON = {
			prefix: 'bar',
			icons: {
				'remove': {
					body: '<g fill="currentColor"><path d="M15 8H1V7h14v1z"/></g>',
					width: 16,
					height: 16,
				},
				'chrome-maximize': {
					body: '<g fill="currentColor"><path d="M3 3v10h10V3H3zm9 9H4V4h8v8z"/></g>',
					hidden: true,
				},
				'chrome-minimize': {
					body: '<g fill="currentColor"><path d="M14 8v1H3V8h11z"/></g>',
					hidden: true,
				},
			},
			width: 24,
			height: 24,
		};
		expect(merged.export()).toEqual(expected);
		expect(merged.count()).toBe(1);
	});

	test('Swap icon and alias', () => {
		const merged = mergeIconSets(
			new IconSet({
				prefix: 'foo',
				icons: {
					bar: {
						body: '<g />',
					},
				},
				aliases: {
					baz: {
						parent: 'bar',
					},
					// 2 aliases
					foo: {
						parent: 'bar',
					},
					foo2: {
						parent: 'bar',
						rotate: 2,
					},
				},
			}),
			new IconSet({
				prefix: 'bar',
				icons: {
					baz: {
						body: '<g />',
					},
				},
				aliases: {
					bar: {
						parent: 'baz',
					},
				},
			})
		);

		const expected: IconifyJSON = {
			prefix: 'bar',
			icons: {
				baz: {
					body: '<g />',
				},
			},
			aliases: {
				bar: {
					parent: 'baz',
				},
				// Changed parent to new icon, only variation should be hidden
				foo: {
					parent: 'baz',
				},
				foo2: {
					parent: 'baz',
					rotate: 2,
					hidden: true,
				},
			},
		};
		expect(merged.export()).toEqual(expected);
		expect(merged.count()).toBe(1);
	});

	test('Identical icons', () => {
		const merged = mergeIconSets(
			new IconSet({
				prefix: 'foo',
				icons: {
					icon1: {
						body: '<g />',
					},
				},
				aliases: {
					alias1: {
						parent: 'icon1',
					},
				},
			}),
			new IconSet({
				prefix: 'bar',
				icons: {
					icon2: {
						body: '<g />',
					},
				},
				aliases: {
					alias2: {
						parent: 'icon2',
					},
				},
			})
		);

		const expected: IconifyJSON = {
			prefix: 'bar',
			icons: {
				icon2: {
					body: '<g />',
				},
			},
			aliases: {
				alias2: {
					parent: 'icon2',
				},
				// Icons are identical: use as alias
				icon1: {
					parent: 'icon2',
				},
				// Point alias to new icon
				alias1: {
					parent: 'icon2',
				},
			},
		};
		expect(merged.export()).toEqual(expected);
		expect(merged.count()).toBe(1);
	});
});
