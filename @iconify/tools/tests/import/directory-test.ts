import { importDirectory } from '../../lib/import/directory';

// Content of imported icons
const importedSetIcon =
	'<style>.round{rx:5px;fill:green}</style><rect id="me" width="10" height="10"><set attributeName="class" to="round" begin="me.click" dur="2s"/></rect>';
const importedStyleIcon =
	'<circle cx="5" cy="5" r="4" fill="gold" stroke="maroon" stroke-width="2px"/>';

describe('Importing directory', () => {
	test('Simple import', async () => {
		const iconSet = await importDirectory('tests/fixtures/elements/style');
		expect(iconSet.list()).toEqual(['set', 'style']);
		expect(iconSet.lastModified).toBeTruthy();
		expect(iconSet.export()).toEqual({
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
	});

	test('Callback', async () => {
		const iconSet = await importDirectory('tests/fixtures/elements/style', {
			prefix: 'foo',
			keyword: (item) => {
				return 'test-' + item.file;
			},
		});
		expect(iconSet.list()).toEqual(['test-set', 'test-style']);
		expect(iconSet.lastModified).toBeTruthy();
		expect(iconSet.export()).toEqual({
			prefix: 'foo',
			lastModified: iconSet.lastModified,
			icons: {
				'test-set': {
					body: importedSetIcon,
				},
				'test-style': {
					body: importedStyleIcon,
				},
			},
			width: 10,
			height: 10,
		});
	});
});
