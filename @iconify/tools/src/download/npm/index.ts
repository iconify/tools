import { promises as fs } from 'fs';
import {
	ExportTargetOptions,
	normalizeDir,
	prepareDirectoryForExport,
} from '../../export/helpers/prepare';
import { execAsync } from '../../misc/exec';
import { downloadFile } from '../api/download';
import { untar } from '../helpers/untar';
import type { DocumentNotModified } from '../types/modified';
import { getNPMVersion, getPackageVersion } from './version';

interface IfModifiedSinceOption {
	// Clone only if it was modified since version
	// If true, checked against latest file stored in target directory
	ifModifiedSince: string | true;
}

/**
 * Options for downloadNPMPackage()
 */
export interface DownloadNPMPackageOptions
	extends ExportTargetOptions,
		Partial<IfModifiedSinceOption> {
	// Package
	package: string;

	// Tag, default is 'latest'
	tag?: string;

	// Log commands
	log?: boolean;
}

/**
 * Result
 */
export interface DownloadNPMPackageResult {
	rootDir: string;
	actualDir: string;
	version: string;
}

/**
 * Download NPM package
 */
export async function downloadNPMPackage<
	T extends IfModifiedSinceOption & DownloadNPMPackageOptions
>(options: T): Promise<DownloadNPMPackageResult | DocumentNotModified>;
export async function downloadNPMPackage(
	options: DownloadNPMPackageOptions
): Promise<DownloadNPMPackageResult>;
export async function downloadNPMPackage(
	options: DownloadNPMPackageOptions
): Promise<DownloadNPMPackageResult | DocumentNotModified> {
	const packageName = options.package;
	const tag = options.tag || 'latest';
	const rootDir = (options.target = normalizeDir(options.target));
	const actualDir = rootDir + '/package';

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

	// Get archive location
	const viewResult = await execAsync(`npm view ${packageName}@${tag} --json`);
	const packageInfo = JSON.parse(viewResult.stdout);

	const version = packageInfo.version;
	const archiveURL = packageInfo.dist.tarball;
	const archiveTarget = rootDir + '/' + version + '.tgz';

	// Check if archive exists
	let archiveExists = false;
	try {
		const stat = await fs.lstat(archiveTarget);
		archiveExists = stat.isFile();
	} catch (err) {
		//
	}

	// Download file
	if (!archiveExists) {
		await downloadFile(
			{
				uri: archiveURL,
				headers: {
					Accept: 'application/tar+gzip',
				},
			},
			archiveTarget
		);
	}

	// Remove old unpacked file
	await prepareDirectoryForExport({
		target: actualDir,
		cleanup: true,
	});

	// Unpack file
	await untar(archiveTarget, rootDir);

	return {
		rootDir,
		actualDir,
		version,
	};
}
