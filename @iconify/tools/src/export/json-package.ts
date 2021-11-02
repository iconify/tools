import { promises as fs } from 'fs';
import { iconDefaults } from '@iconify/utils/lib/icon';
import type { IconSet } from '../icon-set';
import type { ExportTargetOptions } from './prepare';
import { prepareDirectoryForExport } from './prepare';
import type {
	IconifyChars,
	IconifyInfo,
	IconifyJSON,
	IconifyMetaData,
} from '@iconify/types';

/**
 * Options
 */
export interface ExportJSONPackageOptions extends ExportTargetOptions {
	// package.json contents
	package: Record<string, unknown>;

	// Custom files. Key of filename, value is content
	customFiles?: Record<string, string | Record<string, unknown>>;

	// Log stored files. Default is false
	log?: boolean;
}

interface ExportContents {
	icons: IconifyJSON;
	info?: IconifyInfo;
	metadata?: IconifyMetaData;
	chars?: IconifyChars;
}
type ExportContentsKeys = keyof ExportContents;

const exportTypes: Record<ExportContentsKeys, string> = {
	icons: 'IconifyJSON',
	info: 'IconifyInfo',
	metadata: 'IconifyMetaData',
	chars: 'IconifyChars',
};

const iconsKeys = ['aliases'].concat(
	Object.keys(iconDefaults)
) as (keyof IconifyJSON)[];
const metadataKeys: (keyof IconifyMetaData)[] = [
	'categories',
	'themes',
	'prefixes',
	'suffixes',
];

/**
 * Write file
 */
async function writeJSONFile(filename: string, data: unknown): Promise<void> {
	return fs.writeFile(filename, JSON.stringify(data, null, '\t') + '\n');
}

/**
 * Export icon set as JSON package
 *
 * Used for exporting `@iconify-json/{prefix}` packages
 */
export async function exportJSONPackage(
	iconSet: IconSet,
	options: ExportJSONPackageOptions
): Promise<void> {
	// Normalise and prepare directory
	const dir = await prepareDirectoryForExport(options);

	// Export icon set to IconifyJSON format
	const exportedJSON = iconSet.export(true);

	// Get icons
	const icons: IconifyJSON = {
		prefix: exportedJSON.prefix,
		icons: exportedJSON.icons,
	};
	iconsKeys.forEach((attr) => {
		if (exportedJSON[attr] !== void 0) {
			icons[attr as 'aliases'] = exportedJSON[attr as 'aliases'];
		}
	});

	// Get metadata
	const metadata: IconifyMetaData = {};
	let hasMetadata = false;
	metadataKeys.forEach((attr) => {
		if (exportedJSON[attr]) {
			metadata[attr as 'categories'] = exportedJSON[attr as 'categories'];
			hasMetadata = true;
		}
	});

	// Contents
	const contents: ExportContents = {
		icons,
		info: exportedJSON.info,
		metadata: hasMetadata ? metadata : void 0,
		chars: exportedJSON.chars,
	};

	// Generate package.json
	const packageJSONIconSet: Record<string, string> = {};
	const packageJSONExports: Record<string, string | Record<string, string>> =
		{
			'./*': './*',
			'.': {
				require: './index.js',
				import: './index.mjs',
			},
		};
	const packageJSON = {
		...options.package,
		iconSetVersion: exportedJSON.info?.version,
		main: 'index.js',
		module: 'index.mjs',
		types: 'index.d.ts',
		exports: packageJSONExports,
		iconSet: packageJSONIconSet,
		dependencies: options.package.dependencies || {
			'@iconify/types': '^1.0.10',
		},
	};

	// Save all files, generate exports
	const dtsContent: string[] = [];
	const cjsImports: string[] = [];
	const cjsExports: string[] = [];
	const mjsImports: string[] = [];
	const mjsConsts: string[] = [];
	const mjsExports: string[] = [];

	for (const key in contents) {
		const attr = key as keyof typeof contents;
		const data = contents[attr];
		const type = exportTypes[attr];
		const relativeFile = `./${attr}.json`;

		// Add type
		dtsContent.push(`export declare const ${attr}: ${type};`);

		// Export variable
		cjsExports.push(`exports.${attr} = ${attr};`);
		mjsExports.push(attr);

		if (data !== void 0) {
			// Save JSON file
			await writeJSONFile(`${dir}/${attr}.json`, data);

			// Import data from JSON file
			cjsImports.push(`const ${attr} = require('${relativeFile}');`);
			mjsImports.push(`import ${attr} from '${relativeFile}';`);

			// Add data to package.json
			packageJSONIconSet[attr] = attr + '.json';
			packageJSONExports[relativeFile] = relativeFile;
		} else {
			// Create empty data
			await writeJSONFile(`${dir}/${attr}.json`, {});
			cjsImports.push(`const ${attr} = {};`);
			mjsConsts.push(`const ${attr} = {};`);
		}
	}

	// Generate CJS index file
	const cjsContent = cjsImports.concat([''], cjsExports);
	await fs.writeFile(dir + '/index.js', cjsContent.join('\n') + '\n', 'utf8');

	// Generate MJS index file
	const mjsContent = mjsImports.concat([''], mjsConsts, [
		`export { ${mjsExports.join(', ')} };`,
	]);
	await fs.writeFile(
		dir + '/index.mjs',
		mjsContent.join('\n') + '\n',
		'utf8'
	);

	// Generate types file
	const usedTypes = Object.values(exportTypes);
	const typesData = [
		`import type { ${usedTypes.join(', ')} } from '@iconify/types';`,
		'',
		`export { ${usedTypes.join(', ')} };`,
		'',
	].concat(dtsContent);

	await fs.writeFile(
		dir + '/index.d.ts',
		typesData.join('\n') + '\n',
		'utf8'
	);

	// Write custom files
	const customFiles = options.customFiles || {};
	for (const filename in customFiles) {
		const content = customFiles[filename];
		if (typeof content === 'string') {
			await fs.writeFile(dir + '/' + filename, content, 'utf8');
		} else if (typeof content === 'object') {
			await writeJSONFile(dir + '/' + filename, content);
		}
	}

	// Save package.json
	await writeJSONFile(dir + '/package.json', packageJSON);
}
