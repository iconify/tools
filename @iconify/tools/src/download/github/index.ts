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
// import { sendAPIQuery } from '../api';

interface IfModifiedSinceOption {
	// Download only if it was modified since hash
	ifModifiedSince: string;
}

/**
 * Options for downloadGitRepo()
 */
export interface DownloadGitHubRepoOptions
	extends ExportTargetOptions,
		GitHubAPIOptions,
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
 * Download GitHub repo using API
 */
export async function downloadGitHubRepo<
	T extends IfModifiedSinceOption & DownloadGitHubRepoOptions
>(options: T): Promise<DownloadGitHubRepoResult | DocumentNotModified>;
export async function downloadGitHubRepo(
	options: DownloadGitHubRepoOptions
): Promise<DownloadGitHubRepoResult>;
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
	const archiveTarget = rootDir + '/' + hash + '.zip';

	// Check if archive exists
	let exists = false;
	try {
		const stat = await fs.stat(archiveTarget);
		exists = stat.isFile();
	} catch (err) {
		//
	}

	// Download file
	if (!exists) {
		const uri = `https://api.github.com/repos/${options.user}/${options.repo}/zipball/${hash}`;
		// const uri = `https://codeload.github.com/${options.user}/${options.repo}/zip/${hash}`;
		await downloadFile(
			{
				uri,
				headers: {
					Accept: 'application/vnd.github.v3+json',
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
			} catch (err) {
				//
			}
		}
	}

	// Unpack it
	await unzip(archiveTarget, rootDir);

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
