import {
	ExportTargetOptions,
	normalizeDir,
	prepareDirectoryForExport,
} from '../../export/helpers/prepare';
import { execAsync } from '../../misc/exec';
import type { DocumentNotModified } from '../types/modified';
import { getNPMVersion, getPackageVersion } from './version';

/**
 * Options for cloneNPMPackage()
 */
export interface CloneNPMPackageOptions extends ExportTargetOptions {
	// Package
	package: string;

	// Tag, default is 'latest'
	tag?: string;

	// Clone only if it was modified since version
	// If true, checked against latest file stored in target directory
	ifModifiedSince?: string | true;

	// Log commands
	log?: boolean;
}

/**
 * Result
 */
export interface CloneNPMPackageResult {
	rootDir: string;
	actualDir: string;
	version: string;
}

/**
 * Clone Git repo
 */
export async function cloneNPMPackage(
	options: CloneNPMPackageOptions
): Promise<CloneNPMPackageResult | DocumentNotModified> {
	const packageName = options.package;
	const tag = options.tag || 'latest';
	const rootDir = (options.target = normalizeDir(options.target));
	const actualDir = rootDir + '/node_modules/' + packageName;

	// Check for version
	if (options.ifModifiedSince) {
		try {
			const expectedVersion =
				options.ifModifiedSince === true
					? await getPackageVersion(actualDir)
					: options.ifModifiedSince;
			const latestVersion = (await getNPMVersion(options)).version;
			if (latestVersion === expectedVersion) {
				return 'not_modified';
			}
		} catch (err) {
			//
		}
	}

	// Prepare target directory
	await prepareDirectoryForExport(options);

	// Check if directory is empty if directory wasn't cleaned up
	if (options.log) {
		console.log(`Installing ${packageName}@${tag} to ${rootDir}`);
	}
	await execAsync(
		`npm install --prefix "${rootDir}" ${packageName}@${tag} --no-audit --ignore-scripts --no-save --omit dev --no-bin-links`
	);

	// Get latest version
	const version = await getPackageVersion(actualDir);

	return {
		rootDir,
		actualDir,
		version,
	};
}
