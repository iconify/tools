import { readFile } from 'node:fs/promises';
import { uniquePromise } from '@cyberalien/svg-utils';

let cache: string;

interface PackageContent {
	version: string;
}

async function getVersion(): Promise<string> {
	const packageName = '@iconify/types/package.json';
	const content = await uniquePromise<PackageContent>(
		packageName,
		async () => {
			const filename = import.meta.resolve(packageName);
			return JSON.parse(
				await readFile(filename.replace('file://', ''), 'utf8')
			) as PackageContent;
		}
	);
	return (cache = content.version);
}

/**
 * Get current version of Iconify Types package
 */
export async function getTypesVersion(): Promise<string> {
	return cache || (await getVersion());
}
