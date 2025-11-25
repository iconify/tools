import type { IconifyJSON } from '@iconify/types';
import { IconSet } from '../../src/icon-set/index.js';
import { mergeIconSets } from '../../src/icon-set/merge.js';
import { hasIconDataBeenModified } from '../../src/icon-set/modified.js';
import { loadFixture } from '../../src/tests/helpers.js';

describe('Merging icon sets', () => {
	test('Simple merge', () => {
		const oldSet = new IconSet({
			prefix: 'foo',
			icons: {
				ChromeMaximize: {
					body: '<g fill="currentColor"><path d="M3 3v10h10V3H3zm9 9H4V4h8v8z"/></g>',
				},
				ChromeMinimize: {
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
		});
		const newSet = new IconSet({
			prefix: 'bar',
			icons: {
				remove: {
					body: '<g fill="currentColor"><path d="M15 8H1V7h14v1z"/></g>',
				},
			},
		});

		// Icons are different
		expect(hasIconDataBeenModified(oldSet, newSet)).toBe(true);

		// Merge icon sets
		const merged = mergeIconSets(oldSet, newSet);

		// Merge should have updated lastModified
		const lastModified = merged.lastModified;
		expect(lastModified).toBeTruthy();

		const expected: IconifyJSON = {
			prefix: 'bar',
			lastModified,
			icons: {
				remove: {
					body: '<g fill="currentColor"><path d="M15 8H1V7h14v1z"/></g>',
					width: 16,
					height: 16,
				},
				ChromeMaximize: {
					body: '<g fill="currentColor"><path d="M3 3v10h10V3H3zm9 9H4V4h8v8z"/></g>',
					hidden: true,
				},
				ChromeMinimize: {
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

	test('Simple merge, reversed', () => {
		const newSet = new IconSet({
			prefix: 'foo',
			icons: {
				ChromeMaximize: {
					body: '<g fill="currentColor"><path d="M3 3v10h10V3H3zm9 9H4V4h8v8z"/></g>',
				},
				ChromeMinimize: {
					body: '<g fill="currentColor"><path d="M14 8v1H3V8h11z"/></g>',
				},
			},
			width: 24,
			height: 24,
			// Info should be copied from the new icon set
			info: {
				name: 'Foo',
				author: {
					name: '',
				},
				license: {
					title: '',
				},
				tags: ['Foo'],
			},
		});
		const oldSet = new IconSet({
			prefix: 'bar',
			icons: {
				remove: {
					body: '<g fill="currentColor"><path d="M15 8H1V7h14v1z"/></g>',
				},
			},
		});

		// Icons are different
		expect(hasIconDataBeenModified(oldSet, newSet)).toBe(true);

		// Merge icon sets
		const merged = mergeIconSets(oldSet, newSet);

		// Merge should have updated lastModified
		const lastModified = merged.lastModified;
		expect(lastModified).toBeTruthy();

		const expected: IconifyJSON = {
			prefix: 'foo',
			lastModified,
			info: {
				name: 'Foo',
				author: {
					name: '',
				},
				license: {
					title: '',
				},
				total: 2,
				tags: ['Foo'],
			},
			icons: {
				remove: {
					body: '<g fill="currentColor"><path d="M15 8H1V7h14v1z"/></g>',
					width: 16,
					height: 16,
					hidden: true,
				},
				ChromeMaximize: {
					body: '<g fill="currentColor"><path d="M3 3v10h10V3H3zm9 9H4V4h8v8z"/></g>',
				},
				ChromeMinimize: {
					body: '<g fill="currentColor"><path d="M14 8v1H3V8h11z"/></g>',
				},
			},
			width: 24,
			height: 24,
		};
		expect(merged.export()).toEqual(expected);
		expect(merged.count()).toBe(2);
	});

	test('Swap icon and alias', () => {
		const lastModified1 = 12345;
		const lastModified2 = 23456;

		const set1 = new IconSet({
			prefix: 'foo',
			lastModified: lastModified1,
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
		});
		const set2 = new IconSet({
			prefix: 'bar',
			lastModified: lastModified2,
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
		});

		// Icons are different
		expect(hasIconDataBeenModified(set1, set2)).toBe(true);

		// Merge icon sets: icons should be the same as in old icon set
		// Aliases tree is different, but icon content is identical
		const merged = mergeIconSets(set1, set2);
		expect(hasIconDataBeenModified(set1, merged)).toBe(false);

		// Merge should have copied lastModified from old icon set
		const lastModified = merged.lastModified;
		expect(lastModified).toBeTruthy();
		expect(lastModified).toBe(lastModified1);

		const expected: IconifyJSON = {
			prefix: 'bar',
			lastModified,
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

	test('Identical icons content, different names', () => {
		const lastModified1 = 123456;
		const lastModified2 = 234567;

		const set1 = new IconSet({
			prefix: 'foo',
			lastModified: lastModified1,
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
		});
		const set2 = new IconSet({
			prefix: 'bar',
			lastModified: lastModified2,
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
		});

		// Icons are different
		expect(hasIconDataBeenModified(set1, set2)).toBe(true);

		// Merge icon sets
		const merged = mergeIconSets(set1, set2);

		// Merge should have updated lastModified, which should not be identical to initial value
		const lastModified = merged.lastModified;
		expect(lastModified).toBeTruthy();
		expect(lastModified).not.toBe(lastModified1);
		expect(lastModified).not.toBe(lastModified2);

		const expected: IconifyJSON = {
			prefix: 'bar',
			lastModified,
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

	test('Fluent UI', async () => {
		const oldContent = JSON.parse(
			await loadFixture('fluent.old.json')
		) as IconifyJSON;
		const newContent = JSON.parse(
			await loadFixture('fluent.new.json')
		) as IconifyJSON;

		const oldIconSet = new IconSet(oldContent);
		const newIconSet = new IconSet(newContent);

		// Icons are different
		expect(hasIconDataBeenModified(oldIconSet, newIconSet)).toBe(true);

		// const mergedIconSet = mergeIconSets(oldIconSet, newIconSet);

		const testName = 'accessibility-16-regular';

		// Make sure body exists in both sets and is not identical
		const oldBody = oldContent.icons[testName].body;
		expect(typeof oldBody).toBe('string');

		const newBody = newContent.icons[testName].body;
		expect(typeof newBody).toBe('string');

		expect(oldBody).not.toBe(newBody);

		// Resolve icon. Should not have extra properties
		expect(oldIconSet.resolve(testName)).toEqual({
			body: oldBody,
		});
		expect(newIconSet.resolve(testName)).toEqual({
			body: newBody,
		});
	});

	test('Identical icon sets', () => {
		const lastModified1 = 123456;
		const lastModified2 = 234567;

		const set1 = new IconSet({
			prefix: 'foo',
			lastModified: lastModified1,
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
		});
		const set2 = new IconSet({
			prefix: 'bar',
			lastModified: lastModified2,
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
		});

		// Icons are identical
		expect(hasIconDataBeenModified(set1, set2)).toBe(false);

		// Merge icon sets
		const merged = mergeIconSets(set1, set2);

		// Because icon sets are identical, last modification time should be minimum of values
		const lastModified = merged.lastModified;
		expect(lastModified).toBe(lastModified1);

		const expected: IconifyJSON = {
			prefix: 'bar',
			lastModified,
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
		};
		expect(merged.export()).toEqual(expected);
		expect(merged.count()).toBe(1);
	});

	test('Almost identical icon sets, different order of aliases', () => {
		const lastModified = 234567;

		const set1 = new IconSet({
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
				alias2: {
					parent: 'alias1',
				},
			},
		});
		const set2 = new IconSet({
			prefix: 'bar',
			lastModified,
			icons: {
				icon1: {
					body: '<g />',
				},
			},
			aliases: {
				alias1: {
					parent: 'alias2',
				},
				alias2: {
					parent: 'icon1',
				},
			},
		});

		// Icons are identical
		expect(hasIconDataBeenModified(set1, set2)).toBe(false);

		// Merge icon sets
		const merged = mergeIconSets(set1, set2);

		// Because icon sets are identical, lastModified should have been copied from set that has it
		expect(merged.lastModified).toBe(lastModified);

		const expected: IconifyJSON = {
			prefix: 'bar',
			lastModified,
			icons: {
				icon1: {
					body: '<g />',
				},
			},
			aliases: {
				alias1: {
					parent: 'alias2',
				},
				alias2: {
					parent: 'icon1',
				},
			},
		};
		expect(merged.export()).toEqual(expected);
		expect(merged.count()).toBe(1);
	});

	test('Almost identical icon sets, swap icon and alias', () => {
		const lastModified = 234567;

		const set1 = new IconSet({
			prefix: 'foo',
			lastModified,
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
		});
		const set2 = new IconSet({
			prefix: 'bar',
			icons: {
				alias1: {
					body: '<g />',
				},
			},
			aliases: {
				icon1: {
					parent: 'alias1',
					// Visibility change should not affect result of hasIconDataBeenModified()
					hidden: true,
				},
			},
		});

		// Icons are identical
		expect(hasIconDataBeenModified(set1, set2)).toBe(false);

		// Merge icon sets
		const merged = mergeIconSets(set1, set2);

		// Because icon sets are identical, lastModified should have been copied from set that has it
		expect(merged.lastModified).toBe(lastModified);

		const expected: IconifyJSON = {
			prefix: 'bar',
			lastModified,
			icons: {
				alias1: {
					body: '<g />',
				},
			},
			aliases: {
				icon1: {
					parent: 'alias1',
					hidden: true,
				},
			},
		};
		expect(merged.export()).toEqual(expected);
		expect(merged.count()).toBe(1);
	});
});
