import { promises as fs } from 'fs';
import type { NPMPackageOptions } from './types';
import { execAsync } from '../../misc/exec';

export interface GetNPMVersionResult {
	// Version
	version: string;

	// URL of file
	file?: string;
}

/**
 * Get version of package from NPM registry
 */
export async function getNPMVersion(
	options: NPMPackageOptions
): Promise<GetNPMVersionResult> {
	const tag = options.tag || 'latest';
	const result = await execAsync(`npm view ${options.package}@${tag} --json`);
	const data = JSON.parse(result.stdout);
	return {
		version: data.version,
		file: data.dist?.tarball,
	};
}

/**
 * Get version of package from filename
 */
export async function getPackageVersion(target: string): Promise<string> {
	return JSON.parse(await fs.readFile(target + '/package.json', 'utf8'))
		.version;
}
