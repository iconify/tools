import { IconSet } from '@iconify/tools/lib/icon-set';

describe('Checking themes', () => {
	it('Suffixes', () => {
		const iconSetData = {
			prefix: 'foo',
			icons: {},
			suffixes: {
				'line': 'Line',
				'bold': 'Bold',
				'': 'Regular',
			},
		};
		const iconSet = new IconSet(iconSetData);

		// Add bunch of icons
		const allNames = [];
		const shortNames = ['alarm', 'home', 'app'];
		shortNames.forEach((name) => {
			['-line', '-bold', ''].forEach((suffix) => {
				const fullName = name + suffix;
				iconSet.setIcon(fullName, {
					body: `<g id="${fullName}" />`,
				});
				allNames.push(fullName);
			});
		});

		// Count icons
		expect(iconSet.count()).toBe(9);

		// Test prefixes
		expect(iconSet.checkTheme(true)).toEqual({
			valid: {},
			invalid: allNames,
		});

		// Test suffixes
		expect(iconSet.checkTheme(false)).toEqual({
			valid: {
				'bold': shortNames.map((name) => name + '-bold'),
				'line': shortNames.map((name) => name + '-line'),
				'': shortNames,
			},
			invalid: [],
		});

		// Export data and check themes
		const exported = iconSet.export();
		expect(exported.prefixes).toBeUndefined();
		expect(exported.suffixes).toEqual({
			'line': 'Line',
			'bold': 'Bold',
			'': 'Regular',
		});
	});

	it('Prefixes, items without theme', () => {
		const iconSetData = {
			prefix: 'foo',
			icons: {},
			prefixes: {
				line: 'Line',
				bold: 'Bold',
				solid: 'Solid',
			},
		};
		const iconSet = new IconSet(iconSetData);

		// Add bunch of icons
		const allNames = [];
		const shortNames = ['alarm', 'home', 'app'];
		shortNames.forEach((name) => {
			['line-', 'bold-', 'twotone-', ''].forEach((prefix) => {
				const fullName = prefix + name;
				iconSet.setIcon(fullName, {
					body: `<g id="${fullName}" />`,
				});
				allNames.push(fullName);
			});
		});

		// Count icons
		expect(iconSet.count()).toBe(12);

		// Test prefixes
		const invalid = [];
		shortNames.forEach((name) => {
			invalid.push('twotone-' + name);
			invalid.push(name);
		});
		expect(iconSet.checkTheme(true)).toEqual({
			valid: {
				bold: shortNames.map((name) => 'bold-' + name),
				line: shortNames.map((name) => 'line-' + name),
				solid: [],
			},
			invalid,
		});

		// Test suffixes
		expect(iconSet.checkTheme(false)).toEqual({
			valid: {},
			invalid: allNames,
		});

		// Export data and check themes
		const exported = iconSet.export();
		expect(exported.suffixes).toBeUndefined();
		expect(exported.prefixes).toEqual({
			line: 'Line',
			bold: 'Bold',
			// 'solid' should be missing because it does not have matching icons
		});
	});

	it('Partial prefixes, legacy themes', () => {
		const iconSetData = {
			prefix: 'foo',
			icons: {},
			themes: {
				test1: {
					title: '24 Outline',
					prefix: '24-outline-',
				},
				test2: {
					title: '24',
					prefix: '24-',
				},
				test3: {
					title: '24 Solid',
					prefix: '24-solid-',
				},
				invalid: {
					title: '24 TwoTone',
					prefix: '24-twotone', // Missing '-'
				},
			},
		};
		const iconSet = new IconSet(iconSetData);

		// Add bunch of icons
		const allNames = [];
		const shortNames = ['alarm', 'home', 'app'];
		shortNames.forEach((name) => {
			['24-outline-', '24-twotone-', '24-', '20-'].forEach((prefix) => {
				const fullName = prefix + name;
				iconSet.setIcon(fullName, {
					body: `<g id="${fullName}" />`,
				});
				allNames.push(fullName);
			});
		});

		// Count icons
		expect(iconSet.count()).toBe(12);

		// Test suffixes
		expect(iconSet.checkTheme(false)).toEqual({
			valid: {},
			invalid: allNames,
		});

		// Test prefixes
		const other24 = [];
		shortNames.forEach((name) => {
			other24.push('24-twotone-' + name);
			other24.push('24-' + name);
		});
		expect(iconSet.checkTheme(true)).toEqual({
			valid: {
				'24-outline': shortNames.map((name) => '24-outline-' + name),
				'24-solid': [],
				'24': other24,
			},
			invalid: shortNames.map((name) => '20-' + name),
		});

		// Export data and check themes
		const exported = iconSet.export();
		expect(exported.suffixes).toBeUndefined();
		expect(exported.prefixes).toEqual({
			'24-outline': '24 Outline',
			'24': '24',
		});
	});
});
