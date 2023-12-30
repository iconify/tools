import { promises as fs, readdirSync, statSync } from 'fs';
import type { Stats } from 'fs';

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

type Callback<T> = (
	ext: string,
	file: string,
	subdir: string,
	path: string,
	stat: Stats
) => T;

type AsyncCallback<T> = Callback<T | Promise<T>>;

export type ScanDirectoryCallback = AsyncCallback<
	ScanDirectoryCallbackStringResult | undefined
>;

export type ScanDirectorySyncCallback = Callback<
	ScanDirectoryCallbackStringResult | undefined
>;

/**
 * Reusable functions
 */
function cleanPath(path: string): string {
	if (path.length && path.slice(-1) !== '/') {
		return path + '/';
	}
	return path;
}

function isHidden(filename: string) {
	return filename.slice(0, 1) === '.';
}

interface SplitResult {
	ext: string;
	file: string;
}
function split(filename: string): SplitResult {
	const parts = filename.split('.');
	const ext = parts.length > 1 ? '.' + (parts.pop() as string) : '';
	const file = parts.join('.');
	return { ext, file };
}

function isIgnoredResult(result: unknown) {
	return result === undefined || result === false || result === null;
}

/**
 * Find all files in directory
 */
export async function scanDirectory(
	path: string,
	callback?: AsyncCallback<ScanDirectoryCallbackStringResult>,
	subdirs?: boolean
): Promise<string[]>;
export async function scanDirectory<T>(
	path: string,
	callback: AsyncCallback<T | ScanDirectoryCallbackFalseResult>,
	subdirs?: boolean
): Promise<T[]>;
export async function scanDirectory(
	path: string,
	callback?: ScanDirectoryCallback,
	subdirs = true
): Promise<unknown[]> {
	const results: unknown[] = [];
	path = cleanPath(path);

	async function scan(subdir: string): Promise<void> {
		const files = await fs.readdir(path + subdir);
		for (let i = 0; i < files.length; i++) {
			const filename = files[i];
			if (isHidden(filename)) {
				// Exclude hidden items
				continue;
			}

			const stat = await fs.stat(path + subdir + filename);
			if (stat.isDirectory()) {
				if (subdirs) {
					await scan(subdir + filename + '/');
				}
				continue;
			}

			if (!stat.isFile()) {
				continue;
			}

			const { ext, file } = split(filename);

			// Callback
			let callbackResult: ReturnType<ScanDirectoryCallback>;
			if (callback) {
				callbackResult = callback(ext, file, subdir, path, stat);
				if (callbackResult instanceof Promise) {
					callbackResult = await callbackResult;
				}

				if (isIgnoredResult(callbackResult)) {
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

/**
 * Find all files in directory, synchronously
 */
export function scanDirectorySync(
	path: string,
	callback?: Callback<ScanDirectoryCallbackStringResult>,
	subdirs?: boolean
): string[];
export function scanDirectorySync<T>(
	path: string,
	callback: Callback<T | ScanDirectoryCallbackFalseResult>,
	subdirs?: boolean
): T[];
export function scanDirectorySync(
	path: string,
	callback?: ScanDirectorySyncCallback,
	subdirs = true
): unknown[] {
	const results: unknown[] = [];
	path = cleanPath(path);

	function scan(subdir: string): void {
		const files = readdirSync(path + subdir);
		for (let i = 0; i < files.length; i++) {
			const filename = files[i];
			if (isHidden(filename)) {
				// Exclude hidden items
				continue;
			}

			const stat = statSync(path + subdir + filename);
			if (stat.isDirectory()) {
				if (subdirs) {
					scan(subdir + filename + '/');
				}
				continue;
			}

			if (!stat.isFile()) {
				continue;
			}

			const { ext, file } = split(filename);

			// Callback
			let callbackResult: ReturnType<ScanDirectorySyncCallback>;
			if (callback) {
				callbackResult = callback(ext, file, subdir, path, stat);

				if (isIgnoredResult(callbackResult)) {
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

	scan('');
	return results;
}
