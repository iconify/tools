import type { IconifyJSON } from '@iconify/types';
import { IconSet } from '../../lib/icon-set';
import {
	addTagsToIconSet,
	sizeTags,
	paletteTags,
} from '../../lib/icon-set/tags';

describe('Adding tags', () => {
	test('Empty icon set', async () => {
		const iconSetData: IconifyJSON = {
			prefix: 'foo',
			icons: {
				foo: {
					body: '<g />',
					hidden: true,
				},
			},
		};
		const iconSet = new IconSet(iconSetData);

		const tags = await addTagsToIconSet(iconSet);
		expect(tags).toEqual([]);
	});

	test('Square icons with same grid', async () => {
		const iconSetData: IconifyJSON = {
			prefix: 'foo',
			icons: {
				foo: {
					body: '<g />',
				},
				bar: {
					body: '<g />',
				},
				// Hidden icon
				baz: {
					body: '<g />',
					hidden: true,
					width: 24,
					height: 32,
				},
			},
		};
		const iconSet = new IconSet(iconSetData);

		const tags = await addTagsToIconSet(iconSet);
		expect(tags).toEqual([sizeTags.gridPrefix + '16', sizeTags.square]);
	});

	test('Icons with different width', async () => {
		const iconSetData: IconifyJSON = {
			prefix: 'foo',
			icons: {
				foo: {
					body: '<g />',
					width: 24,
					height: 24,
				},
				bar: {
					body: '<g />',
					width: 20,
					height: 24,
				},
			},
		};
		const iconSet = new IconSet(iconSetData);

		const tags = await addTagsToIconSet(iconSet);
		expect(tags).toEqual([sizeTags.heightPrefix + '24']);
	});

	test('Monotone icons, set in info', async () => {
		const iconSetData: IconifyJSON = {
			prefix: 'foo',
			info: {
				name: 'Foo',
				author: {
					name: 'Whatever',
				},
				license: {
					title: 'MIT',
				},
				palette: false,
			},
			icons: {
				foo: {
					body: '<g />',
					width: 16,
					height: 16,
				},
				bar: {
					body: '<g />',
					width: 24,
					height: 32,
				},
			},
		};
		const iconSet = new IconSet(iconSetData);

		const tags = await addTagsToIconSet(iconSet);
		expect(tags).toEqual([paletteTags.monotone]);
	});

	test('Icons with palette, set in info', async () => {
		const iconSetData: IconifyJSON = {
			prefix: 'foo',
			info: {
				name: 'Foo',
				author: {
					name: 'Whatever',
				},
				license: {
					title: 'MIT',
				},
				palette: true,
			},
			icons: {
				foo: {
					body: '<g />',
					width: 16,
					height: 16,
				},
				bar: {
					body: '<g />',
					width: 24,
					height: 32,
				},
			},
		};
		const iconSet = new IconSet(iconSetData);

		const tags = await addTagsToIconSet(iconSet);
		expect(tags).toEqual([paletteTags.palette]);
	});

	test('Icons with palette, detected', async () => {
		const iconSetData: IconifyJSON = {
			prefix: 'foo',
			icons: {
				foo: {
					body: '<g fill="red" />',
					width: 16,
					height: 16,
				},
				bar: {
					body: '<g fill="green" />',
					width: 24,
					height: 32,
				},
			},
		};
		const iconSet = new IconSet(iconSetData);

		const tags = await addTagsToIconSet(iconSet);
		expect(tags).toEqual([paletteTags.palette]);
	});
});
