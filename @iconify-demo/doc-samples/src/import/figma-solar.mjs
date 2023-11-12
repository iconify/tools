import { writeFileSync } from 'node:fs';
import {
	cleanupIconKeyword,
	convertSVGToMask,
	importFromFigma,
	isEmptyColor,
	parseColorsSync,
	removeFigmaClipPathFromSVG,
	exportToDirectory,
} from '@iconify/tools';

// Figma file ID. Replace it with your clone of Solar icon set
const file = '';

// Figma API token. Replace it with your API token
const token = '';

// Two-tone color
const twoToneColor = '#808080'; // 50% opacity

// Suffixes for themes
/** @type {Record<string, string>} */
const suffixes = {
	'Broken': '-broken',
	'Line Duotone': '-line-duotone',
	'Linear': '-linear',
	'Outline': '-outline',
	'Bold': '-bold',
	'Bold Duotone': '-bold-duotone',
};

(async () => {
	/**
	 * Import icon set from Figma
	 */
	const { iconSet } = await importFromFigma({
		file,
		token,
		cacheDir: 'cache',
		prefix: 'solar',
		depth: 3,
		pages: ['🔥 Icon Library'],
		iconNameForNode: (node) => {
			if (node.type !== 'COMPONENT') {
				return null;
			}

			const parts = node.name.split('/');
			if (parts.length < 3) {
				return null;
			}

			const theme = parts.shift().trim();
			if (!suffixes[theme]) {
				throw new Error(`Unknown theme in name: "${node.name}"`);
			}

			const category = parts.shift().trim();
			const name = parts.shift().trim();
			if (parts.length) {
				throw new Error(`Too many elements in name: "${node.name}"`);
			}

			const keyword = cleanupIconKeyword(name) + suffixes[theme];
			return keyword;
		},
		afterImportingIcon: (node, iconSet) => {
			// Add category
			const parts = node.name.split('/');
			if (parts.length < 3) {
				return;
			}

			const theme = parts.shift().trim();
			if (!suffixes[theme]) {
				throw new Error(`Unknown theme in name: "${node.name}"`);
			}

			const category = parts.shift().trim();
			const name = parts.shift().trim();
			if (parts.length) {
				throw new Error(`Too many elements in name: "${node.name}"`);
			}

			const keyword = cleanupIconKeyword(name) + suffixes[theme];
			iconSet.toggleCategory(keyword, category, true);
		},
	});

	/**
	 * Parse all icons
	 */
	iconSet.forEachSync((name, type) => {
		if (type !== 'icon') {
			return;
		}
		const svg = iconSet.toSVG(name);
		if (!svg) {
			return;
		}
		const backup = svg.toString();

		// Remove clip path
		removeFigmaClipPathFromSVG(svg);

		// Check colors
		let hasWhite = false;
		let hasDuotone = false;
		parseColorsSync(svg, {
			callback: (attr, colorString, color) => {
				if (color && isEmptyColor(color)) {
					return color;
				}
				switch (colorString.toLowerCase()) {
					case '#000':
					case 'black':
					case '#1c274c':
					case '#1c274d':
						return '#000';

					case '#8e93a6':
						hasDuotone = true;
						return twoToneColor;

					case '#fff':
					case 'white':
						hasWhite = true;
						return '#fff';
				}

				// Unknown color
				console.log(backup);
				throw new Error(`Bad color in ${name}: ${colorString}`);
			},
		});

		// Mask icon
		if (hasWhite || hasDuotone) {
			if (
				!convertSVGToMask(svg, {
					color: '#000',
					custom: (color) => {
						switch (color) {
							case twoToneColor:
								return color;
						}
					},
				})
			) {
				console.log(backup);
				throw new Error(`Failed to convert "${name}" to mask`);
			}
		}

		if (svg.toString() !== backup) {
			iconSet.fromSVG(name, svg);
		}
	});

	/**
	 * Export icon set
	 */

	// Export icon set as IconifyJSON
	writeFileSync(
		'solar.json',
		JSON.stringify(iconSet.export(), null, '\t'),
		'utf8'
	);

	// Export icons as SVG
	await exportToDirectory(iconSet, {
		target: 'svg',
	});
})();
