import { promises as fs } from 'fs';
import {
	deOptimisePaths,
	downloadGitRepo,
	importDirectory,
	isEmptyColor,
	parseColors,
	runSVGO,
	prepareDirectoryForExport,
	writeJSONFile,
	exportToDirectory,
	exportJSONPackage,
	downloadNPMPackage,
	bumpVersion,
	compareDirectories,
	execAsync,
} from '@iconify/tools';
import type { DownloadNPMPackageResult } from '@iconify/tools/lib/download/npm';
import type { IconifyInfo } from '@iconify/types';

// Cache directory, where downloaded files will be stored
const downloadDir = 'cache';

// Output directory, where converted data will be stored
const outputDir = 'output';

// Repository
const gitRepo = 'git@github.com:Templarian/MaterialDesign.git';
const gitBranch = 'master';

// Directory inside repository where icons are, absolute from repository root
const iconsDir = '/svg';

// Prefix for icon set
const prefix = 'mdi';

// Clean up before export?
const cleanup = true;

// Name of icon set package name, set to null to disable export
const iconSetPackage: string | null = `@iconify-json/${prefix}`;

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
		spdx: 'OFL',
	},
	samples: ['account-check', 'bell-alert-outline', 'calendar-edit'],
	height: 24,
	palette: false,
};

(async () => {
	// Download repository
	const downloadResult = await downloadGitRepo({
		// Where to download
		target: downloadDir,

		// GitHub repository
		remote: gitRepo,
		branch: gitBranch,

		// Do not re-download if latest version has already been downloaded
		// ifModifiedSince: true,

		// Log process
		log: true,
	});

	// If nothing was downloaded, stop
	// 'not_modified' can be returned only if 'ifModifiedSince' option was set
	if (downloadResult === 'not_modified') {
		console.log('Nothing to update');
		return;
	}

	// Import icon set
	const iconSet = await importDirectory(downloadResult.target + iconsDir, {
		prefix,
	});
	console.log('Found', iconSet.count(), 'icons');

	// Add information
	iconSet.info = info;

	// Clean up icons
	await iconSet.forEach(async (name) => {
		const svg = iconSet.toSVG(name);
		if (!svg) {
			return;
		}

		// Set fill to 'currentColor'
		await parseColors(svg, {
			// Change default color to 'currentColor'
			defaultColor: 'currentColor',

			// Callback to parse each color
			callback: (_attr, colorStr, color) => {
				// color === null -> color cannot be parsed -> return colorStr
				// isEmptyColor() -> checks if color is empty: 'none' or 'transparent' -> return color object
				//         without changes (though color string can also be returned, but using object is faster)
				// for everything else return 'currentColor'
				return !color
					? colorStr
					: isEmptyColor(color)
					? color
					: 'currentColor';
			},
		});

		// Optimise
		await runSVGO(svg);

		// Update paths for compatibility with old software
		await deOptimisePaths(svg);

		// Update icon in icon set
		iconSet.fromSVG(name, svg);
	});

	// Clean up output directory and normalize path
	const target = await prepareDirectoryForExport({
		target: outputDir,
		cleanup,
	});

	// Export as IconifyJSON
	const jsonTarget = target + '/' + prefix + '.json';
	console.log('Exporting icon set to', jsonTarget);
	await writeJSONFile(jsonTarget, iconSet.export());

	// Export as SVG
	const svgTarget = target + '/svg';
	console.log('Exporting SVG to', svgTarget);
	await exportToDirectory(iconSet, {
		target: svgTarget,
		autoHeight: true,
	});

	// Export as JSON package
	if (iconSetPackage) {
		let oldPackageDir: string | undefined;
		let nextVersion = '1.0.0';

		// Attempt to import last package to get last version number
		try {
			const importResult = (await downloadNPMPackage({
				target: target + '/json-package.npm',
				package: iconSetPackage,
			})) as DownloadNPMPackageResult;

			// Get version number from last package
			oldPackageDir = importResult.actualDir;
			const lastVersion = JSON.parse(
				await fs.readFile(oldPackageDir + '/package.json', 'utf8')
			).version;
			if (typeof lastVersion === 'string') {
				nextVersion = bumpVersion(lastVersion);
			}
		} catch (err) {
			// Failed, probably package wasn't published. Ignore error.
		}

		// Export
		const jsonPackageTarget = target + '/json-package';
		console.log(
			`Exporting ${iconSetPackage}@${nextVersion} to ${jsonPackageTarget}`
		);
		await exportJSONPackage(iconSet, {
			target: jsonPackageTarget,
			package: {
				name: iconSetPackage,
				version: nextVersion,
				author: info.author.name,
				license: info.license.spdx,
			},
		});

		// Check if package requires update
		const updated =
			oldPackageDir &&
			compareDirectories(oldPackageDir, jsonPackageTarget);
		if (!updated) {
			console.log(`${iconSetPackage} was not updated.`);
		} else {
			console.log(`Publishing ${iconSetPackage}@${nextVersion}`);
			/*
			await execAsync('npm publish --access=public --silent', {
				cwd: jsonPackageTarget,
			});
            */
		}
	}
})();
