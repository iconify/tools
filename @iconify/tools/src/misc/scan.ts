import { promises as fs } from 'fs';

/**
 * Callback
 *
 * Extension starts with '.' (can be empty)
 * File does not include extension
 * Subdir ends with '/' (can be empty)
 *
 * Should return:
 * - false, null or undefined to skip file
 * - true to include file (subdir + file + extension)
 * - string to include custom string (such as file without extension)
 * - custom object to return custom object
 */
type ScanDirectoryCallbackFalseResult = boolean | null | undefined;
type ScanDirectoryCallbackStringResult =
	| ScanDirectoryCallbackFalseResult
	| string;
type ScanDirectoryCallbackAsString = (
	ext: string,
	file: string,
	subdir: string,
	path: string
) =>
	| ScanDirectoryCallbackStringResult
	| Promise<ScanDirectoryCallbackStringResult>;
type ScanDirectoryCallbackAsCustom<T> = (
	ext: string,
	file: string,
	subdir: string,
	path: string
) =>
	| T
	| ScanDirectoryCallbackFalseResult
	| Promise<T | ScanDirectoryCallbackFalseResult>;

export type ScanDirectoryCallback =
	| ScanDirectoryCallbackAsCustom<unknown>
	| ScanDirectoryCallbackAsString;

/**
 * Find all files in directory
 */
export async function scanDirectory(
	path: string,
	callback?: ScanDirectoryCallbackAsString,
	subdirs?: boolean
): Promise<string[]>;
export async function scanDirectory<T>(
	path: string,
	callback: ScanDirectoryCallbackAsCustom<T>,
	subdirs?: boolean
): Promise<T[]>;
export async function scanDirectory(
	path: string,
	callback?: ScanDirectoryCallback,
	subdirs = true
): Promise<unknown[]> {
	const results: unknown[] = [];
	if (path.length && path.slice(-1) !== '/') {
		path += '/';
	}

	async function scan(subdir: string): Promise<void> {
		const files = await fs.readdir(path + subdir);
		for (let i = 0; i < files.length; i++) {
			const filename = files[i];
			if (filename.slice(0, 1) === '.') {
				// Exclude hidden items
				continue;
			}

			const stat = await fs.lstat(path + subdir + filename);
			if (stat.isDirectory()) {
				if (subdirs) {
					await scan(subdir + filename + '/');
				}
				continue;
			}

			if (!stat.isFile()) {
				continue;
			}

			const parts = filename.split('.');
			const ext = parts.length > 1 ? '.' + parts.pop() : '';
			const file = parts.join('.');

			// Callback
			let callbackResult;
			if (callback) {
				callbackResult = callback(ext, file, subdir, path);
				if (callbackResult instanceof Promise) {
					callbackResult = await callbackResult;
				}

				if (
					callbackResult === void 0 ||
					callbackResult === false ||
					callbackResult === null
				) {
					// Skip file
					continue;
				}
			} else {
				callbackResult = true;
			}

			// Add item
			results.push(
				callbackResult === true ? subdir + filename : callbackResult
			);
		}
	}

	await scan('');
	return results;
}
