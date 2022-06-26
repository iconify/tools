/**
 * This is an advanced example for creating icon bundles for Iconify SVG Framework.
 * It creates a bundle from all SVG files in a directory.
 *
 * This example uses Iconify Tools to import and clean up icons.
 * For Iconify Tools documentation visit https://docs.iconify.design/tools/tools2/
 */
import { promises as fs } from 'fs';
import { dirname } from 'path';

// Installation: npm install --save-dev @iconify/tools
import {
	importDirectory,
	cleanupSVG,
	parseColors,
	isEmptyColor,
	runSVGO,
} from '@iconify/tools';

// File to save bundle to
const target = 'assets/icons-bundle.js';

// SVG files location
const source = 'svg';

// Prefix to use for custom icons
const prefix = 'custom';

// Import icons
(async function () {
	// Import icons
	const iconSet = await importDirectory(source, {
		prefix,
	});

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

		// Clean up and optimise icons
		try {
			// Clean up icon code
			await cleanupSVG(svg);

			// Assume icon is monotone: replace color with currentColor, add if missing
			// If icon is not monotone, remove this code
			await parseColors(svg, {
				defaultColor: 'currentColor',
				callback: (attr, colorStr, color) => {
					return !color || isEmptyColor(color)
						? colorStr
						: 'currentColor';
				},
			});

			// Optimise
			runSVGO(svg);
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

	// Export to JSON
	const json = iconSet.export();

	// Export to bundle
	let output = 'add(' + JSON.stringify(json) + ');\n';

	// Wrap in custom code that checks for Iconify.addCollection and IconifyPreload
	output = `(function() { 
	function add(data) {
		try {
			if (typeof self.Iconify === 'object' && self.Iconify.addCollection) {
				self.Iconify.addCollection(data);
				return;
			}
			if (typeof self.IconifyPreload === 'undefined') {
				self.IconifyPreload = [];
			}
			self.IconifyPreload.push(data);
		} catch (err) {
		}
	}
	${output}
})();\n`;

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
