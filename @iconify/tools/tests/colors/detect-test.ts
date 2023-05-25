import type { IconifyJSON } from '@iconify/types';
import { IconSet } from '../../lib/icon-set';
import { detectIconSetPalette } from '../../lib/colors/detect';
import { loadFixture } from '../../lib/tests/helpers';

describe('Detecting palette', () => {
	test('Empty icon set', () => {
		const iconSetData: IconifyJSON = {
			prefix: 'foo',
			icons: {},
		};
		const iconSet = new IconSet(iconSetData);

		expect(detectIconSetPalette(iconSet)).toBe(null);
	});

	test('Icons with palette', () => {
		const iconSetData: IconifyJSON = {
			prefix: 'foo',
			icons: {
				foo: {
					body: '<g fill="red" />',
				},
				bar: {
					body: '<g fill="green" />',
				},
			},
		};
		const iconSet = new IconSet(iconSetData);

		expect(detectIconSetPalette(iconSet)).toBe(true);
	});

	test('Icons without palette', () => {
		const iconSetData: IconifyJSON = {
			prefix: 'foo',
			icons: {
				foo: {
					body: '<g fill="currentColor" />',
				},
				bar: {
					// lower case
					body: '<g fill="currentcolor" />',
				},
			},
		};
		const iconSet = new IconSet(iconSetData);

		expect(detectIconSetPalette(iconSet)).toBe(false);
	});

	test('Mixed', () => {
		const iconSetData: IconifyJSON = {
			prefix: 'foo',
			icons: {
				foo: {
					body: '<g fill="red" />',
				},
				bar: {
					body: '<g fill="currentColor" />',
				},
			},
		};
		const iconSet = new IconSet(iconSetData);

		expect(detectIconSetPalette(iconSet)).toBe(null);
	});

	test('No colors', () => {
		const iconSetData: IconifyJSON = {
			prefix: 'foo',
			icons: {
				foo: {
					body: '<g />',
				},
			},
		};
		const iconSet = new IconSet(iconSetData);

		expect(detectIconSetPalette(iconSet)).toBe(null);
	});

	test('arty-animated.json', async () => {
		const iconSetData = JSON.parse(
			await loadFixture('arty-animated.json')
		) as IconifyJSON;
		const iconSet = new IconSet(iconSetData);

		expect(detectIconSetPalette(iconSet)).toBe(false);
	});

	test('codicon.json', async () => {
		const iconSetData = JSON.parse(
			await loadFixture('codicon.json')
		) as IconifyJSON;
		const iconSet = new IconSet(iconSetData);

		expect(detectIconSetPalette(iconSet)).toBe(false);
	});

	test('fluent.json', async () => {
		const iconSetData = JSON.parse(
			await loadFixture('fluent.new.json')
		) as IconifyJSON;
		const iconSet = new IconSet(iconSetData);

		expect(detectIconSetPalette(iconSet)).toBe(false);
	});
});
