import { promises as fs } from 'fs';
import { createHash } from 'crypto';
import type { APICacheOptions, APIQueryParams } from './types';
import { scanDirectory } from '../../misc/scan';

const cacheVersion = 1;

interface StoredFile {
	filename: string;
	expires: number;
}
const storedFiles = Object.create(null) as Record<
	string,
	Record<string, StoredFile>
>;

interface StoredContent {
	version: number;
	expires: number;
	data: string;
}

/**
 * Unique key
 */
export function apiCacheKey(query: APIQueryParams): string {
	const item = JSON.stringify({
		uri: query.uri,
		params: query.params?.toString(),
		headers: query.headers,
	});
	return createHash('md5').update(item).digest('hex');
}

/**
 * Store cache
 */
export async function storeAPICache(
	options: APICacheOptions,
	key: string,
	data: string
): Promise<void> {
	const expires = Date.now() + options.ttl * 1000;
	const filename =
		options.dir + '/' + key + '.' + expires.toString() + '.json';
	if (!storedFiles[options.dir]) {
		await getStoredFiles(options.dir);
	}

	const content: StoredContent = {
		version: cacheVersion,
		expires,
		data,
	};
	await fs.writeFile(filename, JSON.stringify(content, null, 4), 'utf8');
	storedFiles[options.dir][key] = {
		filename,
		expires,
	};
}

/**
 * Get item from cache
 */
export async function getAPICache(
	dir: string,
	key: string
): Promise<string | null> {
	if (!storedFiles[dir]) {
		await getStoredFiles(dir);
	}
	const item = storedFiles[dir][key];
	if (!item) {
		return null;
	}
	const time = Date.now();

	try {
		const content = JSON.parse(
			await fs.readFile(item.filename, 'utf8')
		) as StoredContent;
		return content.version === cacheVersion && content.expires > time
			? content.data
			: null;
	} catch {
		return null;
	}
}

/**
 * Clear cache
 */
export function clearAPICache(dir: string): Promise<void> {
	return getStoredFiles(dir, true);
}

/**
 * Find all stored files
 */
async function getStoredFiles(dir: string, clear = false): Promise<void> {
	const storage =
		(!clear && storedFiles[dir]) ||
		(Object.create(null) as Record<string, StoredFile>);
	const time = Date.now();
	storedFiles[dir] = storage;

	// Create directory if missing
	try {
		await fs.mkdir(dir, {
			recursive: true,
		});
	} catch {
		//
	}

	// Find all files
	await scanDirectory(
		dir,
		async (ext, file, subdir, path) => {
			if (ext !== '.json') {
				return false;
			}

			const filename = path + subdir + file + ext;
			const parts = file.split('.');
			const expires = parseInt(parts.pop() as string);
			if (clear || expires < time || parts.length !== 1) {
				// Expired or invalid or cleaning up cache
				await fs.unlink(filename);
				return false;
			}

			// Valid
			const cacheKey = parts[0];
			storage[cacheKey] = {
				filename,
				expires,
			};
		},
		false
	);
}
