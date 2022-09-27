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

	interface NPMViewResponse {
		'name': string;
		'dist-tags': Record<string, string>;
		'versions': string[];
		'time': Record<string, string>;
		'version': string;
		'dist'?: {
			integrity: string;
			shasum: string;
			tarball: string;
			fileCount: number;
			unpackedSize: number;
		};
	}
	const data = JSON.parse(result.stdout) as NPMViewResponse;
	return {
		version: data.version,
		file: data.dist?.tarball,
	};
}

/**
 * Get version of package from filename
 */
export async function getPackageVersion(target: string): Promise<string> {
	interface PackageContent {
		name: string;
		version: string;
	}
	return (
		JSON.parse(
			await fs.readFile(target + '/package.json', 'utf8')
		) as PackageContent
	).version;
}
