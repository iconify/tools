import { resolveModule } from 'local-pkg';
import { promises as fs } from 'fs';

let cache: string;

async function getVersion(): Promise<string> {
	const packageName = '@iconify/types/package.json';
	const filename = resolveModule(packageName);
	if (!filename) {
		throw new Error(`Cannot resolve ${packageName}`);
	}
	const content = JSON.parse(await fs.readFile(filename, 'utf8'));
	return (cache = content.version as string);
}

/**
 * Get current version of Iconify Types package
 */
export async function getTypesVersion(): Promise<string> {
	return cache || (await getVersion());
}
