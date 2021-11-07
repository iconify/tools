import { promises as fs } from 'fs';
import {
	ExportTargetOptions,
	prepareDirectoryForExport,
} from '../../export/helpers/prepare';
import { execAsync } from '../../misc/exec';
import type { DocumentNotModified } from '../types/modified';
import { getGitRepoHash } from './hash';

interface IfModifiedSinceOption {
	// Download only if it was modified since hash
	// If true, checked against file stored in target directory

	// Important: this function doesn't verify if target directory has correct branch,
	// so do not use the same target directory for different repos or branches.
	ifModifiedSince: string | true;
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
export async function downloadGitRepo<T extends IfModifiedSinceOption>(
	options: T
): Promise<DownloadGitRepoResult | DocumentNotModified>;
export async function downloadGitRepo(
	options: DownloadGitRepoOptions
): Promise<DownloadGitRepoResult>;
export async function downloadGitRepo(
	options: DownloadGitRepoOptions
): Promise<DownloadGitRepoResult | DocumentNotModified> {
	const { remote, branch } = options;

	// Check for last commit
	const hasHashInTarget = options.target.indexOf('{hash}') !== -1;
	if (options.ifModifiedSince || hasHashInTarget) {
		// Get actual hash
		const result = await execAsync(
			`git ls-remote ${remote} --branch ${branch}`
		);
		const parts = result.stdout.split(/\s/);
		const latestHash = parts.shift() as string;
		if (hasHashInTarget) {
			options.target = options.target.replace('{hash}', latestHash);
		}

		if (options.ifModifiedSince) {
			try {
				// Get expected hash
				const expectedHash =
					options.ifModifiedSince === true
						? await getGitRepoHash(options)
						: options.ifModifiedSince;

				if (latestHash === expectedHash) {
					return 'not_modified';
				}
			} catch (err) {
				//
			}
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

	// Get latest hash
	const hash = await getGitRepoHash(options);

	return {
		target,
		hash,
	};
}
