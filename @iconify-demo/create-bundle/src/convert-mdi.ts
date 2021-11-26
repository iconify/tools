import { promises as fs } from 'fs';
import { dirname } from 'path';

// Installation: npm install --save-dev @iconify/tools @mdi/svg
import {
	importDirectory,
	cleanupSVG,
	parseColors,
	isEmptyColor,
	runSVGO,
	cleanupIconKeyword,
} from '@iconify/tools';
import type { IconifyInfo } from '@iconify/types';

// File to save icon set to
const target = 'json/mdi.json';

// SVG files location
const sourcePackageJSON = require.resolve('@mdi/svg/package.json');
const sourceSVGDir = dirname(sourcePackageJSON) + '/svg';

// Metadata (specific to MDI example, remove this for your code)
const metadataSource: string | null = require.resolve('@mdi/svg/meta.json');

// Prefix to use for icon set
const prefix = 'mdi';

// Expected icon size. Used in validating icons, remove if you do not need to validate icons
const expectedSize = 24;

// Icon set information
const info: IconifyInfo = {
	name: 'Material Design Icons',
	author: {
		name: 'Austin Andrews',
		url: 'https://github.com/Templarian/MaterialDesign',
	},
	license: {
		title: 'Open Font License',
		url: 'https://raw.githubusercontent.com/Templarian/MaterialDesign/master/LICENSE',
		spdx: 'OFL-1.1',
	},
	height: 24,
	samples: ['account-check', 'bell-alert-outline', 'calendar-edit'],
};

// Import icons
(async function () {
	// Import icons
	const iconSet = await importDirectory(sourceSVGDir, {
		prefix,
	});

	// Set info
	iconSet.info = info;

	// Validate, clean up, fix palette and optimise
	await iconSet.forEach(async (name, type) => {
		if (type !== 'icon') {
			return;
		}

		// Get SVG instance for parsing
		const svg = iconSet.toSVG(name);
		if (!svg) {
			// Invalid icon
			iconSet.remove(name);
			return;
		}

		// Check icon size
		const viewBox = svg.viewBox;
		if (viewBox.width !== expectedSize || viewBox.height !== expectedSize) {
			console.error(
				`Icon ${name} has invalid dimensions: ${viewBox.width} x ${viewBox.height}`
			);
			iconSet.remove(name);
			return;
		}

		// Clean up and optimise icons
		try {
			// Clean up icon code
			await cleanupSVG(svg);

			// Replace color with currentColor, add if missing
			await parseColors(svg, {
				defaultColor: 'currentColor',
				callback: (attr, colorStr, color) => {
					return !color || isEmptyColor(color)
						? colorStr
						: 'currentColor';
				},
			});

			// Optimise
			await runSVGO(svg);
		} catch (err) {
			// Invalid icon
			console.error(`Error parsing ${name}:`, err);
			iconSet.remove(name);
			return;
		}

		// Update icon from SVG instance
		iconSet.fromSVG(name, svg);
	});
	console.log(`Imported ${iconSet.count()} icons`);

	// Add metadata from meta.json
	if (metadataSource) {
		interface MDIMetaDataItem {
			id: string;
			name: string;
			codepoint: string;
			aliases: string[];
			tags: string[];
			author: string;
			version: string;
		}

		const metaContent = JSON.parse(
			await fs.readFile(metadataSource, 'utf8')
		) as MDIMetaDataItem[];
		metaContent.forEach((entry) => {
			const { name, aliases, tags } = entry;
			const cleanName = cleanupIconKeyword(name);
			if (iconSet.entries[cleanName] === void 0) {
				console.error(`Missing icon: ${cleanName}`);
				return;
			}

			// Add categories
			tags.forEach((category) => {
				iconSet.toggleCategory(cleanName, category, true);
			});

			// Add aliases
			aliases.forEach((alias) => {
				const cleanAlias = cleanupIconKeyword(alias);
				if (iconSet.entries[cleanAlias] === void 0) {
					iconSet.setAlias(cleanAlias, cleanName);
				}
			});
		});
	}

	// Export to IconifyJSON, convert to string
	const output = JSON.stringify(iconSet.export(), null, '\t');

	// Create directory for output if missing
	const dir = dirname(target);
	try {
		await fs.mkdir(dir, {
			recursive: true,
		});
	} catch (err) {
		//
	}

	// Save to file
	await fs.writeFile(target, output, 'utf8');

	console.log(`Saved ${target} (${output.length} bytes)`);
})().catch((err) => {
	console.error(err);
});
