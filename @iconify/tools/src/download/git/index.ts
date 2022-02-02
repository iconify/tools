import { promises as fs } from 'fs';
import {
	ExportTargetOptions,
	prepareDirectoryForExport,
} from '../../export/helpers/prepare';
import { execAsync } from '../../misc/exec';
import type { DocumentNotModified } from '../types/modified';
import { getGitRepoBranch } from './branch';
import { getGitRepoHash } from './hash';

interface IfModifiedSinceOption {
	// Download only if it was modified since hash
	// If true, checked against file stored in target directory
	ifModifiedSince: string | true | DownloadGitRepoResult;
}

/**
 * Options for downloadGitRepo()
 */
export interface DownloadGitRepoOptions
	extends ExportTargetOptions,
		Partial<IfModifiedSinceOption> {
	// Repository
	remote: string;

	// Branch
	branch: string;

	// Log commands
	log?: boolean;
}

/**
 * Result
 */
export interface DownloadGitRepoResult {
	target: string;
	hash: string;
}

/**
 * Download Git repo
 */
export async function downloadGitRepo<
	T extends IfModifiedSinceOption & DownloadGitRepoOptions
>(options: T): Promise<DownloadGitRepoResult | DocumentNotModified>;
export async function downloadGitRepo(
	options: DownloadGitRepoOptions
): Promise<DownloadGitRepoResult>;
export async function downloadGitRepo(
	options: DownloadGitRepoOptions
): Promise<DownloadGitRepoResult | DocumentNotModified> {
	const { remote, branch } = options;

	// Check for last commit
	const hasHashInTarget = options.target.indexOf('{hash}') !== -1;
	const ifModifiedSince = options.ifModifiedSince;
	if (ifModifiedSince || hasHashInTarget) {
		// Get actual hash
		const result = await execAsync(
			`git ls-remote ${remote} --branch ${branch}`
		);
		const parts = result.stdout.split(/\s/);
		const latestHash = parts.shift() as string;
		if (hasHashInTarget) {
			options.target = options.target.replace('{hash}', latestHash);
		}

		try {
			// Make sure correct branch is checked out. This will throw error if branch is not available
			await getGitRepoBranch(options, branch);

			if (ifModifiedSince) {
				// Get expected hash
				const expectedHash: string =
					ifModifiedSince === true
						? await getGitRepoHash(options)
						: typeof ifModifiedSince === 'string'
						? ifModifiedSince
						: ifModifiedSince.hash;

				if (latestHash === expectedHash) {
					return 'not_modified';
				}
			}
		} catch (err) {
			// Cleanup on error
			options.cleanup = true;
		}
	}

	// Prepare target directory
	const target = (options.target = await prepareDirectoryForExport(options));

	// Check if directory is empty if directory wasn't cleaned up
	const files = options.cleanup ? [] : await fs.readdir(target);
	if (!files.length) {
		if (options.log) {
			console.log(`Cloning ${remote}#${branch} to ${target}`);
		}
		await execAsync(
			`git clone --branch ${branch} --no-tags --depth 1 ${remote} "${target}"`
		);
	}

	// Get latest hash and make sure correct branch is available
	const hash = await getGitRepoHash(options);
	await getGitRepoBranch(options, branch);

	return {
		target,
		hash,
	};
}
