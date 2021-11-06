import { promises as fs } from 'fs';
import {
	ExportTargetOptions,
	prepareDirectoryForExport,
} from '../../export/helpers/prepare';
import type { DocumentNotModified } from '../types/modified';
import { getGitHubRepoHash } from './hash';
import type { GitHubAPIOptions } from './types';
import { downloadFile } from '../api/download';
import { unzip } from '../helpers/unzip';

/**
 * Options for downloadGitRepo()
 */
export interface DownloadGitHubRepoOptions
	extends ExportTargetOptions,
		GitHubAPIOptions {
	// Download only if it was modified since hash
	ifModifiedSince?: string;

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
export interface DownloadGitHubRepoResult {
	rootDir: string;
	actualDir: string;
	hash: string;
}

/**
 * Find matching directories
 */
async function findMatchingDirs(
	rootDir: string,
	hash: string
): Promise<string[]> {
	const search = '-' + hash;
	const matches: string[] = [];
	const files = await fs.readdir(rootDir);
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		if (file.slice(0 - search.length) !== search) {
			continue;
		}
		const stat = await fs.lstat(rootDir + '/' + file);
		if (stat.isDirectory()) {
			matches.push(file);
		}
	}
	return matches;
}

/**
 * Download GitHub repo using API
 */
export async function downloadGitHubRepo(
	options: DownloadGitHubRepoOptions
): Promise<DownloadGitHubRepoResult | DocumentNotModified> {
	// Check for last commit
	const hash = await getGitHubRepoHash(options);

	if (options.ifModifiedSince && hash === options.ifModifiedSince) {
		return 'not_modified';
	}

	// Replace hash in target
	options.target = options.target.replace('{hash}', hash);

	// Prepare target directory
	const rootDir = (options.target = await prepareDirectoryForExport(options));

	// Archive name
	const zipTarget = rootDir + '/' + hash + '.zip';

	// Check if archive exists
	let exists = false;
	try {
		const stat = await fs.lstat(zipTarget);
		exists = stat.isFile();
	} catch (err) {
		//
	}

	// Download file
	if (!exists) {
		const uri = `https://codeload.github.com/${options.user}/${options.repo}/zip/${hash}`;
		await downloadFile(
			{
				uri,
			},
			zipTarget
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
			} catch (err) {
				//
			}
		}
	}

	// Unpack it
	await unzip(zipTarget, rootDir);

	// Get actual dir
	const matchingDirs = await findMatchingDirs(rootDir, hash);
	if (matchingDirs.length !== 1) {
		throw new Error(`Error unpacking ${hash}.zip`);
	}
	const actualDir = rootDir + '/' + matchingDirs[0];

	return {
		rootDir,
		actualDir,
		hash,
	};
}