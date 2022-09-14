import type { IconifyJSON } from '@iconify/types';
import { IconSet } from '../../lib/icon-set';
import { detectIconSetPalette } from '../../lib/colors/detect';
import { loadFixture } from '../load';

describe('Detecting palette', () => {
	test('Empty icon set', async () => {
		const iconSetData: IconifyJSON = {
			prefix: 'foo',
			icons: {},
		};
		const iconSet = new IconSet(iconSetData);

		expect(await detectIconSetPalette(iconSet)).toBe(null);
	});

	test('Icons with palette', async () => {
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

		expect(await detectIconSetPalette(iconSet)).toBe(true);
	});

	test('Icons without palette', async () => {
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

		expect(await detectIconSetPalette(iconSet)).toBe(false);
	});

	test('Mixed', async () => {
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

		expect(await detectIconSetPalette(iconSet)).toBe(null);
	});

	test('No colors', async () => {
		const iconSetData: IconifyJSON = {
			prefix: 'foo',
			icons: {
				foo: {
					body: '<g />',
				},
			},
		};
		const iconSet = new IconSet(iconSetData);

		expect(await detectIconSetPalette(iconSet)).toBe(null);
	});

	test('arty-animated.json', async () => {
		const iconSetData = JSON.parse(
			await loadFixture('arty-animated.json')
		) as IconifyJSON;
		const iconSet = new IconSet(iconSetData);

		expect(await detectIconSetPalette(iconSet)).toBe(false);
	});

	test('codicon.json', async () => {
		const iconSetData = JSON.parse(
			await loadFixture('codicon.json')
		) as IconifyJSON;
		const iconSet = new IconSet(iconSetData);

		expect(await detectIconSetPalette(iconSet)).toBe(false);
	});

	test('fluent.json', async () => {
		const iconSetData = JSON.parse(
			await loadFixture('fluent.new.json')
		) as IconifyJSON;
		const iconSet = new IconSet(iconSetData);

		expect(await detectIconSetPalette(iconSet)).toBe(false);
	});
});
