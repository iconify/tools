import { promises as fs } from 'fs';
import { blankIconSet, IconSet } from '../icon-set';
import { cleanupIconKeyword } from '../misc/keyword';
import { scanDirectory } from '../misc/scan';
import { SVG } from '../svg';
import { cleanupSVG } from '../svg/cleanup';

/**
 * Entry for file
 */
export interface ImportDirectpryFileEntry {
	// Path to scanned directory, ends with '/'
	path: string;
	// Sub-directory, ends with '/' (can be empty)
	subdir: string;
	// Filename without extension
	file: string;
	// Extension, starts with '.' (can be empty)
	ext: string;
}

/**
 * Callback to get keyword for icon based on file name
 *
 * Returns:
 * - string for new keyword
 * - undefined to skip icon
 *
 * Callback can be asynchronous
 */
type ImportDirectoryKeywordCallbackResult = string | undefined;
export type ImportDirectoryKeywordCallback = (
	file: ImportDirectpryFileEntry,
	defaultKeyword: string,
	iconSet: IconSet
) =>
	| ImportDirectoryKeywordCallbackResult
	| Promise<ImportDirectoryKeywordCallbackResult>;

/**
 * Options
 */
interface ImportDirectoryOptions {
	// Icon set prefix, you can set it later
	prefix?: string;

	// Include files in sub-directories (default: true)
	includeSubDirs?: boolean;

	// Callback to get keyword for icon
	keyword?: ImportDirectoryKeywordCallback;

	// Does not throw error when icon fails to load (default: true)
	ignoreImportErrors?: boolean;
}

/**
 * Import all icons from directory
 */
export async function importDirectory(
	path: string,
	options: ImportDirectoryOptions = {}
): Promise<IconSet> {
	// Find all files
	const files = await scanDirectory(path, (ext, file, subdir, path) => {
		if (ext.toLowerCase() === '.svg') {
			const result: ImportDirectpryFileEntry = {
				file,
				ext,
				subdir,
				path,
			};
			return result;
		}
		return false;
	});

	// Create blank icon set
	const iconSet = blankIconSet(options.prefix || '');

	// Import all files
	for (let i = 0; i < files.length; i++) {
		const file = files[i];

		// Get keyword
		const defaultKeyword = cleanupIconKeyword(file.file);
		let keyword = options.keyword
			? options.keyword(file, defaultKeyword, iconSet)
			: defaultKeyword;
		if (keyword instanceof Promise) {
			keyword = await keyword;
		}

		// Check it
		if (typeof keyword !== 'string' || !keyword.length) {
			continue;
		}

		// Import icon, clean it up
		try {
			const content = await fs.readFile(
				file.path + file.subdir + file.file + file.ext,
				'utf8'
			);
			const svg = new SVG(content);
			await cleanupSVG(svg);

			iconSet.fromSVG(keyword, svg);
		} catch (err) {
			if (options.ignoreImportErrors !== false) {
				throw err;
			}
		}
	}

	return iconSet;
}
