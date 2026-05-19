import fs from 'node:fs/promises';
import type { NPMPackageOptions } from './types.js';
import { execAsync } from '../../misc/exec.js';
import { getFetch } from '../api/fetch.js';

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
	const packageName = options.package;

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

	let data: NPMViewResponse;
	if (options.fetch) {
		// Fetch from registry.npmjs.org
		const fetch = getFetch();
		data = (await fetch(
			`https://registry.npmjs.org/${packageName}/${tag}`
		).then((res) => res.json())) as NPMViewResponse;
	} else {
		// Execute 'npm' command
		const result = await execAsync(
			`npm view ${packageName}@${tag} --json`,
			{
				maxBuffer: 1024 * 1024 * 8,
			}
		);
		data = JSON.parse(result.stdout) as NPMViewResponse;
	}

	return {
		version: data.version,
		file:
			data.dist?.tarball ??
			`https://registry.npmjs.org/${packageName}/-/${packageName.split('/').pop()!}-${data.version}.tgz`,
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
