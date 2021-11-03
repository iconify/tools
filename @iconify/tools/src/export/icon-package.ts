import { promises as fs } from 'fs';
import type { IconSet } from '../icon-set';
import type { ExportTargetOptions } from './prepare';
import { prepareDirectoryForExport } from './prepare';
import { writeJSONFile } from '../misc/write-json';
import { getTypesVersion } from '../misc/types-version';

/**
 * Options
 */
export interface ExportIconPackageOptions extends ExportTargetOptions {
	// package.json contents
	package: Record<string, unknown>;

	// Modules: ESM or CJS. Default is true
	module?: boolean;

	// Custom files. Key of filename, value is content
	customFiles?: Record<string, string | Record<string, unknown>>;

	// Custom .d.ts file content
	typesContent?: string;
}

/**
 * Content for .d.ts files
 */
const defaultTypesContent = `import type { IconifyIcon } from '@iconify/types';
declare const data: IconifyIcon;
export default data;
`;

/**
 * Export icon set as single icon packages
 *
 * Used for exporting `@iconify-icons/{prefix}` packages
 */
export async function exportIconPackage(
	iconSet: IconSet,
	options: ExportIconPackageOptions
): Promise<string[]> {
	const files: Set<string> = new Set();
	const esm = options.module !== false;

	// Normalise and prepare directory
	const dir = await prepareDirectoryForExport(options);

	// Write all icons
	const typesContent = options.typesContent || defaultTypesContent;
	await iconSet.forEach(async (name) => {
		const data = iconSet.resolve(name, false);
		if (!data) {
			return;
		}

		// Store types
		const typesFilename = name + '.d.ts';
		await fs.writeFile(`${dir}/${typesFilename}`, typesContent, 'utf8');
		files.add(typesFilename);

		// Generate content
		let content =
			`const data = ` + JSON.stringify(data, null, '\t') + ';\n';
		if (!esm) {
			// CJS module
			content += 'exports.__esModule = true;\nexports.default = data;\n';
		} else {
			// ES module
			content += 'export default data;\n';
		}
		const contentFilename = name + '.js';
		await fs.writeFile(`${dir}/${contentFilename}`, content, 'utf8');
		files.add(contentFilename);
	});

	// Write custom files
	const customFiles = options.customFiles || {};
	for (const filename in customFiles) {
		const content = customFiles[filename];
		if (typeof content === 'string') {
			await fs.writeFile(dir + '/' + filename, content, 'utf8');
		} else if (typeof content === 'object') {
			await writeJSONFile(dir + '/' + filename, content);
		}
		files.add(filename);
	}

	// Generate package.json
	const info = iconSet.info;
	const { name, description, version, dependencies, ...customPackageProps } =
		options.package;
	const packageJSON = {
		name:
			name ||
			(esm
				? `@iconify-icons/${iconSet.prefix}`
				: `@iconify/icons-${iconSet.prefix}`),
		description:
			description ||
			`Iconify icon components for ${info ? info.name : iconSet.prefix}`,
		version,
		type: esm ? 'module' : void 0,
		iconSetInfo: info,
		...customPackageProps,
		dependencies: dependencies || {
			'@iconify/types': '^' + getTypesVersion(),
		},
	};

	// Save package.json
	await writeJSONFile(dir + '/package.json', packageJSON);
	files.add('package.json');

	// Return list of stored files as array
	return Array.from(files);
}
