import { promises as fs } from 'fs';
import {
	ExportTargetOptions,
	prepareDirectoryForExport,
} from '../../export/helpers/prepare';
import { execAsync } from '../../misc/exec';
import type { DocumentNotModified } from '../types/modified';
import { getGitRepoHash } from './hash';

/**
 * Options for cloneGitRepo()
 */
export interface CloneGitRepoOptions extends ExportTargetOptions {
	// Repository
	remote: string;

	// Branch to clone
	branch: string;

	// Clone only if it was modified since hash
	// If true, checked against file stored in target directory

	// Important: this function doesn't verify if target directory has correct branch
	// cloned, so do not use the same target directory for different repos or branches.
	ifModifiedSince?: string | true;

	// Log commands
	log?: boolean;
}

/**
 * Result
 */
export interface CloneGitRepoResult {
	target: string;
	hash: string;
}

/**
 * Clone Git repo
 */
export async function cloneGitRepo(
	options: CloneGitRepoOptions
): Promise<CloneGitRepoResult | DocumentNotModified> {
	const { remote, branch } = options;

	// Check for last commit
	if (options.ifModifiedSince) {
		try {
			// Get expected hash
			const expectedHash =
				options.ifModifiedSince === true
					? await getGitRepoHash(options)
					: options.ifModifiedSince;

			// Get actual hash
			const result = await execAsync(
				`git ls-remote ${remote} --branch ${branch}`
			);
			const parts = result.stdout.split(/\s/);
			const latestHash = parts.shift();

			if (latestHash === expectedHash) {
				return 'not_modified';
			}
		} catch (err) {
			//
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
