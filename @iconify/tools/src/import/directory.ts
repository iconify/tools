import { promises as fs, readFileSync } from 'fs';
import { blankIconSet, IconSet } from '../icon-set';
import { cleanupIconKeyword } from '../misc/keyword';
import { scanDirectory, scanDirectorySync } from '../misc/scan';
import { SVG } from '../svg';
import { CleanupSVGOptions, cleanupSVG } from '../svg/cleanup';

/**
 * Entry for file
 */
export interface ImportDirectoryFileEntry {
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

type Callback<T> = (
	file: ImportDirectoryFileEntry,
	defaultKeyword: string,
	iconSet: IconSet
) => T;

type AsyncCallback<T> = Callback<T | Promise<T>>;

export type ImportDirectoryKeywordCallback =
	AsyncCallback<ImportDirectoryKeywordCallbackResult>;

export type ImportDirectoryKeywordSyncCallback =
	Callback<ImportDirectoryKeywordCallbackResult>;

/**
 * Options
 */
interface ImportDirectoryOptions<K> extends CleanupSVGOptions {
	// Icon set prefix, you can set it later
	prefix?: string;

	// Include files in sub-directories (default: true)
	includeSubDirs?: boolean;

	// Callback to get keyword for icon
	keyword?: K;

	// Does not throw error when icon fails to load (default: true)
	ignoreImportErrors?: boolean;
}

/**
 * Internal function
 */
type KeywordCallback = (
	params: Parameters<ImportDirectoryKeywordCallback>,
	done: (result: ReturnType<ImportDirectoryKeywordCallback>) => void
) => void;

function importDir(
	iconSet: IconSet,
	options: Omit<ImportDirectoryOptions<unknown>, 'keyword'>,
	getKeyword: KeywordCallback,
	files: ImportDirectoryFileEntry[],
	readFile: (filename: string, callback: (content: string) => void) => void,
	done: (result: IconSet) => void
): void {
	// Import all files
	let i = 0;
	const next = () => {
		if (i >= files.length) {
			// Done
			return done(iconSet);
		}

		const file = files[i];
		i++;

		// Get keyword
		const defaultKeyword = cleanupIconKeyword(file.file);
		getKeyword([file, defaultKeyword, iconSet], (keyword) => {
			// Check it
			if (typeof keyword !== 'string' || !keyword.length) {
				return next();
			}

			// Read file
			readFile(
				file.path + file.subdir + file.file + file.ext,
				(content) => {
					try {
						// Clean it up
						const svg = new SVG(content);
						cleanupSVG(svg, options);
						iconSet.fromSVG(keyword, svg);
					} catch (err) {
						if (options.ignoreImportErrors !== false) {
							throw err;
						}
					}

					next();
				}
			);
		});
	};

	next();
}

function isValidFile(item: ImportDirectoryFileEntry) {
	return item.ext.toLowerCase() === '.svg';
}

/**
 * Import all icons from directory
 */
export function importDirectory(
	path: string,
	options: ImportDirectoryOptions<ImportDirectoryKeywordCallback> = {}
): Promise<IconSet> {
	return new Promise((fulfill, reject) => {
		scanDirectory(
			path,
			(ext, file, subdir, path) => {
				const result: ImportDirectoryFileEntry = {
					file,
					ext,
					subdir,
					path,
				};
				return isValidFile(result) ? result : false;
			},
			options.includeSubDirs !== false
		)
			.then((files) => {
				// Create blank icon set
				const iconSet = blankIconSet(options.prefix || '');

				// Import files
				try {
					importDir(
						iconSet,
						options,
						(params, done) => {
							if (options.keyword) {
								const result = options.keyword(...params);
								if (result instanceof Promise) {
									result.then(done).catch(reject);
								} else {
									done(result);
								}
							} else {
								// Return default keyword
								done(params[1]);
							}
						},
						files,
						(filename, done) => {
							fs.readFile(filename, 'utf8')
								.then(done)
								.catch(reject);
						},
						fulfill
					);
				} catch (err) {
					reject(err);
				}
			})
			.catch(reject);
	});
}

/**
 * Import all icons from directory synchronously
 */
export function importDirectorySync(
	path: string,
	options: ImportDirectoryOptions<ImportDirectoryKeywordSyncCallback> = {}
): IconSet {
	const files = scanDirectorySync(
		path,
		(ext, file, subdir, path) => {
			const result: ImportDirectoryFileEntry = {
				file,
				ext,
				subdir,
				path,
			};
			return isValidFile(result) ? result : false;
		},
		options.includeSubDirs !== false
	);

	// Create blank icon set
	const iconSet = blankIconSet(options.prefix || '');

	let isSync = true;
	importDir(
		iconSet,
		options,
		(params, done) => {
			if (options.keyword) {
				done(options.keyword(...params));
			} else {
				done(params[1]);
			}
		},
		files,
		(filename, done) => {
			done(readFileSync(filename, 'utf8'));
		},
		() => {
			if (!isSync) {
				throw new Error(
					'importDirectorySync supposed to be synchronous'
				);
			}
		}
	);

	isSync = false;
	return iconSet;
}
