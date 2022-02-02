import {
	downloadGitHubRepo,
	DownloadGitHubRepoOptions,
	DownloadGitHubRepoResult,
} from './github';
import {
	downloadGitRepo,
	DownloadGitRepoOptions,
	DownloadGitRepoResult,
} from './git';
import {
	downloadNPMPackage,
	DownloadNPMPackageOptions,
	DownloadNPMPackageResult,
} from './npm';
import type { DocumentNotModified } from './types/modified';
import type { DownloadSourceMixin, DownloadSourceType } from './types/sources';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertNever(v: never) {
	//
}

/**
 * Add downloadType to options
 */
type ExtendedDownloadGitRepoOptions = DownloadGitRepoOptions &
	DownloadSourceMixin<'git'>;
type ExtendedDownloadGitHubRepoOptions = DownloadGitHubRepoOptions &
	DownloadSourceMixin<'github'>;
type ExtendedDownloadNPMPackageOptions = DownloadNPMPackageOptions &
	DownloadSourceMixin<'npm'>;

export type DownloadOptions<T extends DownloadSourceType> = T extends 'git'
	? ExtendedDownloadGitRepoOptions
	: T extends 'github'
	? ExtendedDownloadGitHubRepoOptions
	: T extends 'npm'
	? ExtendedDownloadNPMPackageOptions
	: never;

/**
 * Result type from downloadType
 */
export type DownloadResult<T extends DownloadSourceType> = T extends 'git'
	? DownloadGitRepoResult
	: T extends 'github'
	? DownloadGitHubRepoResult
	: T extends 'npm'
	? DownloadNPMPackageResult
	: never;

export function downloadPackage<T extends 'git'>(
	options: DownloadOptions<T>
): Promise<DocumentNotModified | DownloadResult<T>>;
export function downloadPackage<T extends 'github'>(
	options: DownloadOptions<T>
): Promise<DocumentNotModified | DownloadResult<T>>;
export function downloadPackage<T extends 'npm'>(
	options: DownloadOptions<T>
): Promise<DocumentNotModified | DownloadResult<T>>;
export function downloadPackage<T extends DownloadSourceType>(
	options: DownloadOptions<T>
): Promise<DocumentNotModified | DownloadResult<T>> {
	const type = options.downloadType;
	switch (type) {
		case 'git': {
			return downloadGitRepo(options) as Promise<
				DocumentNotModified | DownloadResult<T>
			>;
		}

		case 'github':
			return downloadGitHubRepo(options) as Promise<
				DocumentNotModified | DownloadResult<T>
			>;

		case 'npm':
			return downloadNPMPackage(options) as Promise<
				DocumentNotModified | DownloadResult<T>
			>;

		default:
			assertNever(type);
			throw new Error(`Invalid download type: ${type}`);
	}
}
