import { promises as fs } from 'fs';
import {
	ExportTargetOptions,
	normalizeDir,
	prepareDirectoryForExport,
} from '../../export/helpers/prepare';
import { downloadFile } from '../api/download';
import { untar } from '../helpers/untar';
import type { DocumentNotModified } from '../types/modified';
import type { DownloadSourceMixin } from '../types/sources';
import { getNPMVersion, getPackageVersion } from './version';

interface IfModifiedSinceOption {
	// Clone only if it was modified since version
	// If true, checked against latest file stored in target directory
	ifModifiedSince: string | true | DownloadNPMPackageResult;
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
export interface DownloadNPMPackageResult extends DownloadSourceMixin<'npm'> {
	rootDir: string;
	contentsDir: string;
	version: string;
}

/**
 * Download NPM package
 */
export async function downloadNPMPackage<
	T extends IfModifiedSinceOption & DownloadNPMPackageOptions,
>(options: T): Promise<DownloadNPMPackageResult | DocumentNotModified>;
export async function downloadNPMPackage(
	options: DownloadNPMPackageOptions
): Promise<DownloadNPMPackageResult>;
export async function downloadNPMPackage(
	options: DownloadNPMPackageOptions
): Promise<DownloadNPMPackageResult | DocumentNotModified> {
	const rootDir = (options.target = normalizeDir(options.target));
	const contentsDir = rootDir + '/package';

	// Get latest location
	const versionInfo = await getNPMVersion(options);
	const version = versionInfo.version;

	// Check downloaded copy
	const ifModifiedSince = options.ifModifiedSince;
	if (ifModifiedSince) {
		try {
			let expectedVersion: string | null;
			if (typeof ifModifiedSince === 'object') {
				// Make sure result object matches
				if (
					ifModifiedSince.downloadType === 'npm' &&
					ifModifiedSince.rootDir === rootDir &&
					ifModifiedSince.contentsDir === contentsDir
				) {
					expectedVersion = ifModifiedSince.version;
				} else {
					expectedVersion = null;
				}
			} else {
				expectedVersion =
					ifModifiedSince === true
						? await getPackageVersion(contentsDir)
						: ifModifiedSince;
			}
			if (version === expectedVersion) {
				return 'not_modified';
			}
		} catch (err) {
			// Clean up on error
			options.cleanup = true;
		}
	}

	const archiveURL = versionInfo.file;
	if (!archiveURL) {
		throw new Error(
			`NPM registry did not provide link to package archive.`
		);
	}
	const archiveTarget = rootDir + '/' + version + '.tgz';

	// Prepare target directory
	await prepareDirectoryForExport(options);

	// Check if archive exists
	let archiveExists = false;
	try {
		const stat = await fs.stat(archiveTarget);
		archiveExists = stat.isFile();
	} catch (err) {
		//
	}

	// Download file
	if (!archiveExists) {
		if (options.log) {
			console.log(`Downloading ${archiveURL}`);
		}
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
		target: contentsDir,
		cleanup: true,
	});

	// Unpack file
	if (options.log) {
		console.log(`Unpacking ${archiveTarget}`);
	}
	await untar(archiveTarget, rootDir);

	return {
		downloadType: 'npm',
		rootDir,
		contentsDir,
		version,
	};
}
