import {
	importDirectory,
	importDirectorySync,
} from '../../lib/import/directory';
import { cleanupIconKeyword } from '../../lib/misc/keyword';

// Content of imported icons
const importedSetIcon =
	'<style>.round{rx:5px;fill:green}</style><rect id="me" width="10" height="10"><set attributeName="class" to="round" begin="me.click" dur="2s"/></rect>';
const importedStyleIcon =
	'<circle cx="5" cy="5" r="4" fill="gold" stroke="maroon" stroke-width="2px"/>';
const importedStyleIconWithTitle = '<title>Circle</title>' + importedStyleIcon;

describe('Importing directory', () => {
	test('Simple import', async () => {
		const iconSet = await importDirectory('tests/fixtures/elements/style');
		expect(iconSet.list()).toEqual(['set', 'style']);
		expect(iconSet.lastModified).toBeTruthy();
		const exported = iconSet.export();
		expect(exported).toEqual({
			prefix: '',
			lastModified: iconSet.lastModified,
			icons: {
				set: {
					body: importedSetIcon,
				},
				style: {
					body: importedStyleIcon,
				},
			},
			width: 10,
			height: 10,
		});

		// Synchronous
		const iconSet2 = importDirectorySync('tests/fixtures/elements/style');
		const exported2 = iconSet2.export();
		exported2.lastModified = exported.lastModified; // could be different
		expect(exported2).toEqual(exported);
	});

	test('Callback, keep title', async () => {
		const iconSet = await importDirectory('tests/fixtures/elements/style', {
			prefix: 'foo',
			keepTitles: true,
			keyword: (item) => {
				// async callback
				return new Promise((fulfill) => {
					setTimeout(() => {
						fulfill(`test-${item.file}`);
					});
				});
			},
		});
		expect(iconSet.list()).toEqual(['test-set', 'test-style']);
		expect(iconSet.lastModified).toBeTruthy();
		const exported = iconSet.export();
		expect(exported).toEqual({
			prefix: 'foo',
			lastModified: iconSet.lastModified,
			icons: {
				'test-set': {
					body: importedSetIcon,
				},
				'test-style': {
					body: importedStyleIconWithTitle,
				},
			},
			width: 10,
			height: 10,
		});

		// Synchronous
		const iconSet2 = importDirectorySync('tests/fixtures/elements/style', {
			prefix: 'foo',
			keepTitles: true,
			keyword: (item) => {
				return `test-${item.file}`;
			},
		});
		const exported2 = iconSet2.export();
		exported2.lastModified = exported.lastModified; // could be different
		expect(exported2).toEqual(exported);
	});

	test('Subdirs', () => {
		// Import with subdirs
		const iconSet1 = importDirectorySync('tests/fixtures/subdirs');
		expect(iconSet1.list()).toEqual(['apps', 'caret-back', 'camera']);

		// Import without subdirs
		const iconSet2 = importDirectorySync('tests/fixtures/subdirs', {
			includeSubDirs: false,
		});
		expect(iconSet2.list()).toEqual([]);

		// Custom keyword
		const iconSet3 = importDirectorySync('tests/fixtures/subdirs', {
			keyword: (item) => cleanupIconKeyword(item.subdir + item.file),
		});
		expect(iconSet3.list()).toEqual([
			'outline-apps',
			'outline-caret-back',
			'regular-apps',
			'regular-camera',
		]);
	});
});
