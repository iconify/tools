import { resolveModule } from 'local-pkg';
import { promises as fs } from 'fs';

let cache: string;

async function getVersion(): Promise<string> {
	const packageName = '@iconify/types/package.json';
	const filename = resolveModule(packageName);
	if (!filename) {
		throw new Error(`Cannot resolve ${packageName}`);
	}
	const content = JSON.parse(await fs.readFile(filename, 'utf8')) as Record<
		string,
		unknown
	>;
	return (cache = content.version as string);
}

/**
 * Get current version of Iconify Types package
 */
export async function getTypesVersion(): Promise<string> {
	throw new Error(
		`getTypesVersion() is deprecated, use wildcard to make packages work with all versions`
	);
	return cache || (await getVersion());
}
