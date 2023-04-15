import { promises as fs } from 'fs';
import {
	downloadGitRepo,
	importDirectorySync,
	cleanupSVG,
	parseColorsSync,
	isEmptyColor,
	runSVGO,
} from '@iconify/tools';
import type { IconifyInfo } from '@iconify/types';

// Clone repository?
// Set to false if repository is already unpacked to directory set in 'faRepoDir' variable.
const cloneFromGitHub = true;
const faRepoURL: string | null =
	'git@github.com:FortAwesome/Font-Awesome-Pro.git';
const faRepoBranch = 'master';

// Directory for FontAwesome Pro repository (automatically downloaded if information above is set)
const faRepoDir = 'fa-pro';

// Themes to parse
const themes = ['brands', 'duotone', 'light', 'regular', 'solid'];

// Directory to export icon sets to
const targetDirectory = 'json';

// Information
const baseInfo: IconifyInfo = {
	name: 'Font Awesome',
	author: {
		name: 'Font Awesome',
	},
	license: {
		title: 'Commercial License',
		url: 'https://fontawesome.com/license',
	},
	height: 32,
};

// Base prefix without theme
const basePrefix = 'fa-pro-';

// Do stuff
(async function () {
	// Download repository
	let sourceDir = faRepoDir;
	if (cloneFromGitHub) {
		const downloadResult = await downloadGitRepo({
			target: faRepoDir,
			remote: faRepoURL,
			branch: faRepoBranch,
			log: true,
		});
		sourceDir = downloadResult.contentsDir;
	}

	// Create directory for output if missing
	try {
		await fs.mkdir(targetDirectory, {
			recursive: true,
		});
	} catch (err) {
		//
	}

	// Parse all configured themes
	for (let i = 0; i < themes.length; i++) {
		const theme = themes[i];
		const source = sourceDir + '/svgs/' + theme;
		const prefix = basePrefix + theme;

		// Import icons
		const iconSet = importDirectorySync(source, {
			prefix,
		});

		// Set info
		const info: IconifyInfo = JSON.parse(JSON.stringify(baseInfo));
		const themeName = theme.toUpperCase().slice(0, 1) + theme.slice(1);
		info.name += ' ' + themeName;
		iconSet.info = info;

		// Validate, clean up, fix palette and optimise
		iconSet.forEachSync((name, type) => {
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
				cleanupSVG(svg);

				// Replace color with currentColor, add if missing
				parseColorsSync(svg, {
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
		console.log(`Imported ${iconSet.count()} icons for ${info.name}`);

		// Export to IconifyJSON, convert to string
		const output = JSON.stringify(iconSet.export(), null, '\t');

		// Save to file
		const target = targetDirectory + '/' + prefix + '.json';
		await fs.writeFile(target, output, 'utf8');

		console.log(`Saved ${target} (${output.length} bytes)`);
	}
})().catch((err) => {
	console.error(err);
});
