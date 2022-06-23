import { defaultIconProps } from '@iconify/utils/lib/icon/defaults';
import { IconSet } from '../../lib/icon-set';
import { findMatchingIcon } from '../../lib/icon-set/match';

describe('Finding matching icons', () => {
	test('Simple match', () => {
		const iconSet = new IconSet({
			prefix: 'foo',
			icons: {
				bar: {
					body: '<g id="bar" />',
				},
				baz: {
					body: '<g id="baz" />',
					width: 20,
					height: 20,
				},
			},
		});

		// No such icon
		expect(
			findMatchingIcon(iconSet, {
				...defaultIconProps,
				body: '<g />',
			})
		).toBeNull();

		// Matchin icons
		expect(
			findMatchingIcon(iconSet, {
				...defaultIconProps,
				body: '<g id="bar" />',
				width: 16,
				height: 16,
			})
		).toBe('bar');
		expect(
			findMatchingIcon(iconSet, {
				...defaultIconProps,
				body: '<g id="baz" />',
				width: 20,
				height: 20,
			})
		).toBe('baz');

		// Bad dimensions
		expect(
			findMatchingIcon(iconSet, {
				...defaultIconProps,
				body: '<g id="baz" />',
			})
		).toBeNull();

		// Unexpected transformations
		expect(
			findMatchingIcon(iconSet, {
				...defaultIconProps,
				body: '<g id="bar" />',
				rotate: 2,
			})
		).toBeNull();
	});

	test('Variation', () => {
		const iconSet = new IconSet({
			prefix: 'foo',
			icons: {
				bar: {
					body: '<g />',
				},
				baz: {
					body: '<g />',
					width: 20,
					height: 20,
				},
			},
			aliases: {
				alias1: {
					parent: 'bar',
					rotate: 1,
				},
				alias2: {
					parent: 'alias1',
					// Double rotation: rotate = 2
					rotate: 1,
				},
				// 2 variations, first one is hidden
				alias3: {
					parent: 'baz',
					hFlip: true,
					hidden: true,
				},
				alias4: {
					parent: 'baz',
					hFlip: true,
				},
				alias5: {
					parent: 'alias3',
					vFlip: true,
				},
				alias6: {
					parent: 'alias4',
					vFlip: true,
				},
				alias7: {
					parent: 'alias3',
					vFlip: true,
				},
				alias8: {
					parent: 'alias7',
					rotate: 1,
				},
			},
		});

		// 'bar' and its aliases
		expect(
			findMatchingIcon(iconSet, {
				...defaultIconProps,
				body: '<g />',
			})
		).toBe('bar');
		expect(
			findMatchingIcon(iconSet, {
				...defaultIconProps,
				body: '<g />',
				rotate: 1,
			})
		).toBe('alias1');
		expect(
			findMatchingIcon(iconSet, {
				...defaultIconProps,
				body: '<g />',
				rotate: 2,
			})
		).toBe('alias2');
		expect(
			findMatchingIcon(iconSet, {
				...defaultIconProps,
				body: '<g />',
				rotate: 3,
			})
		).toBeNull();

		// 'baz' and its aliases
		expect(
			findMatchingIcon(iconSet, {
				...defaultIconProps,
				body: '<g />',
				width: 20,
				height: 20,
			})
		).toBe('baz');

		// Matches both 'alias3' and 'alias4', but first one is hidden
		expect(
			findMatchingIcon(iconSet, {
				...defaultIconProps,
				body: '<g />',
				width: 20,
				height: 20,
				hFlip: true,
			})
		).toBe('alias4');

		// Matches 'alias5', 'alias6' and 'alias7', but first and last icons are hidden
		expect(
			findMatchingIcon(iconSet, {
				...defaultIconProps,
				body: '<g />',
				width: 20,
				height: 20,
				hFlip: true,
				vFlip: true,
			})
		).toBe('alias6');

		// Matches 'alias8'
		expect(
			findMatchingIcon(iconSet, {
				...defaultIconProps,
				body: '<g />',
				width: 20,
				height: 20,
				hFlip: true,
				vFlip: true,
				rotate: 1,
			})
		).toBe('alias8');
	});
});
