import { promises as fs } from 'fs';
import {
	ExportTargetOptions,
	prepareDirectoryForExport,
} from '../../export/helpers/prepare';
import type { DocumentNotModified } from '../types/modified';
import { getGitLabRepoHash } from './hash';
import { defaultGitLabBaseURI, GitLabAPIOptions } from './types';
import { downloadFile } from '../api/download';
import { unzip, type UnzipFilterCallback } from '../helpers/unzip';
import type { DownloadSourceMixin } from '../types/sources';

interface IfModifiedSinceOption {
	// Download only if it was modified since hash
	ifModifiedSince: string | DownloadGitLabRepoResult;

	// Filter files
	filter?: UnzipFilterCallback;
}

/**
 * Options for downloadGitLabRepo()
 */
export interface DownloadGitLabRepoOptions
	extends ExportTargetOptions,
		GitLabAPIOptions,
		Partial<IfModifiedSinceOption> {
	// Removes old files. Default = false
	cleanupOldFiles?: boolean;

	// Removes old directories. Default = true
	cleanupOldDirectories?: boolean;

	// Log commands
	log?: boolean;
}

/**
 * Result
 */
export interface DownloadGitLabRepoResult
	extends DownloadSourceMixin<'gitlab'> {
	rootDir: string;
	contentsDir: string;
	hash: string;
}

/**
 * Find matching directories
 */
async function findMatchingDirs(
	rootDir: string,
	hash: string
): Promise<string[]> {
	const matches: string[] = [];
	const files = await fs.readdir(rootDir);
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const lastChunk = file.split('-').pop() as string;
		if (
			lastChunk.length < 4 ||
			lastChunk !== hash.slice(0, lastChunk.length)
		) {
			continue;
		}
		const stat = await fs.stat(rootDir + '/' + file);
		if (stat.isDirectory()) {
			matches.push(file);
		}
	}
	return matches;
}

/**
 * Download GitLab repo using API
 */
export async function downloadGitLabRepo<
	T extends IfModifiedSinceOption & DownloadGitLabRepoOptions,
>(options: T): Promise<DownloadGitLabRepoResult | DocumentNotModified>;
export async function downloadGitLabRepo(
	options: DownloadGitLabRepoOptions
): Promise<DownloadGitLabRepoResult>;
export async function downloadGitLabRepo(
	options: DownloadGitLabRepoOptions
): Promise<DownloadGitLabRepoResult | DocumentNotModified> {
	// Check for last commit
	const hash = await getGitLabRepoHash(options);

	const ifModifiedSince = options.ifModifiedSince;
	if (ifModifiedSince) {
		const expectedHash: string | null =
			typeof ifModifiedSince === 'string'
				? ifModifiedSince
				: ifModifiedSince.downloadType === 'gitlab'
					? ifModifiedSince.hash
					: null;
		if (hash === expectedHash) {
			return 'not_modified';
		}
	}

	// Replace hash in target
	options.target = options.target.replace('{hash}', hash);

	// Prepare target directory
	const rootDir = (options.target = await prepareDirectoryForExport(options));

	// Archive name
	const archiveTarget = rootDir + '/' + hash + '.zip';

	// Check if archive exists
	let exists = false;
	try {
		const stat = await fs.stat(archiveTarget);
		exists = stat.isFile();
	} catch {
		//
	}

	// Download file
	if (!exists) {
		const uri = `${options.uri || defaultGitLabBaseURI}/${
			options.project
		}/repository/archive.zip?sha=${hash}`;
		await downloadFile(
			{
				uri,
				headers: {
					Authorization: 'token ' + options.token,
				},
			},
			archiveTarget
		);
	}

	// Clean up old directories
	const files = await fs.readdir(rootDir);
	const hashSearch = '-' + hash;
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		if (file === hash + '.zip') {
			continue;
		}
		const filename = rootDir + '/' + files[i];
		const stat = await fs.lstat(filename);
		const isDir = stat.isDirectory();
		if (
			// Remove symbolic links
			stat.isSymbolicLink() ||
			// Remove if directory matches hash to avoid errors extracting zip
			(isDir && filename.slice(0 - hashSearch.length) === hashSearch) ||
			// Remove if directory and cleanupOldDirectories is not disabled
			(isDir && options.cleanupOldDirectories !== false) ||
			// Remove if file and cleanupOldFiles is enabled
			(!isDir && options.cleanupOldFiles)
		) {
			try {
				await fs.rm(filename, {
					force: true,
					recursive: true,
				});
			} catch {
				//
			}
		}
	}

	// Unpack it
	await unzip(archiveTarget, rootDir, options.filter);

	// Get actual dir
	const matchingDirs = await findMatchingDirs(rootDir, hash);
	if (matchingDirs.length !== 1) {
		throw new Error(`Error unpacking ${hash}.zip`);
	}
	const contentsDir = rootDir + '/' + matchingDirs[0];

	return {
		downloadType: 'gitlab',
		rootDir,
		contentsDir,
		hash,
	};
}
